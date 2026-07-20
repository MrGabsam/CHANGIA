import mongoose from 'mongoose';

const dundaSquadSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    leaderName: { type: String, required: true, trim: true },
    leaderPhone: { type: String, required: true, trim: true },
    rewardUnlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

dundaSquadSchema.index({ event: 1, code: 1 }, { unique: true });
dundaSquadSchema.index({ event: 1, createdAt: -1 });

export const DundaSquad = mongoose.model('DundaSquad', dundaSquadSchema);
