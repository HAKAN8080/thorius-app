'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Search,
  Users,
  MessageSquare,
  Crown,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Shield,
  ShieldOff,
} from 'lucide-react';

interface UserWithStats {
  id: string;
  email: string;
  name: string;
  plan?: string;
  sessionLimit?: number;
  emailVerified?: boolean;
  isAdmin?: boolean;
  freeTestsRemaining?: number;
  createdAt: string;
  sessionCount: number;
  completedSessionCount: number;
  activeSessionCount: number;
  lastSessionAt?: string;
}

type SortField = 'name' | 'email' | 'createdAt' | 'sessionCount' | 'plan';
type SortOrder = 'asc' | 'desc';

const PLAN_OPTIONS = [
  { value: 'free', label: 'Ücretsiz', color: 'bg-gray-500' },
  { value: 'starter', label: 'Starter', color: 'bg-blue-500' },
  { value: 'premium', label: 'Premium', color: 'bg-amber-500' },
  { value: 'kurumsal', label: 'Kurumsal', color: 'bg-emerald-500' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`"${email}" kullanıcısını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || 'Silme başarısız');
      }
    } catch {
      alert('Bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePlan = async (userId: string, plan: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, plan } : u)));
      } else {
        const data = await res.json();
        alert(data.error || 'Güncelleme başarısız');
      }
    } catch {
      alert('Bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    const action = currentIsAdmin ? 'admin yetkisini kaldırmak' : 'admin yapmak';
    if (!confirm(`Bu kullanıcıyı ${action} istediğinize emin misiniz?`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !currentIsAdmin }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u)));
      } else {
        const data = await res.json();
        alert(data.error || 'Güncelleme başarısız');
      }
    } catch {
      alert('Bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = (a.name || '').localeCompare(b.name || '');
          break;
        case 'email':
          cmp = (a.email || '').localeCompare(b.email || '');
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'sessionCount':
          cmp = a.sessionCount - b.sessionCount;
          break;
        case 'plan':
          const planOrder = { kurumsal: 4, premium: 3, starter: 2, free: 1 };
          cmp = (planOrder[a.plan as keyof typeof planOrder] || 0) -
                (planOrder[b.plan as keyof typeof planOrder] || 0);
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">{users.length} kayıtlı kullanıcı</p>
        </div>
      </div>

      {/* Filtreler */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İsim veya email ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {filteredUsers.length} sonuç
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tablo */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-sm font-medium"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Kullanıcı
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-sm font-medium"
                    onClick={() => handleSort('plan')}
                  >
                    <div className="flex items-center gap-1">
                      Plan
                      <SortIcon field="plan" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-center text-sm font-medium"
                    onClick={() => handleSort('sessionCount')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Seanslar
                      <SortIcon field="sessionCount" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Durum
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-center text-sm font-medium"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Kayıt
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.name}</p>
                            {user.isAdmin && (
                              <Badge className="bg-purple-500 text-xs">Admin</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.plan || 'free'}
                        onChange={(e) => handleChangePlan(user.id, e.target.value)}
                        disabled={actionLoading === user.id}
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {PLAN_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.sessionCount}</span>
                        <span className="text-sm text-muted-foreground">
                          / {user.sessionLimit || 1}
                        </span>
                      </div>
                      {user.freeTestsRemaining !== undefined && user.freeTestsRemaining > 0 && (
                        <p className="text-xs text-green-600 mt-0.5">
                          {user.freeTestsRemaining} ücretsiz test
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.emailVerified ? (
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Doğrulandı</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-amber-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">Bekliyor</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Admin Toggle */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleAdmin(user.id, !!user.isAdmin)}
                          disabled={actionLoading === user.id}
                          title={user.isAdmin ? 'Admin yetkisini kaldır' : 'Admin yap'}
                          className={user.isAdmin ? 'text-purple-500 hover:text-purple-600' : 'text-muted-foreground hover:text-purple-500'}
                        >
                          {user.isAdmin ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={actionLoading === user.id}
                          className="text-muted-foreground hover:text-red-500"
                          title="Kullanıcıyı sil"
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
