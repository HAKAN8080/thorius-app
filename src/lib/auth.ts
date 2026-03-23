import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export type PlanType = 'essential' | 'premium';

export const PLAN_LIMITS: Record<PlanType, number> = {
  essential: 10,
  premium: 30,
};

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
  isPremium?: boolean;
  emailVerified?: boolean;
}

export interface StoredUser extends User {
  passwordHash: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'thorius-dev-secret-CHANGE-IN-PRODUCTION'
);

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
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
  return user;
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
