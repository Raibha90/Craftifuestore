import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { AfterShip } from "aftership";
import twilio from "twilio";
import Razorpay from "razorpay";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log('Production mode: Serving static files from', distPath);
    console.log('Checking index.html existence:', path.join(distPath, "index.html"));
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      console.log('Serving SPA fallback for:', req.url);
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server environment: ${process.env.NODE_ENV}`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
