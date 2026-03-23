import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, hashPassword, signToken, PlanType } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  const {
    name, email, password,
    agreedToTerms, agreedToPrivacy, agreedToCoachingService, agreedToAiDisclaimer,
    agreedToKvkk, agreedToConfidentiality,
    company, jobTitle, interests,
  } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Ad, e-posta ve şifre zorunludur.' }, { status: 400 });
  }

  if (!agreedToTerms || !agreedToPrivacy || !agreedToCoachingService || !agreedToAiDisclaimer || !agreedToKvkk || !agreedToConfidentiality) {
    return NextResponse.json({ error: 'Tüm sözleşmeleri onaylamanız gerekmektedir.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Şifre en az 8 karakter olmalıdır.' }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  // Check if there's a pending plan from a prior WooCommerce purchase
  const normalizedEmail = email.toLowerCase().trim();
  const pendingDoc = await getDb().collection('pending_plans').doc(normalizedEmail).get();
  const pending = pendingDoc.exists ? (pendingDoc.data() as { plan: PlanType; activatedAt: string }) : null;

  const user = await createUser({
    email: normalizedEmail,
    name,
    passwordHash,
    agreedToTerms,
    agreedToPrivacy,
    agreedToKvkk,
    agreedToConfidentiality,
    agreedToCoachingService,
    agreedToAiDisclaimer,
    company: company ?? '',
    jobTitle: jobTitle ?? '',
    interests: interests ?? [],
    ...(pending ? { plan: pending.plan, planActivatedAt: pending.activatedAt } : {}),
  });

  // Remove the pending activation record if used
  if (pending) {
    await getDb().collection('pending_plans').doc(normalizedEmail).delete();
  }

  const token = await signToken({ userId: user.id, email: user.email });

  const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}
