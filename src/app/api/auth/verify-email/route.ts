import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=invalid', req.url));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Token'ı kontrol et
  const verifyDoc = await getDb().collection('email_verifications').doc(normalizedEmail).get();

  if (!verifyDoc.exists) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=invalid', req.url));
  }

  const verifyData = verifyDoc.data() as { tokenHash: string; expiry: string; userId: string };

  // Token hash eşleşme kontrolü (güvenli karşılaştırma)
  const incomingHash = createHash('sha256').update(token).digest('hex');
  if (verifyData.tokenHash !== incomingHash) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=invalid', req.url));
  }

  // Süre kontrolü (24 saat)
  if (new Date(verifyData.expiry) < new Date()) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=expired', req.url));
  }

  // Kullanıcıyı doğrulanmış olarak işaretle
  await getDb().collection('users').doc(verifyData.userId).update({
    emailVerified: true,
  });

  // Verification kaydını sil
  await getDb().collection('email_verifications').doc(normalizedEmail).delete();

  return NextResponse.redirect(new URL('/auth/verify-email?success=true', req.url));
}
