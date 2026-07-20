import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { Space } from '../models/Space.js';
import { DundaOrder } from '../models/DundaOrder.js';
import { DundaSquad } from '../models/DundaSquad.js';
import {
  assertTicketAvailability,
  calculateOrderTotal,
  paymentReference,
  progressPercent,
  shortCode,
  slugify,
  squadCode,
  ticketCodes,
} from '../services/dunda.service.js';

const router = express.Router();

const ticketTierSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(160).optional().default(''),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1).max(100000),
  saleEndsAt: z.string().optional().default(''),
});

const giftOptionSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(160).optional().default(''),
  emoji: z.string().max(8).optional().default('🎁'),
  amount: z.coerce.number().min(0),
});

const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1200),
  location: z.string().min(2).max(140),
  eventDate: z.string().min(4),
  doorsOpen: z.string().max(20).optional().default(''),
  theme: z.string().max(40).optional().default('Dunda Night'),
  coverImageUrl: z.string().url().or(z.literal('')).optional().default(''),
  capacity: z.coerce.number().int().min(1).max(500000),
  ageRestriction: z.string().max(20).optional().default('18+'),
  dundaTarget: z.coerce.number().int().min(0).optional().default(0),
  dundaReward: z.string().max(180).optional().default(''),
  squadSize: z.coerce.number().int().min(2).max(50).optional().default(5),
  squadReward: z.string().max(180).optional().default('Squad leader gets a free upgrade'),
  ticketTiers: z.array(ticketTierSchema).min(1).max(8),
  giftOptions: z.array(giftOptionSchema).max(12).optional().default([]),
  allowGifting: z.boolean().optional().default(true),
  allowSquads: z.boolean().optional().default(true),
  showAttendees: z.boolean().optional().default(true),
  status: z.enum(['draft', 'published']).optional().default('published'),
});

const checkoutSchema = z.object({
  kind: z.enum(['ticket', 'gift']),
  buyerName: z.string().min(2).max(80),
  phone: z.string().min(7).max(24),
  email: z.string().email().or(z.literal('')).optional().default(''),
  publicName: z.string().max(80).optional().default(''),
  quantity: z.coerce.number().int().min(1).max(20).optional().default(1),
  ticketTierId: z.string().optional().default(''),
  giftOptionId: z.string().optional().default(''),
  customGiftAmount: z.coerce.number().min(100).max(10000000).optional(),
  message: z.string().max(280).optional().default(''),
  squadCode: z.string().max(20).optional().default(''),
  referralCode: z.string().max(30).optional().default(''),
  paymentMethod: z.enum(['mpesa', 'card', 'cash', 'test']).optional().default('mpesa'),
});

function ownedEventQuery(user) {
  return user.role === 'admin' ? {} : { organizer: user._id };
}

async function uniqueSlug(title) {
  const base = slugify(title) || 'dunda-event';
  let slug = base;
  let count = 2;
  while (await Space.exists({ slug })) {
    slug = `${base}-${count}`;
    count += 1;
  }
  return slug;
}

router.get('/events', asyncHandler(async (req, res) => {
  const events = await Space.find({ type: 'event', status: 'published' })
    .select('title slug description location eventDate doorsOpen coverImageUrl ticketTiers capacity theme')
    .sort({ eventDate: 1 })
    .limit(24)
    .lean();

  res.json({ events });
}));

router.post('/events', requireAuth, asyncHandler(async (req, res) => {
  const input = createEventSchema.parse(req.body);
  const slug = await uniqueSlug(input.title);
  const event = await Space.create({
    ...input,
    type: 'event',
    slug,
    price: input.ticketTiers[0].price,
    goal: 0,
    paymentInstructions: {
      primary: 'Secure M-Pesa or card checkout',
      backup: 'Contact organiser for assisted checkout',
      diaspora: 'International card checkout',
    },
    organizer: req.user._id,
  });

  res.status(201).json({ event, publicUrl: `/e/${event.slug}` });
}));

