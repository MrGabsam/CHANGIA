import bcrypt from 'bcryptjs';
import { connectDb } from './config/db.js';
import { User } from './models/User.js';
import { Space } from './models/Space.js';
import { Contribution } from './models/Contribution.js';

async function seed() {
  await connectDb();
  await Promise.all([User.deleteMany({}), Space.deleteMany({}), Contribution.deleteMany({})]);

  const admin = await User.create({
    fullName: 'Changia Admin',
    email: 'admin@changia.app',
    passwordHash: await bcrypt.hash('Admin123!', 10),
    role: 'admin',
    phone: '0700000000',
  });

  const organizer = await User.create({
    fullName: 'Grace Njeri',
    email: 'grace@changia.app',
    passwordHash: await bcrypt.hash('Organizer123!', 10),
    role: 'organizer',
    phone: '0712345678',
  });

  const card = await Space.create({
    type: 'card',
    title: 'Mary’s Graduation Fund',
    description: 'Help us celebrate Mary’s graduation with messages and support.',
    theme: 'Galaxy',
    goal: 50000,
    visibilityMode: 'Names Only',
    location: 'Nairobi',
    eventDate: '28 Jun 2026',
    price: 0,
    organizer: organizer._id,
    paymentInstructions: {
      primary: 'M-Pesa Till 123456',
      backup: 'Equity Bank 0112233445',
      diaspora: 'PayPal enabled',
    },
    memories: ['Card created', 'First message posted', 'Goal crossed 80%'],
  });

  const event = await Space.create({
    type: 'event',
    title: 'Changia Community Dinner',
    description: 'A premium dinner event with paid access and QR check-in.',
    theme: 'Neon City',
    goal: 0,
    visibilityMode: 'Names Only',
    location: 'Nairobi, Westlands',
    eventDate: '28 Jun 2026 · 6:00 PM',
    price: 3000,
    organizer: organizer._id,
    paymentInstructions: {
      primary: 'M-Pesa Paybill 654321 Account DINNER',
      backup: 'Co-op Bank 88771239',
      diaspora: 'PayPal enabled',
    },
    memories: ['Event created', 'First guest verified'],
  });

  await Contribution.insertMany([
    {
      space: card._id,
      name: 'Brian K.',
      contact: '0712345001',
      amount: 3000,
      status: 'Verified',
      paymentMethod: 'M-Pesa',
      transactionCode: 'QWE98TT',
      message: 'Congratulations Mary — so proud of you!',
      proofUrl: '/uploads/sample-proof.png',
      proofFileName: 'sample-proof.png',
      objectType: 'Lantern',
    },
    {
      space: card._id,
      name: 'Amina J.',
      contact: '0712345003',
      amount: 5000,
      status: 'Pending',
      paymentMethod: 'M-Pesa',
      transactionCode: 'QWE98TT',
      message: 'This is such a beautiful milestone. Keep shining.',
      proofUrl: '/uploads/sample-proof.png',
      proofFileName: 'sample-proof.png',
      objectType: 'Orb',
    },
    {
      space: event._id,
      name: 'Martin O.',
      contact: '0712456890',
      amount: 3000,
      status: 'Verified',
      paymentMethod: 'M-Pesa',
      transactionCode: 'DIN300A',
      message: 'See you there.',
      proofUrl: '/uploads/sample-proof.png',
      proofFileName: 'sample-proof.png',
      objectType: 'Ticket',
      ticketCode: 'QR-MART-214',
    },
  ]);

  console.log('Seed complete');
  console.log('Admin: admin@changia.app / Admin123!');
  console.log('Organizer: grace@changia.app / Organizer123!');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
