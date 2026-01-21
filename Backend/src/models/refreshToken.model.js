import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tokenHash: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    revoked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// ✅ Indexes
refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 } // TTL
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
