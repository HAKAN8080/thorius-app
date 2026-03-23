import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Bu endpoint sadece bir kez kullanılmalı, sonra silinmeli
// GET /api/admin/setup?secret=thorius-admin-setup-2024
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  // Güvenlik kontrolü
  if (secret !== 'thorius-admin-setup-2024') {
    return NextResponse.json({ error: 'Geçersiz secret' }, { status: 403 });
  }

  const adminEmail = 'admin@thorius.com.tr';
  const adminPassword = 'Thorius2024!'; // İlk giriş şifresi - GİRİŞTEN SONRA DEĞİŞTİRİN!

  try {
    // Admin var mı kontrol et
    const existing = await getDb()
      .collection('users')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Varsa şifreyi güncelle
      const doc = existing.docs[0];
      const passwordHash = await hashPassword(adminPassword);
      await doc.ref.update({
        passwordHash,
        isAdmin: true,
        emailVerified: true,
      });
      return NextResponse.json({
        success: true,
        message: 'Admin şifresi güncellendi',
        email: adminEmail,
        password: adminPassword,
        note: 'GİRİŞTEN SONRA ŞİFRENİZİ DEĞİŞTİRİN!'
      });
    }

    // Yoksa yeni admin oluştur
    const passwordHash = await hashPassword(adminPassword);
    const ref = getDb().collection('users').doc();
    await ref.set({
      id: ref.id,
      email: adminEmail,
      name: 'Admin',
      passwordHash,
      isAdmin: true,
      emailVerified: true,
      agreedToTerms: true,
      agreedToPrivacy: true,
      agreedToCoachingService: true,
      agreedToAiDisclaimer: true,
      plan: 'premium',
      sessionLimit: 999,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Admin hesabı oluşturuldu',
      email: adminEmail,
      password: adminPassword,
      note: 'GİRİŞTEN SONRA ŞİFRENİZİ DEĞİŞTİRİN!'
    });
  } catch (err) {
    console.error('Admin setup error:', err);
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
  }
}
