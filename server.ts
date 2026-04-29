import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import { AfterShip } from "aftership";
import Razorpay from "razorpay";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

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
        bcc: "admin@craftifue.store",
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
        bcc: "admin@craftifue.store",
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

  // 2. Placeholder for Zevu API
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

  app.post("/api/webhooks/razorpay", async (req, res) => {
    // Requires express.json() which is already configured globally
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ error: "Razorpay Webhook Secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (expectedSignature === signature) {
        console.log("Razorpay event verified:", req.body.event);
        
        switch (req.body.event) {
          case "payment.captured":
          case "order.paid":
            const paymentEntity = req.body.payload.payment.entity;
            const email = paymentEntity.email;
            const amount = paymentEntity.amount / 100; // back to INR
            const orderId = paymentEntity.order_id;
            
            // We can add logic to update Firebase Admin here using a Firebase Admin SDK
            // Since we use the frontend to create the order initially, this webhook
            // serves to capture unexpected payment state changes (e.g., late captures).
            
            // Optionally, fallback send an email if not sent by frontend
            /*
            if (email && process.env.SMTP_USER && process.env.SMTP_PASS) {
              await transporter.sendMail({
                 from: \`"Craftifue" <\${process.env.SMTP_USER}>\`,
                 to: email,
                 subject: "Payment Confirmed via Razorpay",
                 text: \`Your payment of ₹\${amount} for order \${orderId} was successful.\`
              });
            }
            */
            break;
        }

        res.json({ status: "ok" });
      } else {
        res.status(400).json({ error: "Invalid Webhook Signature" });
      }
    } catch (err: any) {
      console.error("Webhook error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Order Status Notification (Email & SMS)
  app.post("/api/orders/notify-status", async (req, res) => {
    const { orderId, phone, email, status, itemsHtml, totalAmount, order } = req.body;
    
    if (!orderId || !status) return res.status(400).json({ error: "orderId and status required" });

    let emailSent = false;
    let smssent = false;

    // 1. Send Email Notification
    if (email && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        let subject = `Craftifue Order Update: ${status.toUpperCase()}`;
        let htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px; border-radius: 12px; border: 1px solid #f0eee5;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #4a5d23; font-size: 24px;">Order Status Update</h2>
              <p style="color: #d4af37; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; font-size: 12px;">Your order #${orderId.slice(-6).toUpperCase()}</p>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">Hello,</p>
            <p style="color: #4b5563; line-height: 1.6;">The status of your order has been updated to: <strong style="color: #4a5d23; font-size: 16px;">${status.toUpperCase()}</strong></p>
            ${itemsHtml ? `
            <div style="background: #fff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 15px 12px 0 12px; font-weight: bold; text-align: right; color: #4a5d23; text-transform: uppercase; font-size: 12px;">Total Amount:</td>
                  <td style="padding: 15px 12px 0 12px; font-weight: bold; text-align: right; color: #4a5d23; font-size: 18px;">₹${totalAmount}</td>
                </tr>
              </table>
            </div>` : ""}
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px;">Thank you for shopping with Craftifue.</p>
          </div>
        `;

        let mailOptions: any = {
          from: `"Craftifue" <${process.env.SMTP_USER}>`,
          to: email,
          bcc: "admin@craftifue.store",
          subject,
          html: htmlContent,
        };

        // Attach Invoice PDF if order object is provided
        if (order && (status === 'confirmed' || status === 'delivered' || status === 'processed' || status === 'shipped')) {
          const doc = new PDFDocument({ margin: 50 });
          let buffers: any[] = [];
          
          const pdfPromise = new Promise((resolve) => {
             doc.on('data', buffers.push.bind(buffers));
             doc.on('end', () => {
               const pdfData = Buffer.concat(buffers);
               resolve(pdfData);
             });
          });

          // Header
          doc.fontSize(20).fillColor("#4a5d23").text("Craftifue", { align: "left" });
          doc.fontSize(10).fillColor("gray").text("Artisan Heritage", { align: "left" });
          doc.moveDown();

          // Invoice Details
          doc.fontSize(16).fillColor("black").text("INVOICE", { align: "right" });
          doc.fontSize(10).text(`Order ID: ${order.id.slice(-6).toUpperCase()}`, { align: "right" });
          doc.text(`Date: ${new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}`, { align: "right" });
          doc.text(`Status: ${order.status.toUpperCase()}`, { align: "right" });
          doc.moveDown(2);

          // Shipping Address
          doc.fontSize(12).fillColor("#4a5d23").text("Billed To:");
          doc.fontSize(10).fillColor("black");
          if (order.address) {
            doc.text(`${order.address.fullName || "Customer"}`);
            doc.text(`${order.address.street}`);
            doc.text(`${order.address.city}, ${order.address.state} - ${order.address.zipCode}`);
            doc.text(`${order.address.phone}`);
          }
          doc.moveDown(2);

          // Table Header
          const tableTop = doc.y;
          doc.font("Helvetica-Bold");
          doc.text("Item", 50, tableTop);
          doc.text("Quantity", 300, tableTop, { width: 90, align: "right" });
          doc.text("Price", 400, tableTop, { width: 90, align: "right" });
          
          const hrTop = tableTop + 15;
          doc.moveTo(50, hrTop).lineTo(500, hrTop).stroke();
          
          // Table Content
          doc.font("Helvetica");
          let currentY = hrTop + 15;
          
          order.items.forEach((item: any) => {
            doc.text(item.name, 50, currentY);
            doc.text(item.quantity.toString(), 300, currentY, { width: 90, align: "right" });
            doc.text(`Rs. ${(item.price * item.quantity).toLocaleString()}`, 400, currentY, { width: 90, align: "right" });
            currentY += 20;
          });

          doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
          currentY += 15;

          // Total
          doc.font("Helvetica-Bold");
          doc.text("Total", 300, currentY, { width: 90, align: "right" });
          doc.text(`Rs. ${order.totalAmount.toLocaleString()}`, 400, currentY, { width: 90, align: "right" });

          // Footer
          doc.font("Helvetica").fontSize(10).fillColor("gray");
          doc.text("Thank you for supporting artisans!", 50, doc.page.height - 100, { align: "center" });

          doc.end();

          const pdfBuffer = await pdfPromise;
          mailOptions.attachments = [
            {
              filename: `Invoice-${orderId.slice(-6).toUpperCase()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ];
        }

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (err) {
        console.error("Email notification error:", err);
      }
    }

    // 2. We could send other notifications here
    // e.g. web push, or other gateway that doesn't use twilio
    res.json({ success: true, emailSent, smssent });
  });

  app.post("/api/send-invoice-email", async (req, res) => {
    const { order } = req.body;
    if (!order) return res.status(400).json({ error: "Order data required" });

    try {
      const email = order.address?.email || order.customerEmail || "customer@example.com"; // Fallback if no email

      const doc = new PDFDocument({ margin: 50 });
      let buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        
        try {
          // Send Email
          await transporter.sendMail({
            from: `"Craftifue Orders" <${process.env.SMTP_USER}>`,
            to: email,
            bcc: "admin@craftifue.store",
            subject: `Your Invoice for Order #${order.id.slice(-6).toUpperCase()}`,
            html: `
              <p>Hi ${order.address?.fullName || "Customer"},</p>
              <p>Thank you for shopping at Craftifue. Please find attached the invoice for your recent order.</p>
              <p>Best,<br>Craftifue Team</p>
            `,
            attachments: [
              {
                filename: `Invoice-${order.id.slice(-6).toUpperCase()}.pdf`,
                content: pdfData,
                contentType: 'application/pdf'
              }
            ]
          });
          res.json({ success: true, message: "Invoice sent successfully" });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });

      // Header
      doc.fontSize(20).fillColor("#4a5d23").text("Craftifue", { align: "left" });
      doc.fontSize(10).fillColor("gray").text("Artisan Heritage", { align: "left" });
      doc.moveDown();

      // Invoice Details
      doc.fontSize(16).fillColor("black").text("INVOICE", { align: "right" });
      doc.fontSize(10).text(`Order ID: ${order.id.slice(-6).toUpperCase()}`, { align: "right" });
      
      const orderDate = order.createdAt?.seconds 
         ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
         : new Date(order.createdAt).toLocaleDateString();

      doc.text(`Date: ${orderDate}`, { align: "right" });
      doc.text(`Status: ${order.status.toUpperCase()}`, { align: "right" });
      doc.moveDown(2);

      // Shipping Address
      doc.fontSize(12).fillColor("#4a5d23").text("Billed To:");
      doc.fontSize(10).fillColor("black");
      if (order.address) {
        doc.text(`${order.address.fullName || "Customer"}`);
        doc.text(`${order.address.street}`);
        doc.text(`${order.address.city}, ${order.address.state} - ${order.address.zipCode}`);
        doc.text(`${order.address.phone}`);
      }
      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Item", 50, tableTop);
      doc.text("Quantity", 300, tableTop, { width: 90, align: "right" });
      doc.text("Price", 400, tableTop, { width: 90, align: "right" });
      
      const hrTop = tableTop + 15;
      doc.moveTo(50, hrTop).lineTo(500, hrTop).stroke();
      
      // Table Content
      doc.font("Helvetica");
      let currentY = hrTop + 15;
      
      order.items.forEach((item: any) => {
        doc.text(item.name, 50, currentY);
        doc.text(item.quantity.toString(), 300, currentY, { width: 90, align: "right" });
        doc.text(`Rs. ${(item.price * item.quantity).toLocaleString()}`, 400, currentY, { width: 90, align: "right" });
        currentY += 20;
      });

      doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
      currentY += 15;

      // Total
      doc.font("Helvetica-Bold");
      doc.text("Total", 300, currentY, { width: 90, align: "right" });
      doc.text(`Rs. ${order.totalAmount.toLocaleString()}`, 400, currentY, { width: 90, align: "right" });

      // Footer
      doc.font("Helvetica").fontSize(10).fillColor("gray");
      doc.text("Thank you for supporting artisans!", 50, doc.page.height - 100, { align: "center" });

      doc.end();
    } catch (err: any) {
      console.error("Invoice config error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Failed to process invoice" });
    }
  });

  // PDF Invoice Generator
  app.post("/api/generate-invoice", async (req, res) => {
    const { order } = req.body;
    if (!order) return res.status(400).json({ error: "Order data required" });

    try {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Invoice-${order.id.slice(-6).toUpperCase()}.pdf"`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).fillColor("#4a5d23").text("Craftifue", { align: "left" });
      doc.fontSize(10).fillColor("gray").text("Artisan Heritage", { align: "left" });
      doc.moveDown();

      // Invoice Details
      doc.fontSize(16).fillColor("black").text("INVOICE", { align: "right" });
      doc.fontSize(10).text(`Order ID: ${order.id.slice(-6).toUpperCase()}`, { align: "right" });
      doc.text(`Date: ${new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}`, { align: "right" });
      doc.text(`Status: ${order.status.toUpperCase()}`, { align: "right" });
      doc.moveDown(2);

      // Shipping Address
      doc.fontSize(12).fillColor("#4a5d23").text("Billed To:");
      doc.fontSize(10).fillColor("black");
      if (order.address) {
        doc.text(`${order.address.fullName || "Customer"}`);
        doc.text(`${order.address.street}`);
        doc.text(`${order.address.city}, ${order.address.state} - ${order.address.zipCode}`);
        doc.text(`${order.address.phone}`);
      }
      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Item", 50, tableTop);
      doc.text("Quantity", 300, tableTop, { width: 90, align: "right" });
      doc.text("Price", 400, tableTop, { width: 90, align: "right" });
      
      const hrTop = tableTop + 15;
      doc.moveTo(50, hrTop).lineTo(500, hrTop).stroke();
      
      // Table Content
      doc.font("Helvetica");
      let currentY = hrTop + 15;
      
      order.items.forEach((item: any) => {
        doc.text(item.name, 50, currentY);
        doc.text(item.quantity.toString(), 300, currentY, { width: 90, align: "right" });
        doc.text(`Rs. ${(item.price * item.quantity).toLocaleString()}`, 400, currentY, { width: 90, align: "right" });
        currentY += 20;
      });

      doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
      currentY += 15;

      // Total
      doc.font("Helvetica-Bold");
      doc.text("Total", 300, currentY, { width: 90, align: "right" });
      doc.text(`Rs. ${order.totalAmount.toLocaleString()}`, 400, currentY, { width: 90, align: "right" });

      // Footer
      doc.font("Helvetica").fontSize(10).fillColor("gray");
      doc.text("Thank you for supporting artisans!", 50, doc.page.height - 100, { align: "center" });

      doc.end();
    } catch (err: any) {
      console.error("Invoice error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Failed to generate invoice" });
    }
  });

  // Serve static files in production
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    const distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(distPath)) {
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
