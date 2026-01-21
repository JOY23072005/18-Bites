import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true, // faster lookup
    },

    otp: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["SIGNUP", "LOGIN", "RESET_PASSWORD"],
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent multiple active OTPs for same identifier + purpose
otpSchema.index(
  { identifier: 1, purpose: 1 },
  { unique: true }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
