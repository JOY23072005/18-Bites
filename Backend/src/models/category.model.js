import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    slug: {
      type: String,
      unique: true
    },

    description: {
      type: String,
      trim: true
    },

    image: {
      url: {
          type: String,
          default: null,
      },
      publicId: {
          type: String,
          default: null,
      },
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// ✅ Indexes (define in ONE place only)
categorySchema.index({ isActive: 1 });

export default mongoose.model("Category", categorySchema);
