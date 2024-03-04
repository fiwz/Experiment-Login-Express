import mongoose from 'mongoose';

const BlacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      ref: "User",
    }
  },
  { timestamps: true }
);

export default mongoose.model("blacklistToken", BlacklistTokenSchema);