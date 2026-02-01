import bcrypt from "bcryptjs"

import { generateAccessToken, generateRefreshToken, hashToken} from "../lib/utils/token.js";
import { generateOTP, sendOtpEmail } from "../lib/utils/email.js";

import { connectDB } from "../lib/db.js"
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import RefreshToken from "../models/refreshToken.model.js"

import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, phone, password } = req.body || {};

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    await connectDB();

    const emailOtp = await OTP.findOne({
      identifier: email,
      verified: true,
      purpose: "SIGNUP"
    });

    if (!emailOtp) {
      return res.status(400).json({ message: "Email OTP not verified" });
    }

    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isEmailVerified: true
    });

    await OTP.deleteMany({ identifier: email });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(
        Date.now() + process.env.REFRESH_TOKEN_EXPIRES_DAYS * 86400000
      )
    });

    res.status(201).json({
      success: true,
      userId: user._id,
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, phone, password } = req.body || {};

  if (!password || (!email && !phone)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  await connectDB();

  const user = await User.findOne({
    $or: [{ email }, { phone }]
  }).select("+password");

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await RefreshToken.deleteMany({ user: user._id });

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(
      Date.now() + process.env.REFRESH_TOKEN_EXPIRES_DAYS * 86400000
    )
  });

  res.json({
    success: true,
    accessToken,
    refreshToken
  });
};

export const changePass = async (req, res) => {
    const { oldpass, newpass } = req.body || {} ;

    if (!oldpass || !newpass) {
        return res.status(400).json({
            message: "Old password and new password are required."
        });
    }

    if (newpass.length < 6) {
        return res.status(400).json({
            message: "New password must be at least 6 characters."
        });
    }

    try {

        await connectDB();

        const userId = req.userId;
        const user = await User.findById(userId).select("+password");

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isCorrect = await bcrypt.compare(oldpass, user.password);
        if (!isCorrect) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        const hashedPassword = await bcrypt.hash(newpass, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("changePass error:", error.message);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const requestOtp = async (req, res) => {
    const { email, phone, purpose } = req.body || {} ;
    const identifier = phone || email;

    if (!identifier || !purpose) {
        return res.status(400).json({ message: "Identifier and purpose are required" });
    }

    if (!["LOGIN", "SIGNUP", "RESET_PASSWORD"].includes(purpose)) {
        return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    await connectDB();

    const user = email?await User.findOne({ email }): await User.findOne({ phone })

    // Purpose-based validation
    if ((purpose === "LOGIN" || purpose === "RESET_PASSWORD") && !user) {
        return res.status(400).json({ message: "User does not exist" });
    }

    if (purpose === "SIGNUP" && user) {
        return res.status(400).json({ message: "User already exists. Please login" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove old OTPs for same identifier + purpose
    await OTP.deleteMany({ identifier, purpose });

    await OTP.create({
        identifier,
        otp,
        purpose,
        expiresAt,
        verified: false,
    });
    // console.log(email,otp);
    if(email) await sendOtpEmail({ to: email, otp: otp });

    return res.json({
        success: true,
        message: "OTP sent successfully",
    });
};

export const verifyOtp = async (req, res) => {
  const { email, phone, otp, purpose } = req.body || {};
  const identifier = phone || email;

  await connectDB();

  const record = await OTP.findOne({
    identifier,
    purpose,
    expiresAt: { $gt: new Date() }
  });

  if (!record || record.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  record.verified = true;
  await record.save();

  if (purpose !== "LOGIN") {
    return res.json({ success: true, message: "OTP verified" });
  }

  const user = email?await User.findOne({ email }): await User.findOne({ phone })

  if (!user) return res.status(400).json({ message: "User not found" });

  await OTP.deleteOne({ _id: record._id });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await RefreshToken.deleteMany({ user: user._id });

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(
      Date.now() + process.env.REFRESH_TOKEN_EXPIRES_DAYS * 86400000
    )
  });

  res.json({ accessToken, refreshToken });
};

export const resetPass = async (req, res) => {
    const { email, phone, newpass } = req.body || {} ;
    const identifier = phone || email;

    if (!identifier || !newpass ) {
        return res.status(400).json({ message: "Invalid request" });
    }

    if (newpass.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    await connectDB();

    const otpRecord = await OTP.findOne({
        identifier,
        purpose: "RESET_PASSWORD",
        verified: true,
    });

    if (!otpRecord) {
        return res.status(400).json({ message: "OTP verification required" });
    }

    const user = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newpass, 10);
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate OTP after use
    await OTP.deleteMany({ identifier, purpose: "RESET_PASSWORD" });

    return res.json({
        success: true,
        message: "Password reset successful",
    });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return res.sendStatus(403);
  }

  await connectDB();

  const tokenHash = hashToken(refreshToken);

  const existing = await RefreshToken.findOneAndDelete({
    user: payload.userId,
    tokenHash,
    expiresAt: { $gt: new Date() }
  });

  if (!existing) return res.sendStatus(403);

  const newAccessToken = generateAccessToken(payload.userId);
  const newRefreshToken = generateRefreshToken(payload.userId);

  await RefreshToken.create({
    user: payload.userId,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(
      Date.now() + process.env.REFRESH_TOKEN_EXPIRES_DAYS * 86400000
    )
  });

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(204);

  await connectDB();

  await RefreshToken.deleteOne({
    tokenHash: hashToken(refreshToken)
  });

  res.json({ message: "Logged out successfully" });
};