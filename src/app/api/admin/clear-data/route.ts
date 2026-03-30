import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

// Batch silme (Firestore 500 limit)
async function deleteCollection(db: FirebaseFirestore.Firestore, collectionName: string): Promise<number> {
  const snap = await db.collection(collectionName).get();
  if (snap.size === 0) return 0;

  // 500'lük batch'ler halinde sil
  const batches = [];
  let batch = db.batch();
  let count = 0;

  for (const doc of snap.docs) {
    batch.delete(doc.ref);
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
  return snap.size;
}

export async function POST() {
  const user = await getCurrentUser();

  // Sadece admin erişebilir
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  }

  const db = getDb();
  const results: Record<string, number> = {};

  try {
    // Tüm koleksiyonları temizle
    const collectionsToDelete = [
      'sessions',
      'test_results',
      'homework',
      'reports',
      'ratings',
      'feedback',
      'notifications',
    ];

    for (const collection of collectionsToDelete) {
      try {
        results[collection] = await deleteCollection(db, collection);
      } catch {
        results[collection] = 0;
      }
    }

    // Kullanıcıların seans sayaçlarını ve test verilerini sıfırla
    const usersSnap = await db.collection('users').get();
    const batches = [];
    let batch = db.batch();
    let count = 0;

    usersSnap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        sessionCount: 0,
        testResults: [],
        completedTests: [],
      });
      count++;
      if (count % 500 === 0) {
        batches.push(batch.commit());
        batch = db.batch();
      }
    });

    if (count % 500 !== 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);
    results.users_reset = usersSnap.size;

    return NextResponse.json({
      success: true,
      message: 'Tüm veriler temizlendi.',
      deleted: results,
    });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json(
      { error: 'Veri temizleme sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
