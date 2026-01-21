import Coupon from "../models/coupon.model.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";

/**
 * =====================
 * CREATE COUPON (ADMIN)
 * =====================
 */
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, expiresAt } = req.body || {};

  if (!code || !discountType || discountValue == null || !expiresAt) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["flat", "percent"].includes(discountType)) {
    return res.status(400).json({ message: "Invalid discount type" });
  }

  if (discountValue <= 0) {
    return res.status(400).json({ message: "Discount must be positive" });
  }

  if (discountType === "percent" && discountValue > 100) {
    return res.status(400).json({ message: "Percent discount cannot exceed 100" });
  }

  try {
    await connectDB();

    const exists = await Coupon.exists({ code });
    if (exists) {
      return res.status(400).json({ message: "Coupon already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiresAt,
      isActive: true
    });

    res.status(201).json({ success: true, coupon });

  } catch (err) {
    console.error("createCoupon:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * LIST COUPONS (ADMIN)
 * =====================
 */
export const listCoupons = async (req, res) => {
  try {
    await connectDB();

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 });

    res.json({ success: true, coupons });

  } catch (err) {
    console.error("listCoupons:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * APPLY COUPON (PREVIEW ONLY)
 * =====================
 */
export const applyCoupon = async (req, res) => {
  const { code, amount } = req.body || {};

  if (!code || typeof amount !== "number" || amount < 0) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    await connectDB();

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    let discount = 0;

    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else {
      discount = (amount * coupon.discountValue) / 100;
    }

    discount = Math.min(discount, amount);

    res.json({
      success: true,
      discount,
      discountedAmount: amount - discount
    });

  } catch (err) {
    console.error("applyCoupon:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * DELETE COUPON (SOFT DELETE)
 * =====================
 */
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid coupon ID" });
  }

  try {
    await connectDB();

    await Coupon.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: "Coupon deactivated"
    });

  } catch (err) {
    console.error("deleteCoupon:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};