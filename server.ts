import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import { AfterShip } from "aftership";
import twilio from "twilio";
import Razorpay from "razorpay";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Set up Nodemailer for Hostinger SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // API Routes
  
  // 0. General Email Sending (Transactional Emails: Welcome, Order Confirmation, etc.)
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html } = req.body;
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ error: "SMTP credentials not configured in environment variables." });
    }

    try {
      const info = await transporter.sendMail({
        from: `"Craftifue" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 1. Custom Admin Password Reset Flow (Backend)
  app.post("/api/admin/forgot-password", async (req, res) => {
    const { email } = req.body;
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ error: "SMTP credentials not configured." });
    }

    try {
      // Create a secure token using crypto
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = Date.now() + 3600000; // 1 hour from now
      
      // In a real flow, you would save this token temporarily to a secure database 
      // table like `password_resets` mapped to the admin's UUID/Email.
      // await db.collection('password_resets').add({ email, token: resetToken, expires: tokenExpiry });
      
      // Send the recovery email
      const resetLink = `https://craftifue.store/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      const mailOptions = {
        from: `"Craftifue Admin" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Admin Portal - Password Recovery",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #4a5d23; font-size: 24px;">Craftifue Admin Portal</h2>
            </div>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">You requested a password reset for your admin account. Click the button below to set a new password.</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetLink}" style="background-color: #4a5d23; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px;">If you did not request this, you can safely ignore this email. This link will expire in 1 hour.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      
      // Respond affirmatively immediately to avoid email enumeration
      res.json({ success: true, message: "If an admin account is registered with this email, a reset link with instructions has been sent to your inbox." });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Gemini AI Proxy
  app.post("/api/gemini", async (req, res) => {
    const { contents, model = "gemini-1.5-flash" } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: model,
        contents: contents,
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 1. AfterShip Tracking
  app.get("/api/tracking/:trackingNumber", async (req, res) => {
    const { trackingNumber } = req.params;
    const aftershipKey = process.env.AFTERSHIP_API_KEY;
    
    if (!aftershipKey) {
      return res.status(500).json({ error: "AfterShip key not configured" });
    }

    try {
      const aftership = new AfterShip(aftershipKey);
      const result = await aftership.tracking.getTracking({
        tracking_number: trackingNumber
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Twilio SMS
  app.post("/api/send-sms", async (req, res) => {
    const { to, message } = req.body;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !token || !from) {
      return res.status(500).json({ error: "Twilio credentials not configured" });
    }

    try {
      const client = twilio(sid, token);
      const result = await client.messages.create({
        body: message,
        to: to,
        from: from
      });
      res.json({ success: true, sid: result.sid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Placeholder for Zevu API
  app.post("/api/zevu", async (req, res) => {
    res.json({ message: "Zevu integration endpoint ready. Please provide specific API documentation or requirements for Zevu." });
  });

  // 4. Razorpay Integration
  app.post("/api/create-razorpay-order", async (req, res) => {
    const { amount, currency = "INR", receipt } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: "Razorpay keys not configured" });
    }

    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Amount must be at least 100 paise" });
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount,
        currency,
        receipt,
      });

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/verify-razorpay-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(500).json({ error: "Razorpay secret not configured" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required verification fields" });
    }

    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  });

  // Serve static files in production or if dist exists
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(distPath);

  if (isProduction || hasDist) {
    if (!hasDist) {
      console.warn('Production mode but dist/ folder not found!');
    }
    console.log('Serving static files from', distPath);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log('Development mode: Using Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server environment: ${process.env.NODE_ENV}`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
