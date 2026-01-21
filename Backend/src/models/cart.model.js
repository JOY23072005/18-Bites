import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: { type: Number, required: true },
  price: { type: mongoose.Schema.Types.Decimal128, required: true }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  totalPrice: { type: mongoose.Schema.Types.Decimal128, default: 0 }
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
