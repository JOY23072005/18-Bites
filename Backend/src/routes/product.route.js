import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const ProdRoutes = express.Router();

/**
 * =====================
 * PUBLIC ROUTES
 * =====================
 */

// GET /api/products
ProdRoutes.get("/", getAllProducts);

// GET /api/products/:id
ProdRoutes.get("/:id", getProductById);

// GET /api/products/category/:categoryId
ProdRoutes.get("/category/:categoryId", getProductsByCategory);

/**
 * =====================
 * ADMIN ROUTES
 * =====================
 */

// POST /api/products
ProdRoutes.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);

// PUT /api/products/:id
ProdRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProduct
);

// DELETE /api/products/:id
ProdRoutes.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

export default ProdRoutes;
