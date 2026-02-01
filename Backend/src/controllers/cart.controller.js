import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";
import { toDecimal, fromDecimal } from "../lib/utils/price.js";

/**
 * =====================
 * Helper: Recalculate cart total
 * =====================
 */
const recalculateTotal = (cart) => {
  let total = 0;

  for (const item of cart.items) {
    const price = fromDecimal(item.price);
    total += price * item.quantity;
  }

  cart.totalPrice = toDecimal(total);
};

/**
 * =====================
 * GET USER CART
 * =====================
 */
export const getCart = async (req, res) => {
  try {
    await connectDB();

    const cart = await Cart.findOne({ user: req.userId })
      .populate("items.product", "name price images stock");

    if (!cart) {
      return res.json({
        success: true,
        cart: { items: [], totalPrice: 0 }
      });
    }

    // Convert Decimal128 for response
    const responseCart = {
      ...cart.toObject(),
      totalPrice: fromDecimal(cart.totalPrice),
      items: cart.items.map(item => ({
        ...item.toObject(),
        price: fromDecimal(item.price)
      }))
    };

    res.json({ success: true, cart: responseCart });

  } catch (err) {
    console.error("getCart:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * ADD TO CART
 * =====================
 */
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(productId) || quantity <= 0) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    await connectDB();

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.userId,
        items: [],
        totalPrice: toDecimal(0)
      });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;

      if (newQty > product.stock) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      existingItem.quantity = newQty;
      existingItem.price = product.price; // Decimal128
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price // Decimal128
      });
    }

    recalculateTotal(cart);
    await cart.save();

    res.json({ success: true, cart });

  } catch (err) {
    console.error("addToCart:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * UPDATE CART ITEM
 * =====================
 */
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(productId) || quantity < 0) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    await connectDB();

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      i => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(
        i => i.product.toString() !== productId
      );
    } else {
      const product = await Product.findById(productId);
      if (!product || quantity > product.stock) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      item.quantity = quantity;
      item.price = product.price; // Decimal128
    }

    recalculateTotal(cart);
    await cart.save();

    res.json({ success: true, cart });

  } catch (err) {
    console.error("updateCartItem:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * REMOVE FROM CART
 * =====================
 */
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    await connectDB();

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    recalculateTotal(cart);
    await cart.save();

    res.json({ success: true, cart });

  } catch (err) {
    console.error("removeFromCart:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================
 * CLEAR CART
 * =====================
 */
export const clearCart = async (req, res) => {
  try {
    await connectDB();

    await Cart.findOneAndUpdate(
      { user: req.userId },
      { items: [], totalPrice: toDecimal(0) }
    );

    res.json({
      success: true,
      message: "Cart cleared"
    });

  } catch (err) {
    console.error("clearCart:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
