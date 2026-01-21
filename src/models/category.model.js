import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.index({ isActive: 1 });

export default mongoose.model("Category", categorySchema);
