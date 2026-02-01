import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  deleteCategoryImage
} from "../controllers/category.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const CategoryRoutes = express.Router();

// RESTful 
CategoryRoutes.get("/", getCategories);
CategoryRoutes.post("/", authMiddleware, adminMiddleware, createCategory);
CategoryRoutes.put("/:id", authMiddleware, adminMiddleware, updateCategory);
CategoryRoutes.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);
// Image
CategoryRoutes.post("/:id/image",authMiddleware,adminMiddleware,uploadSingleImage,uploadCategoryImage);
CategoryRoutes.delete("/:id/image",authMiddleware,adminMiddleware,deleteCategoryImage);


export default CategoryRoutes;
