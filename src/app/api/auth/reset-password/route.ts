import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserByEmail, hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, token, password } = await req.json();

  if (!email || !token || !password) {
    return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Şifre en az 8 karakter olmalıdır.' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Token'ı kontrol et
  const resetDoc = await getDb().collection('password_resets').doc(normalizedEmail).get();

  if (!resetDoc.exists) {
    return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş link.' }, { status: 400 });
  }

  const resetData = resetDoc.data() as { token: string; expiry: string };

  // Token eşleşme kontrolü
  if (resetData.token !== token) {
    return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş link.' }, { status: 400 });
  }

  // Süre kontrolü
  if (new Date(resetData.expiry) < new Date()) {
    await getDb().collection('password_resets').doc(normalizedEmail).delete();
    return NextResponse.json({ error: 'Bu linkin süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun.' }, { status: 400 });
  }

  // Kullanıcıyı bul
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
  }

  // Şifreyi güncelle
  const newPasswordHash = await hashPassword(password);
  await getDb().collection('users').doc(user.id).update({
    passwordHash: newPasswordHash,
  });

  // Reset token'ı sil
  await getDb().collection('password_resets').doc(normalizedEmail).delete();

  return NextResponse.json({ success: true });
}
