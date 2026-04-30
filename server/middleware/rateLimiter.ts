import rateLimit from 'express-rate-limit';

// Strict: 3 requests per hour per email+IP combo
export const strictRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator: (req) => `${req.ip}:${(req.body.email || '').toLowerCase()}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in an hour.' },
    skip: (req) => process.env.NODE_ENV !== 'production' // Skip in dev for testing ease
});

// Looser: 20 verification attempts per 15 minutes
export const actionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again later.' }
});