router.get('/events/:slug', asyncHandler(async (req, res) => {
  const event = await Space.findOne({ slug: req.params.slug, type: 'event', status: 'published' })
    .populate('organizer', 'fullName')
    .lean();
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  const [ticketSummary, giftSummary, squadRows, recentOrders] = await Promise.all([
    DundaOrder.aggregate([
      { $match: { event: event._id, kind: 'ticket', status: 'paid' } },
      { $group: { _id: null, tickets: { $sum: '$quantity' }, revenue: { $sum: '$amount' } } },
    ]),
    DundaOrder.aggregate([
      { $match: { event: event._id, kind: 'gift', status: 'paid' } },
      { $group: { _id: null, gifts: { $sum: 1 }, gifted: { $sum: '$amount' } } },
    ]),
    DundaOrder.aggregate([
      { $match: { event: event._id, kind: 'ticket', status: 'paid', squadCode: { $ne: '' } } },
      { $group: { _id: '$squadCode', members: { $sum: '$quantity' }, revenue: { $sum: '$amount' } } },
      { $sort: { members: -1, revenue: -1 } },
      { $limit: 10 },
    ]),
    DundaOrder.find({ event: event._id, kind: 'ticket', status: 'paid' })
      .select('buyerName publicName quantity squadCode createdAt')
      .sort({ createdAt: -1 })
      .limit(event.showAttendees ? 12 : 0)
      .lean(),
  ]);

  const tickets = ticketSummary[0]?.tickets || 0;
  const squads = await DundaSquad.find({ event: event._id }).select('name code rewardUnlocked').lean();
  const squadMap = new Map(squads.map((item) => [item.code, item]));
  const leaderboard = squadRows.map((row) => ({
    code: row._id,
    name: squadMap.get(row._id)?.name || row._id,
    members: row.members,
    rewardUnlocked: row.members >= event.squadSize,
  }));

  res.json({
    event,
    stats: {
      tickets,
      ticketRevenue: ticketSummary[0]?.revenue || 0,
      gifts: giftSummary[0]?.gifts || 0,
      gifted: giftSummary[0]?.gifted || 0,
      squads: squads.length,
      dundaProgress: progressPercent(tickets, event.dundaTarget),
    },
    leaderboard,
    attendees: recentOrders.map((order) => ({
      name: order.publicName || order.buyerName.split(' ')[0],
      quantity: order.quantity,
      squadCode: order.squadCode,
    })),
  });
}));

router.post('/events/:id/squads', asyncHandler(async (req, res) => {
  const input = z.object({
    name: z.string().min(2).max(60),
    leaderName: z.string().min(2).max(80),
    leaderPhone: z.string().min(7).max(24),
  }).parse(req.body);

  const event = await Space.findOne({ _id: req.params.id, type: 'event', status: 'published', allowSquads: true });
  if (!event) return res.status(404).json({ message: 'This event is not accepting squads.' });

  let code;
  do {
    code = squadCode(input.name);
  } while (await DundaSquad.exists({ event: event._id, code }));

  const squad = await DundaSquad.create({ event: event._id, code, ...input });
  res.status(201).json({ squad, sharePath: `/e/${event.slug}?squad=${code}` });
}));

router.post('/events/:id/checkout', asyncHandler(async (req, res) => {
  const input = checkoutSchema.parse(req.body);
  const event = await Space.findOne({ _id: req.params.id, type: 'event', status: 'published' });
  if (!event) return res.status(404).json({ message: 'Event not found or sales are closed.' });

  let unitAmount = 0;
  let ticketTier = null;
  let giftOption = null;
  let quantity = input.kind === 'gift' ? 1 : input.quantity;

  if (input.kind === 'ticket') {
    ticketTier = event.ticketTiers.id(input.ticketTierId);
    assertTicketAvailability(ticketTier, quantity);
    unitAmount = ticketTier.price;
  } else {
    if (!event.allowGifting) return res.status(400).json({ message: 'Gifting is disabled for this event.' });
    giftOption = input.giftOptionId ? event.giftOptions.id(input.giftOptionId) : null;
    unitAmount = input.customGiftAmount || giftOption?.amount || 0;
    if (unitAmount < 100) return res.status(400).json({ message: 'Select a gift or enter at least KSh 100.' });
  }

  const linkedSquad = input.squadCode
    ? await DundaSquad.findOne({ event: event._id, code: input.squadCode.trim().toUpperCase() })
    : null;

  const pricing = calculateOrderTotal(unitAmount, quantity, input.kind === 'gift' ? 0.03 : 0.05);
  const isDemoPayment = process.env.NODE_ENV !== 'production' || input.paymentMethod === 'test';
  const status = isDemoPayment ? 'paid' : 'pending';

  if (status === 'paid' && ticketTier) {
    const update = await Space.updateOne(
      {
        _id: event._id,
        ticketTiers: {
          $elemMatch: {
            _id: ticketTier._id,
            sold: { $lte: ticketTier.quantity - quantity },
            active: true,
          },
        },
      },
      { $inc: { 'ticketTiers.$.sold': quantity } }
    );
    if (!update.modifiedCount) return res.status(409).json({ message: 'Tickets sold out while you were checking out.' });
  }

  const order = await DundaOrder.create({
    event: event._id,
    kind: input.kind,
    buyerName: input.buyerName,
    phone: input.phone,
    email: input.email,
    publicName: input.publicName,
    ticketTierId: ticketTier?._id,
    ticketTierName: ticketTier?.name || '',
    giftName: giftOption?.name || (input.kind === 'gift' ? 'Custom gift' : ''),
    message: input.message,
    quantity,
    unitAmount: pricing.unitAmount,
    amount: pricing.total,
    currency: event.currency,
    paymentMethod: input.paymentMethod,
    paymentReference: paymentReference(),
    providerReference: isDemoPayment ? shortCode('DEMO') : '',
    status,
    ticketCodes: input.kind === 'ticket' ? ticketCodes(quantity) : [],
    squad: linkedSquad?._id,
    squadCode: linkedSquad?.code || '',
    referralCode: input.referralCode.trim().toUpperCase(),
    paidAt: status === 'paid' ? new Date() : undefined,
  });

  if (linkedSquad && status === 'paid') {
    const squadTickets = await DundaOrder.aggregate([
      { $match: { event: event._id, squadCode: linkedSquad.code, kind: 'ticket', status: 'paid' } },
      { $group: { _id: null, count: { $sum: '$quantity' } } },
    ]);
    if ((squadTickets[0]?.count || 0) >= event.squadSize && !linkedSquad.rewardUnlocked) {
      linkedSquad.rewardUnlocked = true;
      await linkedSquad.save();
    }
  }

  res.status(201).json({
    order: {
      reference: order.paymentReference,
      status: order.status,
      kind: order.kind,
      amount: order.amount,
      currency: order.currency,
      ticketCodes: order.status === 'paid' ? order.ticketCodes : [],
      ticketTierName: order.ticketTierName,
      giftName: order.giftName,
    },
    pricing,
    message: status === 'paid'
      ? input.kind === 'ticket' ? 'Payment confirmed. Your ticket is ready.' : 'Gift delivered successfully.'
      : 'Checkout created. Complete payment to receive your ticket.',
  });
}));

