import { NextResponse } from 'next/server';
import { comparePassword, getUserByEmail, signToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
  }

  // Email doğrulama kontrolü
  if (user.emailVerified === false) {
    return NextResponse.json({
      error: 'EMAIL_NOT_VERIFIED',
      message: 'E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanıza gönderilen linke tıklayın.',
      email: user.email,
    }, { status: 403 });
  }

  const token = await signToken({ userId: user.id, email: user.email });

  // Son giriş zamanını ve hatırlatma flag'ini güncelle
  await getDb().collection('users').doc(user.id).update({
    lastLoginAt: new Date().toISOString(),
    inactiveReminderSent: false, // Her girişte sıfırla
  });

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
