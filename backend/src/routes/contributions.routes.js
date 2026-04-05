import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { upload } from '../middleware/upload.js';
import { Space } from '../models/Space.js';
import { Contribution } from '../models/Contribution.js';
import { requireAuth } from '../middleware/auth.js';
import { calculateRisk, createTicketCode } from '../utils/risk.js';

const router = express.Router();

const submitSchema = z.object({
  name: z.string().min(2),
  contact: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().nonnegative(),
  paymentMethod: z.string().min(2),
  transactionCode: z.string().min(2),
  message: z.string().optional().or(z.literal('')),
});

router.post('/spaces/:spaceId/contributions', upload.single('proof'), asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.spaceId);
  if (!space) {
    return res.status(404).json({ message: 'Space not found.' });
  }

  const data = submitSchema.parse(req.body);
  const contribution = await Contribution.create({
    space: space._id,
    name: data.name,
    contact: data.contact || '',
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    transactionCode: data.transactionCode.toUpperCase(),
    message: data.message || '',
    proofUrl: req.file ? `/uploads/${req.file.filename}` : '',
    proofFileName: req.file?.filename || '',
    objectType: space.type === 'event' ? 'Ticket' : ['Lantern', 'Star', 'Orb', 'Coral'][Math.floor(Math.random() * 4)],
  });

  space.memories = ['New proof submitted', ...(space.memories || [])].slice(0, 8);
  await space.save();

  res.status(201).json({ contribution });
}));

router.patch('/:id/status', requireAuth, asyncHandler(async (req, res) => {
  const payload = z.object({ status: z.enum(['Verified', 'Rejected']) }).parse(req.body);
  const contribution = await Contribution.findById(req.params.id).populate('space');
  if (!contribution) {
    return res.status(404).json({ message: 'Contribution not found.' });
  }

  const space = contribution.space;
  if (space.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only the owner or an admin can review this contribution.' });
  }

  contribution.status = payload.status;
  if (space.type === 'event' && payload.status === 'Verified' && !contribution.ticketCode) {
    contribution.ticketCode = createTicketCode(contribution.name);
  }
  await contribution.save();

  space.memories = [payload.status === 'Verified' ? 'Contribution approved' : 'Contribution rejected', ...(space.memories || [])].slice(0, 8);
  await space.save();

  res.json({ contribution });
}));

router.get('/mine/pending', requireAuth, asyncHandler(async (req, res) => {
  const spaces = await Space.find({ organizer: req.user._id }).select('_id');
  const spaceIds = spaces.map((space) => space._id);
  const contributions = await Contribution.find({ space: { $in: spaceIds }, status: 'Pending' }).populate('space', 'title type').sort({ createdAt: -1 });
  const allEntries = await Contribution.find({ space: { $in: spaceIds } }).lean();

  const enriched = contributions.map((item) => ({
    ...item.toObject(),
    risk: calculateRisk(item, allEntries),
  }));

  res.json({ contributions: enriched });
}));

export default router;
