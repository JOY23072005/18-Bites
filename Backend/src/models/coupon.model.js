import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    /* =====================
       BASIC INFO
    ===================== */
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    /* =====================
       DISCOUNT CONFIG
    ===================== */
    discountType: {
      type: String,
      enum: ["flat", "percentage"],
      required: true
    },

    discountValue: {
      type: Number,
      required: true
    },

    maxDiscount: {
      type: Number,
      default: null // applicable for percentage coupons
    },

    minOrderValue: {
      type: Number,
      default: 0
    },

    /* =====================
       VALIDITY
    ===================== */
    validFrom: {
      type: Date,
      required: true
    },

    validUntil: {
      type: Date,
      required: true
    },

    /* =====================
       USAGE LIMITS
    ===================== */
    maxUses: {
      type: Number,
      default: null // null = unlimited
    },

    usedCount: {
      type: Number,
      default: 0
    },

    /* =====================
       STATUS
    ===================== */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
