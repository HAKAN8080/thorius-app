import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export type PlanType = 'free' | 'starter' | 'pro' | 'premium' | 'kurumsal';

export const PLAN_LIMITS: Record<PlanType, number> = {
  free: 1,
  starter: 10,
  pro: 20,
  premium: 30,
  kurumsal: 100,
};

/** Full sesli TTS erişimi olan planlar */
export const FULL_TTS_PLANS: PlanType[] = ['premium', 'kurumsal'];

/** Premium mentorlara erişimi olan planlar */
export const PREMIUM_ACCESS_PLANS: PlanType[] = ['premium', 'kurumsal'];

export interface User {
  id: string;
  email: string;
  name: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToKvkk?: boolean;
  agreedToConfidentiality?: boolean;
  agreedToCoachingService: boolean;
  agreedToAiDisclaimer: boolean;
  company?: string;
  jobTitle?: string;
  interests?: string[];
  createdAt: string;
  plan?: PlanType;
  planActivatedAt?: string;
  sessionLimit?: number;
  freeTestsRemaining?: number;
  isPremium?: boolean;
  emailVerified?: boolean;
  isAdmin?: boolean;
  lastLoginAt?: string;
  inactiveReminderSent?: boolean;
}

// Admin email listesi
const ADMIN_EMAILS = [
  'admin@thorius.com.tr',
];

export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  return user.isAdmin === true || ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export interface StoredUser extends User {
  passwordHash: string;
}

// JWT_SECRET - runtime'da lazy load edilir (build sırasında hata vermemesi için)
let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn('⚠️ Using default JWT secret - DO NOT use in production');
    _jwtSecret = new TextEncoder().encode('thorius-dev-secret-FOR-DEV-ONLY');
    return _jwtSecret;
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  _jwtSecret = new TextEncoder().encode(secret);
  return _jwtSecret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const doc = await getDb().collection('users').doc(payload.userId).get();
  if (!doc.exists) return null;

  const data = doc.data() as StoredUser;
  const { passwordHash: _, ...user } = data;
  // Firestore doküman ID'sini fallback olarak kullan (id field'ı eksikse)
  return { ...user, id: user.id ?? doc.id };
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const snap = await getDb().collection('users').where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as StoredUser;
}

export async function createUser(data: Omit<StoredUser, 'id' | 'createdAt'>): Promise<StoredUser> {
  const ref = getDb().collection('users').doc();
  const user: StoredUser = {
    ...data,
    id: ref.id,
    createdAt: new Date().toISOString(),
  };
  await ref.set(user);
  return user;
}
