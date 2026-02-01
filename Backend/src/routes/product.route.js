import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  reorderProductImages,
  uploadProductsCSV
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { uploadCSV, uploadImages } from "../middlewares/upload.middleware.js";

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
// =====================
//    Product Images
// =====================

// Upload
ProdRoutes.post("/:id/images",authMiddleware,adminMiddleware,uploadImages,uploadProductImages);

// delete
ProdRoutes.delete("/:id/images",authMiddleware,adminMiddleware,deleteProductImage);

// reorder
ProdRoutes.put("/:id/images/reorder",authMiddleware,adminMiddleware,reorderProductImages);

// bulk processoor
ProdRoutes.post(
  "/bulk/upload-csv",
  authMiddleware,
  adminMiddleware,
  uploadCSV,
  uploadProductsCSV
);

export default ProdRoutes;
