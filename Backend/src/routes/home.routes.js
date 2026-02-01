import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { uploadBannerImages } from "../middlewares/upload.middleware";
import { addHomeBanner } from "../controllers/home.controller";

HomeRoutes = express.Router();

HomeRoutes.get("/", getHomeConfig);
HomeRoutes.put("/", authMiddleware, adminMiddleware,uploadBannerImages,addHomeBanner );
