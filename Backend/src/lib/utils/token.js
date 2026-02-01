import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

console.log("Auth Object:", { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASS });

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId: userId}, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId: userId}, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS}d` }
    );
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};