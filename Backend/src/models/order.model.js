import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    quantity: Number,

    // Store final price per unit
    price: mongoose.Schema.Types.Decimal128
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },

    paymentMethod: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    // 💰 Pricing breakdown (IMPORTANT)
    subTotal: mongoose.Schema.Types.Decimal128,
    discount: mongoose.Schema.Types.Decimal128,
    totalAmount: mongoose.Schema.Types.Decimal128,

    // 🎟 Coupon snapshot (for audit/history)
    coupon: {
      code: String,
      discountType: { type: String, enum: ["flat", "percent"] },
      discountValue: Number,
      discountAmount: mongoose.Schema.Types.Decimal128
    },

    paidAt: Date
  },
  { timestamps: true }
);

// ✅ Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
