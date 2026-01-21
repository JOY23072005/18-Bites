import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const CategoryRoutes = express.Router();

CategoryRoutes.get("/", getCategories);
CategoryRoutes.post("/", authMiddleware, adminMiddleware, createCategory);
CategoryRoutes.put("/:id", authMiddleware, adminMiddleware, updateCategory);
CategoryRoutes.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default CategoryRoutes;
