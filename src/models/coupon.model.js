import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true
    },

    discountType: {
      type: String,
      enum: ["flat", "percent"]
    },

    discountValue: Number,

    expiresAt: Date,

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// ✅ Indexes
couponSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.model("Coupon", couponSchema);
