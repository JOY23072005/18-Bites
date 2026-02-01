import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

export const Limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: process.env.REQUEST_LIMIT,
    message: {
        message: "Too many password reset requests. Try again later.",
    },
});