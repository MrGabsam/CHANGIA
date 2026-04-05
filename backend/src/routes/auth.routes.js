import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional().or(z.literal('')),
});

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    passwordHash,
    phone: data.phone || '',
    role: 'organizer',
  });

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone },
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const data = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const matches = await bcrypt.compare(data.password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone },
  });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user });
}));

export default router;
