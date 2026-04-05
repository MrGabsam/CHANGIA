import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Space } from '../models/Space.js';
import { Contribution } from '../models/Contribution.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const createSchema = z.object({
  type: z.enum(['card', 'event']),
  title: z.string().min(2),
  description: z.string().min(5),
  theme: z.string().min(2),
  goal: z.number().nonnegative().optional(),
  visibilityMode: z.enum(['Names + Amounts', 'Names Only', 'Hidden Publicly']),
  location: z.string().optional(),
  eventDate: z.string().optional(),
  price: z.number().nonnegative().optional(),
  paymentInstructions: z.object({
    primary: z.string().min(2),
    backup: z.string().optional(),
    diaspora: z.string().optional(),
  }),
});

router.get('/', asyncHandler(async (req, res) => {
  const { type, q } = req.query;
  const filter = { status: 'published' };
  if (type && ['card', 'event'].includes(type)) filter.type = type;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
    { theme: { $regex: q, $options: 'i' } },
  ];

  const spaces = await Space.find(filter)
    .populate('organizer', 'fullName email')
    .sort({ createdAt: -1 });

  const ids = spaces.map((space) => space._id);
  const contributions = await Contribution.find({ space: { $in: ids } }).lean();
  const bySpace = contributions.reduce((acc, item) => {
    const key = item.space.toString();
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});

  const payload = spaces.map((space) => {
    const entries = bySpace[space._id.toString()] || [];
    const verified = entries.filter((entry) => entry.status === 'Verified');
    return {
      ...space.toObject(),
      stats: {
        participants: entries.length,
        verifiedRaised: verified.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
        pending: entries.filter((entry) => entry.status === 'Pending').length,
      },
    };
  });

  res.json({ spaces: payload });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const spaces = await Space.find({ organizer: req.user._id }).sort({ createdAt: -1 });
  res.json({ spaces });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.id).populate('organizer', 'fullName email');
  if (!space) {
    return res.status(404).json({ message: 'Space not found.' });
  }
  const contributions = await Contribution.find({ space: space._id }).sort({ createdAt: -1 });
  res.json({ space, contributions });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const parsed = createSchema.parse({
    ...req.body,
    goal: req.body.goal !== undefined ? Number(req.body.goal) : 0,
    price: req.body.price !== undefined ? Number(req.body.price) : 0,
  });

  const space = await Space.create({
    ...parsed,
    organizer: req.user._id,
    memories: ['Space created'],
    goal: parsed.type === 'event' ? 0 : parsed.goal || 0,
    price: parsed.type === 'event' ? parsed.price || 0 : 0,
  });

  res.status(201).json({ space });
}));

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.id);
  if (!space) {
    return res.status(404).json({ message: 'Space not found.' });
  }
  if (space.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only the owner or an admin can update this space.' });
  }

  const allowed = ['title', 'description', 'theme', 'goal', 'visibilityMode', 'location', 'eventDate', 'price', 'paymentInstructions', 'status'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      space[key] = req.body[key];
    }
  }
  await space.save();
  res.json({ space });
}));

export default router;
