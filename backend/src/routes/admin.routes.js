import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { Space } from '../models/Space.js';
import { Contribution } from '../models/Contribution.js';
import { calculateRisk } from '../utils/risk.js';

const router = express.Router();

router.use(requireAuth, allowRoles('admin'));

router.get('/overview', asyncHandler(async (req, res) => {
  const [spaces, contributions] = await Promise.all([
    Space.find({}).sort({ createdAt: -1 }).populate('organizer', 'fullName email'),
    Contribution.find({}).populate('space', 'title type').sort({ createdAt: -1 }),
  ]);

  const flags = contributions.filter((item) => calculateRisk(item, contributions) !== 'Green');
  const duplicatesMap = contributions.reduce((acc, item) => {
    const code = String(item.transactionCode || '').trim().toUpperCase();
    if (!code) return acc;
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});

  const duplicates = Object.entries(duplicatesMap)
    .filter(([, count]) => count > 1)
    .map(([code, count]) => ({ code, count }));

  res.json({
    stats: {
      spaces: spaces.length,
      contributions: contributions.length,
      green: contributions.filter((item) => calculateRisk(item, contributions) === 'Green').length,
      yellow: contributions.filter((item) => calculateRisk(item, contributions) === 'Yellow').length,
      red: contributions.filter((item) => calculateRisk(item, contributions) === 'Red').length,
    },
    duplicates,
    flags: flags.map((item) => ({ ...item.toObject(), risk: calculateRisk(item, contributions) })),
    spaces,
  });
}));

export default router;
