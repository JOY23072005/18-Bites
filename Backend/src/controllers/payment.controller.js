import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import { connectDB } from "../lib/db.js";
import crypto from "crypto";
import { toDecimal, fromDecimal } from "../lib/utils/price.js";
import Product from "../models/product.model.js";

export const createPaymentIntent = async (req, res) => {
  const { paymentMethod, shippingAddress, couponCode } = req.body || {};

  try {
    await connectDB();

    const cart = await Cart.findOne({ user: req.userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 🔐 Step 1: Recalculate subtotal safely
    let subTotal = 0;

    const orderItems = cart.items.map(item => {
      if (!item.product || !item.product.isActive) {
        throw new Error("Invalid product in cart");
      }

      if (item.quantity > item.product.stock) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }

      const price = fromDecimal(item.product.price); // ✅ convert
      subTotal += price * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price // store Decimal128
      };
    });

    // 🔐 Step 2: Apply coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }

      if (coupon.minOrderValue && subTotal < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value is ₹${coupon.minOrderValue}`
        });
      }

      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      if (coupon.discountType === "flat") {
        discountAmount = coupon.discountValue;
      } else {
        discountAmount = (subTotal * coupon.discountValue) / 100;

        if (coupon.maxDiscount !== null) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      }

      discountAmount = Math.min(discountAmount, subTotal);

      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: toDecimal(discountAmount)
      };
    }

    const totalAmount = Math.max(subTotal - discountAmount, 0);

    // 🧾 Step 3: Create PENDING order (Decimal-safe)
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      subTotal: toDecimal(subTotal),
      discount: toDecimal(discountAmount),
      totalAmount: toDecimal(totalAmount),
      coupon: appliedCoupon
    });

    // 💳 Step 4: Payment gateway (mock)
    const paymentOrder = {
      id: crypto.randomUUID(),
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR"
    };

    res.json({
      success: true,
      orderId: order._id,
      paymentOrder,
      pricing: {
        subTotal,
        discount: discountAmount,
        totalAmount
      }
    });

  } catch (err) {
    console.error("createPaymentIntent:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature } = req.body || {};

  try {
    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔐 Prevent double processing
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // 🔐 Razorpay verification (enable in production)
    /*
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
    */

    // ✅ Mock verification
    if (!paymentId) {
      return res.status(400).json({ message: "Payment failed" });
    }

    // ✅ Mark order as paid
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paidAt = new Date();
    await order.save();

    // 📦 Deduct stock safely
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity } // prevent negative stock
        },
        { $inc: { stock: -item.quantity } }
      );
    }

    // 🧹 Clear cart (Decimal-safe)
    await Cart.findOneAndUpdate(
      { user: req.userId },
      { items: [], totalPrice: toDecimal(0) }
    );

    res.json({
      success: true,
      message: "Payment verified and order placed"
    });

  } catch (err) {
    console.error("verifyPayment:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};