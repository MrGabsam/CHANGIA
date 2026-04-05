import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    contact: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    paymentMethod: { type: String, required: true, trim: true },
    transactionCode: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
    proofUrl: { type: String, trim: true, default: '' },
    proofFileName: { type: String, trim: true, default: '' },
    objectType: { type: String, trim: true, default: 'Orb' },
    ticketCode: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

contributionSchema.index({ transactionCode: 1 });
contributionSchema.index({ space: 1, createdAt: -1 });

export const Contribution = mongoose.model('Contribution', contributionSchema);
