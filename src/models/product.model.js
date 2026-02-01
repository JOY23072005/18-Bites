import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    SKU: {type: String,required: true, unique: true},

    name: { type: String, required: true },

    description: String,

    price: { type: mongoose.Schema.Types.Decimal128, required: true },

    stock: { type: Number, required: true },

    images: [
      {
        url: String,
        publicId: String
      }
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },

    ratings: { type: Number, default: 0 },

    numReviews: { type: Number, default: 0 },

    isFeatured: {
      type: Boolean,
      default: false
    },

    soldCount: {
      type: Number,
      default: 0
    },

    lastSoldAt: Date,

    hotDealDate: {
      type: Date,
      index: true
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// ✅ Indexes
productSchema.index({ name: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ isFeatured: 1 });

export default mongoose.model("Product", productSchema);
