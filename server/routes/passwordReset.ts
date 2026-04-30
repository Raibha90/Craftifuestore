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

// Step 1: Request reset link
router.post('/api/admin/forgot-password', strictRateLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    try {
        // Find user in Firebase Auth
        let user;
        try {
            user = await adminAuth.getUserByEmail(email);
        } catch (e) {
            // User not found, but we return the same message to prevent enumeration
            return res.json({
                message: 'If an account exists for that email, a reset link has been sent.'
            });
        }

        const { rawToken, expiresAt } = await tokenService.generateToken({
            userId: user.uid,
            actionType: 'password_reset',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        const actionUrl = tokenService.buildActionUrl('password_reset', rawToken);

        // Send Email
        await transporter.sendMail({
            from: `"Cratifue Admin" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset your password',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px; border-radius: 12px;">
                <h1 style="font-size: 20px; color: #111;">Reset your password</h1>
                <p>Hi, we received a request to reset your password. Click the button below to continue.</p>
                <div style="margin: 30px 0;">
                  <a href="${actionUrl}" style="background: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Reset Password</a>
                </div>
                <p style="font-size: 12px; color: #666;">This link expires in ${tokenService.TTL.password_reset} minutes and can only be used once.</p>
                <p style="font-size: 12px; font-family: monospace; color: #999;">${actionUrl}</p>
              </div>
            `
        });

        return res.json({
            message: 'If an account exists for that email, a reset link has been sent.'
        });
    } catch (err) {
        console.error('Hardened forgot password error:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// Verification endpoint used by frontend to check if token is valid
router.get('/api/action/verify-token', async (req, res) => {
    const { token, type } = req.query;
    const result = await tokenService.verifyToken({ token: token as string, actionType: type as string });
    res.json(result);
});

// Step 3: POST — execute reset
router.post('/api/action/password-reset', actionRateLimiter, async (req, res) => {
    const { token, password, passwordConfirm } = req.body;

    if (!password || password.length < 12) {
        return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }
    if (password !== passwordConfirm) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const verification = await tokenService.verifyToken({
        token,
        actionType: 'password_reset'
    });

    if (!verification.valid) {
        return res.status(400).json({
            error: verification.reason === 'expired'
                ? 'This link has expired. Please request a new one.'
                : 'This link is no longer valid.'
        });
    }

    try {
        await tokenService.consumeToken(verification.tokenId);
        
        // Update password in Firebase Auth
        await adminAuth.updateUser(verification.userId, {
            password: password
        });

        // Track password change in Firestore
        await adminDb.collection('users').doc(verification.userId).set({
            passwordChangedAt: new Date()
        }, { merge: true });

        // Optional: Force logout by revoking tokens
        await adminAuth.revokeRefreshTokens(verification.userId);

        return res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        console.error('Password reset execution error:', err);
        return res.status(500).json({ error: 'Could not reset password' });
    }
});

export default router;
