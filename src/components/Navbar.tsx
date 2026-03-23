'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User, LayoutDashboard, BarChart3, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan?: string;
}

const NAV_LINKS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/mentors', label: 'Koç & Mentorlar' },
  { href: '/pricing', label: 'Fiyatlandırma' },
  { href: '/kocluk-mentorluk', label: 'Koçluk & Mentorluk' },
  { href: '/etik-standartlar', label: 'Etik Standartlar' },
];

export function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ sessionCount: number; sessionLimit: number } | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user ?? null);
        setAuthChecked(true);
        if (data.user) {
          fetch('/api/user/limits')
            .then((r) => r.json())
            .then((d) => setSessionInfo({ sessionCount: d.sessionCount, sessionLimit: d.sessionLimit }))
            .catch(() => {});
        }
      })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  }

  const planLabel = user?.plan === 'premium' ? 'Premium' : user?.plan === 'essential' ? 'Essential' : user ? 'Free' : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L10.5 6.5H14L10.8 9.2L12 14L8 11.5L4 14L5.2 9.2L2 6.5H5.5L8 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-lg font-800 tracking-tight text-foreground group-hover:text-primary transition-colors">
              Thorius
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex md:items-center md:gap-1 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex md:items-center md:gap-2 shrink-0">
            {!authChecked ? (
              <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  {planLabel && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${planLabel === 'Free' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                      {planLabel}
                    </span>
                  )}
                  {sessionInfo && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {sessionInfo.sessionLimit - sessionInfo.sessionCount} Kalan/{sessionInfo.sessionLimit}
                    </span>
                  )}
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="h-px bg-border mb-1" />
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                      <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Seanslarım
                      </button>
                    </Link>
                    <Link href="/profile/report" onClick={() => setUserMenuOpen(false)}>
                      <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        Gelişim Raporum
                      </button>
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-primary text-white shadow-sm hover:bg-primary/90 font-medium">
                    Ücretsiz Başla
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menü"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-border my-3" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    {planLabel && <p className="text-xs text-primary">{planLabel} Plan</p>}
                  </div>
                </div>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Seanslarım
                  </button>
                </Link>
                <Link href="/profile/report" onClick={() => setIsMenuOpen(false)}>
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" /> Gelişim Raporum
                  </button>
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Çıkış Yap
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Giriş Yap</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-primary text-white hover:bg-primary/90">Ücretsiz Başla</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
