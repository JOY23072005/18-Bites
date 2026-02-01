import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { uploadBannerImages } from "../middlewares/upload.middleware";
import { addHomeBanner, updateHomeVideo } from "../controllers/home.controller";

const HomeRoutes = express.Router();

HomeRoutes.get("/", getHomeBanner);
HomeRoutes.post("/", authMiddleware, adminMiddleware,uploadBannerImages,addHomeBanner );
HomeRoutes.put("/video", authMiddleware, adminMiddleware, updateHomeVideo);

export default HomeRoutes;