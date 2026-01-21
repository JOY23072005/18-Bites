import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    comment: String
  },
  { timestamps: true }
);

// ✅ Indexes
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
