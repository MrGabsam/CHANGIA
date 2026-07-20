import mongoose from 'mongoose';

const dundaOrderSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    kind: { type: String, enum: ['ticket', 'gift'], required: true },
    buyerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    publicName: { type: String, trim: true, default: '' },
    ticketTierId: { type: mongoose.Schema.Types.ObjectId },
    ticketTierName: { type: String, trim: true, default: '' },
    giftName: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    quantity: { type: Number, default: 1, min: 1, max: 20 },
    unitAmount: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, trim: true, uppercase: true, default: 'KES' },
    paymentMethod: { type: String, enum: ['mpesa', 'card', 'cash', 'test'], default: 'mpesa' },
    paymentReference: { type: String, trim: true, required: true, unique: true },
    providerReference: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'], default: 'pending' },
    ticketCodes: [{ type: String, trim: true }],
    squad: { type: mongoose.Schema.Types.ObjectId, ref: 'DundaSquad' },
    squadCode: { type: String, trim: true, uppercase: true, default: '' },
    referralCode: { type: String, trim: true, uppercase: true, default: '' },
    checkedInCodes: [{ code: String, checkedInAt: Date, checkedInBy: mongoose.Schema.Types.ObjectId }],
    paidAt: { type: Date },
  },
  { timestamps: true }
);

dundaOrderSchema.index({ event: 1, status: 1, createdAt: -1 });
dundaOrderSchema.index({ event: 1, squadCode: 1, status: 1 });
dundaOrderSchema.index({ ticketCodes: 1 }, { sparse: true });

export const DundaOrder = mongoose.model('DundaOrder', dundaOrderSchema);
