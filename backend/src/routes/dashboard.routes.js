import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { Space } from '../models/Space.js';
import { Contribution } from '../models/Contribution.js';
import { calculateRisk } from '../utils/risk.js';

const router = express.Router();

router.get('/summary', requireAuth, asyncHandler(async (req, res) => {
  const spaces = await Space.find({ organizer: req.user._id }).sort({ createdAt: -1 });
  const spaceIds = spaces.map((space) => space._id);
  const contributions = await Contribution.find({ space: { $in: spaceIds } }).populate('space', 'title type').sort({ createdAt: -1 });

  const verifiedRaised = contributions
    .filter((item) => item.status === 'Verified')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pending = contributions.filter((item) => item.status === 'Pending');
  const flags = contributions.filter((item) => calculateRisk(item, contributions) !== 'Green').length;

  res.json({
    summary: {
      spaces: spaces.length,
      verifiedRaised,
      participants: contributions.length,
      pending: pending.length,
      flags,
    },
    spaces,
    pending: pending.map((item) => ({
      ...item.toObject(),
      risk: calculateRisk(item, contributions),
    })),
  });
}));

export default router;
