import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

// Korunacak kullanıcılar
const PROTECTED_EMAILS = [
  'admin@thorius.com.tr',
  'mhakan_ugur@yahoo.com',
];

export async function POST() {
  const user = await getCurrentUser();

  // Sadece admin erişebilir
  if (!user?.isAdmin && user?.email !== 'admin@thorius.com.tr') {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  }

  const db = getDb();

  try {
    // Tüm kullanıcıları al
    const usersSnap = await db.collection('users').get();

    const toDelete: string[] = [];
    const toKeep: string[] = [];

    usersSnap.docs.forEach((doc) => {
      const email = doc.data().email?.toLowerCase();
      if (PROTECTED_EMAILS.includes(email)) {
        toKeep.push(email);
      } else {
        toDelete.push(doc.id);
      }
    });

    // Silinecek kullanıcıları sil
    const batches = [];
    let batch = db.batch();
    let count = 0;

    for (const userId of toDelete) {
      batch.delete(db.collection('users').doc(userId));
      count++;
      if (count % 500 === 0) {
        batches.push(batch.commit());
        batch = db.batch();
      }
    }

    if (count % 500 !== 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);

    // Silinen kullanıcıların seanslarını da sil
    for (const userId of toDelete) {
      const sessionsSnap = await db.collection('sessions').where('userId', '==', userId).get();
      const sessionBatch = db.batch();
      sessionsSnap.docs.forEach((doc) => {
        sessionBatch.delete(doc.ref);
      });
      if (!sessionsSnap.empty) {
        await sessionBatch.commit();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcılar temizlendi.',
      deleted: toDelete.length,
      kept: toKeep,
    });
  } catch (error) {
    console.error('Cleanup users error:', error);
    return NextResponse.json(
      { error: 'Temizleme sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
