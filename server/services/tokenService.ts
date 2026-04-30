import crypto from 'crypto';
import { adminDb } from './firebaseAdmin';

const TTL = {
    password_reset: 15,
    email_change: 60,
    magic_login: 10,
    email_verify: 1440
};

export interface TokenMetadata {
  userId: string;
  actionType: keyof typeof TTL;
  payload?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function generateToken({ userId, actionType, payload = {}, ipAddress, userAgent }: TokenMetadata) {
    const ttlMinutes = TTL[actionType];
    if (!ttlMinutes) throw new Error(`Unknown action type: ${actionType}`);

    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Invalidate any existing pending tokens of the same type for this user
    const existingTokens = await adminDb.collection('action_tokens')
      .where('userId', '==', userId)
      .where('actionType', '==', actionType)
      .where('usedAt', '==', null)
      .get();

    const batch = adminDb.batch();
    existingTokens.forEach(doc => {
      batch.update(doc.ref, { usedAt: new Date() });
    });
    await batch.commit();

    await adminDb.collection('action_tokens').add({
      userId,
      tokenHash,
      actionType,
      payload,
      expiresAt,
      ipAddress,
      userAgent,
      usedAt: null,
      createdAt: new Date()
    });

    return { rawToken, expiresAt };
}

export async function verifyToken({ token, actionType }: { token: string, actionType: string }) {
    if (!token || typeof token !== 'string' || token.length < 32) {
        return { valid: false, reason: 'malformed' };
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await adminDb.collection('action_tokens')
        .where('tokenHash', '==', tokenHash)
        .where('actionType', '==', actionType)
        .limit(1)
        .get();

    if (result.empty) return { valid: false, reason: 'not_found' };

    const doc = result.docs[0];
    const data = doc.data();
    
    if (data.usedAt) return { valid: false, reason: 'already_used' };
    if (data.expiresAt.toDate() < new Date()) return { valid: false, reason: 'expired' };

    return { 
      valid: true, 
      tokenId: doc.id, 
      userId: data.userId, 
      payload: data.payload 
    };
}

export async function consumeToken(tokenId: string) {
    const docRef = adminDb.collection('action_tokens').doc(tokenId);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data()?.usedAt) {
        throw new Error('Token already consumed or not found');
    }

    await docRef.update({ usedAt: new Date() });
    return doc.data();
}

export function buildActionUrl(actionType: string, rawToken: string) {
    const slug = actionType.replace(/_/g, '-');
    const baseUrl = process.env.VITE_APP_URL || 'https://cratifue.store';
    return `${baseUrl}/action/${slug}?token=${rawToken}`;
}

export { TTL };
