import mongoose from 'mongoose';

const paymentInstructionsSchema = new mongoose.Schema(
  {
    primary: { type: String, required: true, trim: true },
    backup: { type: String, trim: true, default: '' },
    diaspora: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const ticketTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    sold: { type: Number, default: 0, min: 0 },
    saleEndsAt: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: false }
);

const giftOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    emoji: { type: String, trim: true, default: '🎁' },
    amount: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: false }
);

const spaceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['card', 'event'], required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    description: { type: String, required: true, trim: true },
    theme: { type: String, required: true, trim: true },
    coverImageUrl: { type: String, trim: true, default: '' },
    accent: { type: String, trim: true, default: 'electric-lime' },
    currency: { type: String, trim: true, uppercase: true, default: 'KES' },
    goal: { type: Number, default: 0 },
    visibilityMode: {
      type: String,
      enum: ['Names + Amounts', 'Names Only', 'Hidden Publicly'],
      default: 'Names Only',
    },
    location: { type: String, trim: true, default: '' },
    eventDate: { type: String, trim: true, default: '' },
    doorsOpen: { type: String, trim: true, default: '' },
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: 0, min: 0 },
    ageRestriction: { type: String, trim: true, default: '18+' },
    ticketTiers: { type: [ticketTierSchema], default: [] },
    giftOptions: { type: [giftOptionSchema], default: [] },
    dundaTarget: { type: Number, default: 0, min: 0 },
    dundaReward: { type: String, trim: true, default: '' },
    squadSize: { type: Number, default: 5, min: 2 },
    squadReward: { type: String, trim: true, default: 'Squad leader gets a free upgrade' },
    showAttendees: { type: Boolean, default: true },
    allowGifting: { type: Boolean, default: true },
    allowSquads: { type: Boolean, default: true },
    paymentInstructions: { type: paymentInstructionsSchema, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    memories: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

spaceSchema.index({ organizer: 1, status: 1, createdAt: -1 });
spaceSchema.index({ type: 1, status: 1, eventDate: 1 });

export const Space = mongoose.model('Space', spaceSchema);
