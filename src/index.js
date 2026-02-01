import express from "express";
import cors from "cors";

import AuthRoutes from "./routes/auth.route.js";
import UserRoutes from "./routes/user.route.js";
import CartRoutes from "./routes/cart.routes.js";
import ProdRoutes from "./routes/product.route.js";
import CouponRoutes from "./routes/coupon.route.js";
import CategoryRoutes from "./routes/category.route.js";
import ReviewRoutes from "./routes/review.route.js";
import PayRoutes from "./routes/payment.routes.js";
import HomeRoutes from "./routes/home.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/api/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/products", ProdRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/coupons", CouponRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/payment", PayRoutes);
app.use("/api/home",HomeRoutes);
app.listen('5001',()=>{
    console.log("server running");
})

export default app;