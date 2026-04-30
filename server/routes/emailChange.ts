import express from 'express';
import { adminAuth, adminDb } from '../services/firebaseAdmin';
import * as tokenService from '../services/tokenService';
import { strictRateLimiter, actionRateLimiter } from '../middleware/rateLimiter';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
});

// Mock middleware for demo - in reality, this would check session/token
const requireAuth = (req: any, res: any, next: any) => {
    // For demo purposes, we'll assume the client sends a userId or we extract it from a cookie
    // In this app, we'd integrate with the existing auth middleware
    next();
};

router.post('/api/account/email/change-request', requireAuth, strictRateLimiter, async (req, res) => {
    const { newEmail, userId } = req.body; // userId should come from auth context in production

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    try {
        const user = await adminAuth.getUser(userId);

        const { rawToken } = await tokenService.generateToken({
            userId,
            actionType: 'email_change',
            payload: { newEmail: newEmail.toLowerCase(), oldEmail: user.email },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        const actionUrl = tokenService.buildActionUrl('email_change', rawToken);

        // Confirmation link -> new email
        await transporter.sendMail({
            from: `"Cratifue Admin" <${process.env.SMTP_USER}>`,
            to: newEmail,
            subject: 'Confirm your new email address',
            html: `<p>Please click the link to confirm your new email: <a href="${actionUrl}">${actionUrl}</a></p>`
        });

        // Security notice -> old email
        if (user.email) {
            await transporter.sendMail({
                from: `"Cratifue Admin" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Email change requested',
                html: `<p>An email change to ${newEmail} was requested for your account. If this wasn't you, please contact support.</p>`
            });
        }

        return res.json({ message: 'Confirmation email sent. Check your new inbox.' });
    } catch (err) {
        console.error('Email change request error:', err);
        return res.status(500).json({ error: 'Failed to initiate email change.' });
    }
});

router.get('/api/action/email-change', actionRateLimiter, async (req, res) => {
    const { token } = req.query;
    const verification = await tokenService.verifyToken({ token: token as string, actionType: 'email_change' });

    if (!verification.valid) {
        return res.status(400).json({ error: verification.reason });
    }

    try {
        await tokenService.consumeToken(verification.tokenId);
        
        await adminAuth.updateUser(verification.userId, {
            email: verification.payload.newEmail,
            emailVerified: true
        });

        return res.json({ success: true, message: `Email successfully changed to ${verification.payload.newEmail}` });
    } catch (err) {
        console.error('Email change execution error:', err);
        return res.status(500).json({ error: 'Failed to complete email change.' });
    }
});

export default router;