router.get('/orders/:reference', asyncHandler(async (req, res) => {
  const order = await DundaOrder.findOne({ paymentReference: req.params.reference })
    .populate('event', 'title slug eventDate location')
    .lean();
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({
    order: {
      reference: order.paymentReference,
      status: order.status,
      kind: order.kind,
      amount: order.amount,
      currency: order.currency,
      ticketCodes: order.status === 'paid' ? order.ticketCodes : [],
      ticketTierName: order.ticketTierName,
      giftName: order.giftName,
      event: order.event,
    },
  });
}));

router.get('/organiser/dashboard', requireAuth, asyncHandler(async (req, res) => {
  const events = await Space.find({ type: 'event', ...ownedEventQuery(req.user) }).sort({ createdAt: -1 }).lean();
  const eventIds = events.map((event) => event._id);
  const summaries = await DundaOrder.aggregate([
    { $match: { event: { $in: eventIds }, status: 'paid' } },
    { $group: {
      _id: '$event',
      revenue: { $sum: '$amount' },
      tickets: { $sum: { $cond: [{ $eq: ['$kind', 'ticket'] }, '$quantity', 0] } },
      gifts: { $sum: { $cond: [{ $eq: ['$kind', 'gift'] }, 1, 0] } },
    } },
  ]);
  const summaryMap = new Map(summaries.map((item) => [String(item._id), item]));
  res.json({
    events: events.map((event) => ({
      ...event,
      metrics: summaryMap.get(String(event._id)) || { revenue: 0, tickets: 0, gifts: 0 },
    })),
  });
}));

router.post('/events/:id/check-in', requireAuth, asyncHandler(async (req, res) => {
  const { code } = z.object({ code: z.string().min(6).max(40) }).parse(req.body);
  const event = await Space.findOne({ _id: req.params.id, type: 'event', ...ownedEventQuery(req.user) });
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  const normalisedCode = code.trim().toUpperCase();
  const order = await DundaOrder.findOne({ event: event._id, status: 'paid', ticketCodes: normalisedCode });
  if (!order) return res.status(404).json({ message: 'Ticket is invalid for this event.' });
  if (order.checkedInCodes.some((entry) => entry.code === normalisedCode)) {
    return res.status(409).json({ message: 'Ticket has already been checked in.' });
  }

  order.checkedInCodes.push({ code: normalisedCode, checkedInAt: new Date(), checkedInBy: req.user._id });
  await order.save();
  res.json({
    message: 'Check-in successful.',
    guest: order.buyerName,
    ticketTier: order.ticketTierName,
    code: normalisedCode,
  });
}));

export default router;
