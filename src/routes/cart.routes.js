import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from "../controllers/cart.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const CartRoutes = express.Router();

/**
 * =====================
 * CART ROUTES (AUTH ONLY)
 * =====================
 */

// GET /api/cart
CartRoutes.get(
  "/",
  authMiddleware,
  getCart
);

// POST /api/cart/add
CartRoutes.post(
  "/add",
  authMiddleware,
  addToCart
);

// PUT /api/cart/update
CartRoutes.put(
  "/update",
  authMiddleware,
  updateCartItem
);

// DELETE /api/cart/remove/:productId
CartRoutes.delete(
  "/remove/:productId",
  authMiddleware,
  removeFromCart
);

// DELETE /api/cart/clear
CartRoutes.delete(
  "/clear",
  authMiddleware,
  clearCart
);

export default CartRoutes;
