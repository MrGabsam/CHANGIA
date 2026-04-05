import mongoose from 'mongoose';

const paymentInstructionsSchema = new mongoose.Schema(
  {
    primary: { type: String, required: true, trim: true },
    backup: { type: String, trim: true, default: '' },
    diaspora: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const spaceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['card', 'event'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    theme: { type: String, required: true, trim: true },
    goal: { type: Number, default: 0 },
    visibilityMode: {
      type: String,
      enum: ['Names + Amounts', 'Names Only', 'Hidden Publicly'],
      default: 'Names Only',
    },
    location: { type: String, trim: true, default: '' },
    eventDate: { type: String, trim: true, default: '' },
    price: { type: Number, default: 0 },
    paymentInstructions: { type: paymentInstructionsSchema, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    memories: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Space = mongoose.model('Space', spaceSchema);
