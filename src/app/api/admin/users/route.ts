import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser, isAdminUser, User, PlanType, PLAN_LIMITS } from '@/lib/auth';
import { getDb } from '@/lib/db';

interface UserWithStats extends User {
  sessionCount: number;
  completedSessionCount: number;
  activeSessionCount: number;
  lastSessionAt?: string;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  try {
    // Tüm kullanıcıları getir
    const usersSnap = await getDb().collection('users').get();
    const sessionsSnap = await getDb().collection('sessions').get();

    // Session'ları kullanıcıya göre grupla
    const sessionsByUser = new Map<string, { total: number; completed: number; active: number; lastAt?: string }>();

    sessionsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      const existing = sessionsByUser.get(userId) || { total: 0, completed: 0, active: 0 };

      existing.total++;
      if (data.status === 'completed') {
        existing.completed++;
      } else {
        existing.active++;
      }

      // En son seans tarihi
      if (data.createdAt) {
        if (!existing.lastAt || new Date(data.createdAt) > new Date(existing.lastAt)) {
          existing.lastAt = data.createdAt;
        }
      }

      sessionsByUser.set(userId, existing);
    });

    // Kullanıcı listesi oluştur
    const users: UserWithStats[] = usersSnap.docs.map((doc) => {
      const data = doc.data();
      const stats = sessionsByUser.get(doc.id) || { total: 0, completed: 0, active: 0 };

      // passwordHash'i çıkar
      const { passwordHash: _, ...userData } = data;

      return {
        ...userData,
        id: doc.id,
        sessionCount: stats.total,
        completedSessionCount: stats.completed,
        activeSessionCount: stats.active,
        lastSessionAt: stats.lastAt,
      } as UserWithStats;
    });

    // Kayıt tarihine göre sırala (en yeni önce)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ users, total: users.length });
  } catch (err) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Kullanıcılar yüklenemedi' }, { status: 500 });
  }
}

// Kullanıcı güncelle (plan, admin, vb.)
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  try {
    const { userId, plan, isAdmin, freeTestsRemaining } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (plan !== undefined) {
      updates.plan = plan;
      updates.sessionLimit = PLAN_LIMITS[plan as PlanType] || 1;
      updates.planActivatedAt = new Date().toISOString();
    }

    if (isAdmin !== undefined) {
      updates.isAdmin = isAdmin;
    }

    if (freeTestsRemaining !== undefined) {
      updates.freeTestsRemaining = freeTestsRemaining;
    }

    await getDb().collection('users').doc(userId).update(updates);

    return NextResponse.json({ success: true, updated: updates });
  } catch (err) {
    console.error('Admin update user error:', err);
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

// Kullanıcı sil
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    // Kendini silmeye çalışıyorsa engelle
    if (userId === user?.id) {
      return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 });
    }

    // Kullanıcıyı sil
    await getDb().collection('users').doc(userId).delete();

    // Kullanıcının seanslarını da sil
    const sessionsSnap = await getDb().collection('sessions').where('userId', '==', userId).get();
    const batch = getDb().batch();
    sessionsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    if (!sessionsSnap.empty) {
      await batch.commit();
    }

    return NextResponse.json({ success: true, deletedSessions: sessionsSnap.size });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}
