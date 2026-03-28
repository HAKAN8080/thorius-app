import { getDb } from '@/lib/db';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix ms
}

/**
 * Firestore tabanlı rate limiter (serverless-safe)
 * key: IP + endpoint
 * window: dakika cinsinden
 * limit: maksimum istek sayısı
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMinutes: number
): Promise<RateLimitResult> {
  const db = getDb();
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const windowStart = now - windowMs;
  const docId = Buffer.from(key).toString('base64').replace(/[/+=]/g, '_');
  const ref = db.collection('rate_limits').doc(docId);

  try {
    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const data = doc.data() as { requests: number[]; resetAt: number } | undefined;

      // Pencere dışındaki istekleri temizle
      const requests: number[] = (data?.requests ?? []).filter((t) => t > windowStart);

      if (requests.length >= limit) {
        return { allowed: false, remaining: 0, resetAt: (requests[0] ?? now) + windowMs };
      }

      requests.push(now);
      const resetAt = requests[0] + windowMs;
      tx.set(ref, { requests, resetAt, updatedAt: now }, { merge: true });

      return { allowed: true, remaining: limit - requests.length, resetAt };
    });

    return result;
  } catch {
    // Rate limiter hatası durumunda isteğe izin ver (availability > security burada)
    return { allowed: true, remaining: 1, resetAt: now + windowMs };
  }
}

/** Request'ten IP al (Vercel + proxy uyumlu) */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
