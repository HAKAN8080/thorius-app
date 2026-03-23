'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserWithStats {
  id: string;
  email: string;
  name: string;
  plan?: string;
  sessionLimit?: number;
  emailVerified?: boolean;
  createdAt: string;
  sessionCount: number;
  completedSessionCount: number;
  activeSessionCount: number;
  lastSessionAt?: string;
}

type SortField = 'name' | 'email' | 'createdAt' | 'sessionCount' | 'plan';
type SortOrder = 'asc' | 'desc';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
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
          const planOrder = { premium: 2, essential: 1, free: 0 };
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

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'premium':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Premium</Badge>;
      case 'essential':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Essential</Badge>;
      default:
        return <Badge variant="secondary">Ücretsiz</Badge>;
    }
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
                    className="cursor-pointer px-4 py-3 text-right text-sm font-medium"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Kayıt
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getPlanBadge(user.plan)}
                        {user.plan === 'premium' && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.sessionCount}</span>
                        <span className="text-sm text-muted-foreground">
                          / {user.sessionLimit || (user.plan === 'premium' ? 30 : user.plan === 'essential' ? 10 : 1)}
                        </span>
                      </div>
                      {user.lastSessionAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Son: {formatDate(user.lastSessionAt)}
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
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
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
