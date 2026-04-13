'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User, LayoutDashboard, BarChart3, X, ChevronDown, Shield, Mail, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan?: string;
  isAdmin?: boolean;
}

const NAV_LINKS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/mentors', label: 'AI Koç & Mentorlar' },
  { href: '/uzman-kocluk', label: '1:1 Uzman Koçluk' },
  { href: '/tests', label: 'Testler' },
  { href: '/kocluk-mentorluk', label: 'Koçluk & Mentorluk' },
  { href: '/etik-standartlar', label: 'Etik Standartlar' },
  { href: '/pricing', label: 'Fiyatlandırma' },
];

const TOP_LINKS = [
  { href: '/about', label: 'Hakkımızda' },
  { href: '/contact', label: 'İletişim' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ sessionCount: number; sessionLimit: number } | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Chat sayfasında Navbar'ı gizle (seans odaklı deneyim için)
  const isHidden = pathname?.startsWith('/chat/');

  // Auth durumunu kontrol eden fonksiyon
  const checkAuth = () => {
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
        } else {
          setSessionInfo(null);
        }
      })
      .catch(() => setAuthChecked(true));
  };

  useEffect(() => {
    checkAuth();

    // Login/logout event'lerini dinle
    const handleAuthChange = () => checkAuth();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
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
    <header className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md ${isHidden ? 'hidden' : ''}`}>
      {/* Üst Satır - About, Contact, Hesabım */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-9 items-center justify-end gap-1">
            {/* Sol: About & Contact */}
            <div className="hidden md:flex md:items-center md:gap-1 mr-auto">
              {TOP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Sağ: Hesap bilgileri */}
            <div className="hidden md:flex md:items-center md:gap-3">
              {!authChecked ? (
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              ) : user ? (
                <>
                  {/* Seans bilgisi */}
                  {sessionInfo && (
                    <span className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{sessionInfo.sessionLimit - sessionInfo.sessionCount}</span> seans kaldı
                    </span>
                  )}
                  <div className="h-3 w-px bg-border" />
                  {/* Seanslarım */}
                  <Link href="/profile" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <LayoutDashboard className="h-3 w-3" />
                    Seanslarım
                  </Link>
                  {/* Gelişim Raporu */}
                  <Link href="/profile/report" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <BarChart3 className="h-3 w-3" />
                    Gelişim Raporum
                  </Link>
                  {/* Admin */}
                  {user.isAdmin && (
                    <Link href="/admin" className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Link>
                  )}
                  <div className="h-3 w-px bg-border" />
                  {/* Hesabım dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-[10px] font-bold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[80px] truncate">{user.name}</span>
                      {planLabel && (
                        <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${planLabel === 'Free' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                          {planLabel}
                        </span>
                      )}
                      <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-white p-1 shadow-lg">
                        <div className="px-2.5 py-1.5 mb-0.5">
                          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="h-px bg-border mb-0.5" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-3 w-3" />
                          Çıkış Yap
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Giriş Yap
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="h-6 px-2.5 text-xs bg-primary text-white hover:bg-primary/90">
                      Ücretsiz Başla
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alt Satır - Logo & Ana Menü */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-8">

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
              <Image
                src="/thorius-logo.png"
                alt="Thorius"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-800 tracking-tight text-foreground group-hover:text-primary transition-colors">
                Thorius
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex md:items-center md:gap-1 flex-1 justify-center">
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

            {/* Sağ boşluk için logo ile simetri */}
            <div className="hidden md:block w-[120px]" />

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
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {/* Ana Menü */}
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

            {/* Hakkımızda & İletişim */}
            {TOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
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
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <div className="flex items-center gap-2">
                      {planLabel && <span className="text-xs text-primary">{planLabel}</span>}
                      {sessionInfo && (
                        <span className="text-xs text-muted-foreground">• {sessionInfo.sessionLimit - sessionInfo.sessionCount} seans</span>
                      )}
                    </div>
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
                {user.isAdmin && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                    <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                      <Shield className="h-4 w-4 text-primary" /> Admin Panel
                    </button>
                  </Link>
                )}
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
