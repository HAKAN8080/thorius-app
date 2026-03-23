import { NextResponse } from 'next/server';
import { getCurrentUser, isAdminUser, User } from '@/lib/auth';
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
