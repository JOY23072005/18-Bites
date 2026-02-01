import Coupon from "../models/coupon.model.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";

export const createCoupon = async (req, res) => {
  try {
    await connectDB();

    const {
      code,
      description = "",
      discountType,
      discountValue,
      minOrderValue = 0,
      maxDiscount = null,
      validFrom,
      validUntil,
      maxUses = null,
      isActive = true
    } = req.body || {};

    if (
      !code ||
      !discountType ||
      discountValue == null ||
      !validFrom ||
      !validUntil
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!["flat", "percentage"].includes(discountType)) {
      return res.status(400).json({ message: "Invalid discount type" });
    }

    if (discountValue <= 0) {
      return res.status(400).json({ message: "Discount must be positive" });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res.status(400).json({ message: "Percentage cannot exceed 100" });
    }

    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({ message: "Invalid validity period" });
    }

    const exists = await Coupon.exists({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "Coupon already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      validFrom,
      validUntil,
      maxUses,
      usedCount: 0,
      isActive
    });

    res.status(201).json({ success: true, coupon });

  } catch (err) {
    console.error("createCoupon:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listCoupons = async (req, res) => {
  try {
    await connectDB();

    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all" // active | expired | upcoming | all
    } = req.query;

    const now = new Date();
    const query = {};

    // Search
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Status filter
    if (status !== "all") {
      if (status === "active") {
        query.isActive = true;
        query.validFrom = { $lte: now };
        query.validUntil = { $gte: now };
      }
      if (status === "expired") {
        query.$or = [
          { validUntil: { $lt: now } },
          { isActive: false }
        ];
      }
      if (status === "upcoming") {
        query.validFrom = { $gt: now };
      }
    }

    const totalItems = await Coupon.countDocuments(query);

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        coupons,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (err) {
    console.error("listCoupons:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    await connectDB();

    const { code, amount } = req.body || {};
    const now = new Date();

    if (!code || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    if (coupon.minOrderValue && amount < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value is ₹${coupon.minOrderValue}`
      });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    let discount = 0;

    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== null) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    discount = Math.min(discount, amount);

    res.json({
      success: true,
      discount,
      discountedAmount: amount - discount
    });

  } catch (err) {
    console.error("applyCoupon:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid coupon ID" });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({
      success: true,
      message: "Coupon deactivated successfully"
    });

  } catch (err) {
    console.error("deleteCoupon:", err);
    res.status(500).json({ message: "Server error" });
  }
};