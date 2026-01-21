import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin","super-admin"], default: "user" },
  phone: String,
  addresses: [addressSchema],
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

export default mongoose.model("User", userSchema);
