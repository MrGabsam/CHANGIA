import bcrypt from 'bcryptjs';
import { connectDb } from './config/db.js';
import { User } from './models/User.js';
import { Space } from './models/Space.js';
import { Contribution } from './models/Contribution.js';
import { DundaOrder } from './models/DundaOrder.js';
import { DundaSquad } from './models/DundaSquad.js';

async function seed() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Space.deleteMany({}),
    Contribution.deleteMany({}),
    DundaOrder.deleteMany({}),
    DundaSquad.deleteMany({}),
  ]);

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
    title: 'Afro Sunset Nairobi',
    slug: 'afro-sunset-nairobi',
    description: 'A premium rooftop Dunda blending Afrobeats, Amapiano, fashion, food and Nairobi sunset energy.',
    theme: 'Afro Future',
    currency: 'KES',
    goal: 0,
    visibilityMode: 'Names Only',
    location: 'Westlands, Nairobi',
    eventDate: '2026-08-22T20:00',
    doorsOpen: '7:00 PM',
    price: 1000,
    capacity: 600,
    ageRestriction: '18+',
    dundaTarget: 300,
    dundaReward: 'A surprise guest performance',
    squadSize: 5,
    squadReward: 'Squad leader gets a complimentary VIP upgrade',
    allowGifting: true,
    allowSquads: true,
    showAttendees: true,
    ticketTiers: [
      { name: 'Early Bird', description: 'Limited first release', price: 1000, quantity: 150, sold: 8 },
      { name: 'Regular', description: 'General admission', price: 1500, quantity: 350, sold: 0 },
      { name: 'VIP', description: 'Priority entry and premium lounge access', price: 3500, quantity: 100, sold: 2 },
    ],
    giftOptions: [
      { name: 'Bottle for the table', description: 'Add a bottle to the celebration', emoji: '🍾', amount: 5000 },
      { name: 'DJ dedication', description: 'Send a message with a song request', emoji: '🎧', amount: 1500 },
      { name: 'VIP upgrade', description: 'Upgrade someone special', emoji: '⭐', amount: 2500 },
    ],
    organizer: organizer._id,
    paymentInstructions: {
      primary: 'Secure M-Pesa or card checkout',
      backup: 'Contact organiser for assisted checkout',
      diaspora: 'International card checkout',
    },
    memories: ['Event created', 'First squad formed', 'First tickets sold'],
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
  ]);

  const squad = await DundaSquad.create({
    event: event._id,
    name: 'Team Rongai',
    code: 'TEAMR-26',
    leaderName: 'Mercy W.',
    leaderPhone: '0712000001',
    rewardUnlocked: true,
  });

  await DundaOrder.insertMany([
    {
      event: event._id,
      kind: 'ticket',
      buyerName: 'Mercy Wanjiku',
      phone: '0712000001',
      publicName: 'Mercy',
      ticketTierId: event.ticketTiers[0]._id,
      ticketTierName: 'Early Bird',
      quantity: 5,
      unitAmount: 1000,
      amount: 5250,
      currency: 'KES',
      paymentMethod: 'test',
      paymentReference: 'PAY-DEMO001',
      providerReference: 'DEMO-001',
      status: 'paid',
      ticketCodes: ['TIX-DEMO01', 'TIX-DEMO02', 'TIX-DEMO03', 'TIX-DEMO04', 'TIX-DEMO05'],
      squad: squad._id,
      squadCode: squad.code,
      paidAt: new Date(),
    },
    {
      event: event._id,
      kind: 'ticket',
      buyerName: 'Kevin Otieno',
      phone: '0712000002',
      publicName: 'Kev',
      ticketTierId: event.ticketTiers[2]._id,
      ticketTierName: 'VIP',
      quantity: 2,
      unitAmount: 3500,
      amount: 7350,
      currency: 'KES',
      paymentMethod: 'test',
      paymentReference: 'PAY-DEMO002',
      providerReference: 'DEMO-002',
      status: 'paid',
      ticketCodes: ['TIX-VIP001', 'TIX-VIP002'],
      paidAt: new Date(),
    },
    {
      event: event._id,
      kind: 'gift',
      buyerName: 'Amina Juma',
      phone: '0712000003',
      publicName: 'Amina',
      giftName: 'Bottle for the table',
      message: 'Turn up for us!',
      quantity: 1,
      unitAmount: 5000,
      amount: 5150,
      currency: 'KES',
      paymentMethod: 'test',
      paymentReference: 'PAY-DEMO003',
      providerReference: 'DEMO-003',
      status: 'paid',
      paidAt: new Date(),
    },
  ]);

  console.log('Seed complete');
  console.log('Public event: /e/afro-sunset-nairobi');
  console.log('Gate test code: TIX-DEMO01');
  console.log('Admin: admin@changia.app / Admin123!');
  console.log('Organizer: grace@changia.app / Organizer123!');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
