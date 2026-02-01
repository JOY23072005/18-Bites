import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const generateOTP = () => {
    // generates a 6-digit OTP (100000 - 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
});


const htmlTemplate=`<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size:14px; background:#f7f7f7; padding:20px;">
  <div style="max-width:420px; margin:auto; background:#ffffff; padding:24px; border-radius:8px;">

    <!-- Logo -->
    <a 
      href="https://rivods.com"
      target="_blank"
      rel="noopener"
      style="text-decoration:none; outline:none;"
    >
      <img
        src="https://res.cloudinary.com/dgwx34lqc/image/upload/v1767824458/Untitled-3-removebg-preview_yxqs5c.png"
        width="64"
        height="61"
        alt="Rivods"
        style="display:block; margin:0 auto;"
      />
    </a>

    <p style="padding-top:14px; border-top:1px solid #eaeaea; font-weight:600;">
      Your OTP Code
    </p>

    <p>Hello User,</p>

    <p>Your One-Time Password (OTP) for completing your action is:</p>

    <p style="font-size:24pt; font-weight:bold; letter-spacing:4px; margin:16px 0;">
      {{passcode}}
    </p>

    <p>Please use this code within the next <strong>10 minutes</strong>.</p>

    <p style="color:#555;">
      If you did not request this OTP, please ignore this email.<br />
      For your security, do not share this code with anyone.
    </p>

    <p>
      Thanks,<br />
      Team Rivods
    </p>

    <p style="font-size:12px; color:#999; text-align:center; margin-top:24px;">
      © {{year}} Rivods. All rights reserved.
    </p>

  </div>
</div>`

export const sendOtpEmail = async ({ to, otp }) => {
  try {
    // 1. Verify connection configuration
    await transporter.verify();
    console.log("SMTP ready to take our messages");

    // console.log(to,otp);

    // 2. Send the mail
    const info = await transporter.sendMail({
      // Use the same variable here as in the auth object
      from: `"Rivods" <${process.env.EMAIL_USER}>`, 
      to,
      subject: "Your OTP Code",
      html: htmlTemplate
        .replace("{{passcode}}", otp)
        .replace("{{year}}", new Date().getFullYear()),
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error; // Rethrow to handle in your route controller
  }
};
