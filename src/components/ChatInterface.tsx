'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, AlertTriangle, Lock, Crown, Volume2, VolumeX, ArrowLeft, ChevronRight } from 'lucide-react';
import { Mentor } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { SessionConfirmModal } from '@/components/SessionConfirmModal';
import { SpeakingAvatar } from '@/components/SpeakingAvatar';
import { useRouter } from 'next/navigation';

const MAX_USER_MESSAGES = 10;
const MIN_CHAR_COUNT = 50;   // Minimum karakter sayısı
const MAX_CHAR_COUNT = 1500; // Maksimum karakter sayısı

interface ChatInterfaceProps {
  mentor: Mentor;
}

async function saveSession(
  mentor: Mentor,
  messages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text?: string }> }>,
  activeSessionId?: string | null
): Promise<string | null> {
  // İlk gerçek kullanıcı mesajını gündem olarak kaydet
  const firstUserMsg = messages.find(
    (m) => m.role === 'user' && getTextContent(m) !== '__KAPANIS__' && getTextContent(m).trim()
  );
  const agenda = firstUserMsg ? getTextContent(firstUserMsg).slice(0, 300) : null;

  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorTitle: mentor.title,
        messages: messages.map((m) => ({ role: m.role, text: getTextContent(m) })),
        agenda,
        // Aktif seans varsa güncelle, yoksa yeni oluştur
        ...(activeSessionId ? { sessionId: activeSessionId } : {}),
      }),
    });
    const data = await res.json();
    return data.id || null;
  } catch {
    return null;
  }
}

function isImageUrl(avatar: string): boolean {
  return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/');
}

function getTextContent(message: { content?: string; parts?: Array<{ type: string; text?: string }> }): string {
  if (typeof message.content === 'string' && message.content) return message.content;
  if (!message.parts) return '';
  return message.parts.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('');
}

interface LimitInfo {
  plan: string | null;
  sessionCount: number;
  completedCount: number;
  sessionLimit: number;
  limitReached: boolean;
  hasActiveSession: boolean;
  isFree: boolean;
}

export function ChatInterface({ mentor }: ChatInterfaceProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // overflow-y-auto div
  const [input, setInput] = useState('');
  const [sessionSaved, setSessionSaved] = useState(false);
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);

  const [closingSent, setClosingSent] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(true);
  const [audioTime, setAudioTime] = useState(0);
  const [spokenIds, setSpokenIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  const wordTimingsRef = useRef<Map<string, Array<{ word: string; start: number; end: number }>>>(new Map());

  // Değerlendirme anketi state - her zaman false olarak başla
  const [showRating, setShowRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Component mount olduğunda değerlendirme state'lerini sıfırla
  useEffect(() => {
    setShowRating(false);
    setRatingSubmitted(false);
    setSessionSaved(false);
    setClosingSent(false);
  }, []);

  // Detaylı değerlendirme soruları
  const [ratings, setRatings] = useState({
    contentQuality: 0,    // İçerik yeterliliği
    sessionDuration: 0,   // Süre yeterliliği
    responseSpeed: 0,     // Yanıt hızı
    communication: 0,     // İletişim kalitesi
    overall: 0,           // Genel memnuniyet
  });
  const [npsScore, setNpsScore] = useState<number | null>(null); // 0-10 NPS
  const [ratingComment, setRatingComment] = useState('');

  // Karakter sayısı hesaplama
  const charCount = input.trim().length;
  const isFirstMessage = useRef(true);

  // Seans onay modalı
  const [showSessionConfirm, setShowSessionConfirm] = useState(false);
  const [sessionConfirmed, setSessionConfirmed] = useState(false);
  const pendingInputRef = useRef<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Seans çıkış uyarı modalı
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Seans başladıysa sayfa kapatma/yenileme uyarısı
  useEffect(() => {
    if (!sessionConfirmed || sessionSaved) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern tarayıcılarda custom mesaj gösterilmez ama uyarı gösterilir
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionConfirmed, sessionSaved]);

  async function handleSpeak(messageId: string, text: string) {
    if (playingId === messageId) {
      audioRef.current?.pause();
      setPlayingId(null);
      setAudioTime(0);
      return;
    }
    setPlayingId(messageId);
    setAudioTime(0);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mentorId: mentor.id }),
      });
      if (!res.ok) { setPlayingId(null); return; }
      const data = await res.json() as { audioBase64: string; wordTimings: Array<{ word: string; start: number; end: number }> };
      wordTimingsRef.current.set(messageId, data.wordTimings ?? []);
      const audioBytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); }
      audioRef.current = new Audio(url);
      audioRef.current.ontimeupdate = () => setAudioTime(audioRef.current?.currentTime ?? 0);
      audioRef.current.play();
      audioRef.current.onended = () => {
        setPlayingId(null);
        setAudioTime(0);
        URL.revokeObjectURL(url);
        setSpokenIds((prev) => new Set([...prev, messageId]));
      };
    } catch { setPlayingId(null); }
  }

  function renderHighlightedText(text: string, messageId: string) {
    const timings = wordTimingsRef.current.get(messageId);

    // Ses çalmıyorsa veya timing yoksa: markdown render
    if (!timings?.length || playingId !== messageId) {
      return (
        <div className="chat-markdown text-sm">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }

    // Ses çalarken: düz metin + kelime vurgusu (markdown parse etmeden)
    let timingIdx = 0;
    const tokens = text.split(/(\s+)/);
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {tokens.map((token, i) => {
          if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
          const timing = timings[timingIdx];
          const isActive = timing && audioTime >= timing.start && audioTime <= timing.end + 0.08;
          timingIdx++;
          return (
            <span key={i} className={isActive ? 'bg-primary/30 rounded px-0.5 transition-colors' : ''}>
              {token}
            </span>
          );
        })}
      </p>
    );
  }

  useEffect(() => {
    fetch('/api/user/limits')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setLimitInfo(data); })
      .catch(() => {});
  }, []);

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/chat',
      body: { mentorId: mentor.id },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  // Gizli kapanış mesajlarını filtrele
  const visibleMessages = messages.filter((m) =>
    !(m.role === 'user' && getTextContent(m as Parameters<typeof getTextContent>[0]) === '__KAPANIS__')
  );
  const userMessageCount = messages.filter((m) => m.role === 'user' && getTextContent(m as Parameters<typeof getTextContent>[0]) !== '__KAPANIS__').length;
  const sessionEnded = userMessageCount >= MAX_USER_MESSAGES;

  // Otomatik scroll - mesajlar değiştiğinde en alta kay
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
    };
    setTimeout(scrollToBottom, 50);
    setTimeout(scrollToBottom, 200);
  }, [messages, status, playingId]);

  // 10 soruya ulaşınca otomatik kapanış mesajı gönder
  useEffect(() => {
    if (!sessionEnded || closingSent || isLoading) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return; // son AI cevabı bekliyoruz
    setClosingSent(true);
    sendMessage({ role: 'user', parts: [{ type: 'text', text: '__KAPANIS__' }] });
  }, [sessionEnded, closingSent, isLoading, messages, sendMessage]);

  // Ses modu açıksa yeni asistan mesajını otomatik oynat
  useEffect(() => {
    if (!voiceMode || isLoading) return;
    const lastMsg = visibleMessages[visibleMessages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant') return;
    const text = getTextContent(lastMsg as Parameters<typeof getTextContent>[0]);
    if (!text) return;
    if (lastSpokenIdRef.current === lastMsg.id) return;
    lastSpokenIdRef.current = lastMsg.id;
    handleSpeak(lastMsg.id, text);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, voiceMode]);

  // Kapanış cevabı gelince kaydet ve değerlendirme göster
  useEffect(() => {
    if (!closingSent || sessionSaved || isLoading || messages.length <= 1) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;
    setSessionSaved(true);

    // Session kaydet ve ID'yi al
    saveSession(mentor, messages as Parameters<typeof saveSession>[1], activeSessionId).then((id) => {
      if (id) setSessionId(id);
      // Değerlendirme anketini göster
      setTimeout(() => setShowRating(true), 1000);
    });
  }, [closingSent, sessionSaved, isLoading, messages, mentor]);

  // Değerlendirme gönderme
  const submitRating = async () => {
    // Tüm değerlendirmeler ve NPS dolu olmalı
    const allRatings = Object.values(ratings);
    if (allRatings.some(r => r === 0) || npsScore === null || !sessionId) return;

    try {
      await fetch('/api/sessions/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ratings,
          npsScore,
          comment: ratingComment,
        }),
      });
      setRatingSubmitted(true);
    } catch {
      // Sessiz hata
    }
  };

  // Yıldız seçme helper
  const handleRatingChange = (field: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };

  // Tüm değerlendirmeler dolu mu kontrol
  const isRatingComplete = Object.values(ratings).every(r => r > 0) && npsScore !== null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || sessionEnded) return;

    // İlk mesajda minimum karakter kontrolü
    if (userMessageCount === 0 && charCount < MIN_CHAR_COUNT) {
      return; // Button zaten disabled olacak, ama yine de kontrol
    }

    // İlk mesajda ve henüz onay alınmadıysa modal göster
    if (userMessageCount === 0 && !sessionConfirmed) {
      pendingInputRef.current = input;
      setShowSessionConfirm(true);
      return;
    }

    isFirstMessage.current = false;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
    setInput('');
  };

  const handleSessionConfirm = async () => {
    setShowSessionConfirm(false);
    setSessionConfirmed(true);
    isFirstMessage.current = false;

    // /api/sessions/start → Firestore'a 'active' seans ekle, hakkı hemen düşür
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          mentorName: mentor.name,
          mentorTitle: mentor.title,
          firstMessage: pendingInputRef.current,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) setActiveSessionId(data.id);
      }
    } catch {
      // Sessiz hata — seans yine de devam etsin
    }

    sendMessage({ role: 'user', parts: [{ type: 'text', text: pendingInputRef.current }] });
    setInput('');
  };

  const MentorAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-16 w-16' };

    if (isImageUrl(mentor.avatar)) {
      return (
        <div className={cn('relative overflow-hidden rounded-full ring-2 ring-primary/30', sizeClasses[size])}>
          <Image
            src={mentor.avatar}
            alt={mentor.name}
            fill
            className="object-cover"
            sizes={size === 'lg' ? '64px' : size === 'md' ? '40px' : '32px'}
          />
        </div>
      );
    }

    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20',
        sizeClasses[size],
        size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-xl' : 'text-lg'
      )}>
        {mentor.avatar}
      </div>
    );
  };

  // Seans limiti dolmuşsa yükseltme / satın alma ekranı göster
  if (limitInfo?.limitReached) {
    const isFree = limitInfo.isFree;
    const isPremium = limitInfo.plan === 'premium';

    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="mb-2 text-xl font-bold">
            {isFree ? 'Ücretsiz Denemeniz Tamamlandı' : 'Seans Limitinize Ulaştınız'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isFree
              ? '1 ücretsiz seans hakkınızı kullandınız.'
              : `${limitInfo.plan === 'premium' ? 'Premium' : 'Essential'} planınızdaki ${limitInfo.sessionLimit} seans hakkınızı kullandınız.`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFree
              ? 'Gelişiminize devam etmek için bir plan seçin.'
              : 'Devam etmek için ek paket satın alabilirsiniz.'}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {!isFree && (
            <Link href="/profile">
              <Button variant="outline" size="sm">Raporlarımı Gör</Button>
            </Link>
          )}
          <Link href="/pricing">
            <Button size="sm" className="bg-gradient-to-r from-secondary to-primary hover:opacity-90">
              {isFree ? 'Plan Satın Al' : 'Ek Paket Al'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-violet-200/60">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-3.5 z-10">
        {/* Seans aktifken çıkış uyarısı göster, değilse direkt git */}
        {sessionConfirmed && !sessionSaved ? (
          <button
            onClick={() => setShowExitWarning(true)}
            className="rounded-xl p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href="/mentors"
            className="rounded-xl p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}

        <MentorAvatar size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-white truncate">{mentor.title}</h2>
            {!sessionEnded ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300 shrink-0">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                Aktif
              </span>
            ) : (
              <span className="text-[11px] text-white/60 shrink-0">Tamamlandı</span>
            )}
          </div>
          <p className="text-[11px] text-white/65">
            {mentor.name} · {userMessageCount}/{MAX_USER_MESSAGES} soru
          </p>
        </div>

        <button
          onClick={() => {
            if (voiceMode) { audioRef.current?.pause(); setPlayingId(null); }
            setVoiceMode((v) => !v);
          }}
          title={voiceMode ? 'Sesi kapat' : 'Sesi aç'}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all shrink-0',
            voiceMode
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/60'
          )}
        >
          {voiceMode ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{voiceMode ? 'Sesli' : 'Sessiz'}</span>
        </button>
      </div>

      {/* ── Progress bar ────────────────────────────────────────────── */}
      <div className="shrink-0 h-1 bg-white/25">
        <div
          className="h-full bg-white/70 transition-all duration-500"
          style={{ width: `${(userMessageCount / MAX_USER_MESSAGES) * 100}%` }}
        />
      </div>

      {/* ── Compact disclaimer ──────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 bg-violet-50 border-b border-violet-100 px-4 py-1.5">
        <AlertTriangle className="h-3 w-3 shrink-0 text-violet-400" />
        <p className="text-[10px] text-violet-500 leading-relaxed">
          Yanıtlar yapay zeka tarafından üretilmektedir. Sağlık, hukuk veya finans konularında lütfen uzman görüşü alın.
        </p>
      </div>

      {/* ── Messages ────────────────────────────────────────────────── */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto bg-[#f5f0ff]">
        <div className="px-4 py-5 space-y-4 max-w-3xl mx-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 p-1 dark:from-violet-900/30 dark:to-purple-900/30">
                  <MentorAvatar size="lg" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Merhaba!</h3>
                <p className="mb-3 text-sm text-muted-foreground">Ben {mentor.title}</p>
                <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                  {mentor.description}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {mentor.expertise.slice(0, 4).map((skill) => (
                    <span key={skill} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3 dark:from-violet-900/10 dark:to-purple-900/10">
                  <p className="text-xs text-muted-foreground">
                    Seninle <span className="font-medium text-violet-600 dark:text-violet-400">{MAX_USER_MESSAGES} soru</span> üzerinden sohbet edeceğiz
                  </p>
                </div>
              </div>
            )}

            {visibleMessages.map((message) => {
              const text = getTextContent(message as Parameters<typeof getTextContent>[0]);
              if (!text) return null;
              // Sesli modda metin sadece konuşma bittikten sonra göster
              if (voiceMode && message.role === 'assistant' && !spokenIds.has(message.id)) return null;
              // Sesli modda streaming olan son asistan mesajını da gizle
              if (!voiceMode && status === 'streaming' &&
                message.role === 'assistant' && message.id === messages[messages.length - 1]?.id) {
                // streaming devam ediyor, mesaj zaten visibleMessages'da gösteriliyor
              }
              return (
                <div key={message.id} className={cn('flex gap-2.5', message.role === 'user' ? 'flex-row-reverse' : '')}>
                  {message.role === 'user' ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm dark:bg-violet-900/40">
                      <span className="text-violet-600 dark:text-violet-300">Sen</span>
                    </div>
                  ) : (
                    <div className="shrink-0"><MentorAvatar size="sm" /></div>
                  )}
                  <div className={cn(
                    'max-w-[85%] px-4 py-3',
                    message.role === 'user'
                      ? 'rounded-3xl rounded-tr-lg bg-violet-600 text-white shadow-sm'
                      : 'rounded-3xl rounded-tl-lg bg-white shadow-sm border border-violet-100'
                  )}>
                    {message.role === 'assistant'
                      ? renderHighlightedText(text, message.id)
                      : <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
                    }
                  </div>
                </div>
              );
            })}

            {/* Yükleme göstergesi — "Thinking for the best answer..." */}
            {status === 'submitted' && (
              <div className="flex gap-2.5">
                <div className="shrink-0"><MentorAvatar size="sm" /></div>
                <div className="flex items-center gap-3 rounded-3xl rounded-tl-lg bg-white shadow-sm border border-violet-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                  <span className="text-sm text-violet-500 italic">Thinking for the best answer...</span>
                </div>
              </div>
            )}
            {!voiceMode && status === 'streaming' && messages[messages.length - 1]?.role === 'assistant' && (
              null
            )}

            {sessionEnded && sessionSaved && (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-6 text-center border border-violet-100 dark:border-violet-800/30">
                <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Seans tamamlandı</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Harika bir sohbetti! Tekrar görüşmek üzere.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="mt-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Yeni Sohbet Başlat
                </Button>
              </div>
            )}
            {/* Scroll anchor */}
            <div ref={scrollRef} />
          </div>
        </div>

      {/* ── Konuşma Animasyonu (Input üstünde sabit) ─────────────────── */}
      <div className="shrink-0 bg-[#f5f0ff] border-t border-violet-100">
        <SpeakingAvatar
          mentor={mentor}
          isPlaying={!!playingId}
          audioTime={audioTime}
          wordTimings={playingId ? (wordTimingsRef.current.get(playingId) ?? []) : []}
        />
      </div>

      {/* ── Input ───────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-violet-100 bg-white px-4 pb-4 pt-3">
        <div className="max-w-3xl mx-auto">
          {/* Karakter uyarısı */}
          {charCount > MAX_CHAR_COUNT ? (
            <p className="mb-2 text-[11px] text-red-500">
              Mesaj çok uzun. Lütfen {charCount - MAX_CHAR_COUNT} karakter kısaltın ({charCount}/{MAX_CHAR_COUNT})
            </p>
          ) : userMessageCount === 0 && (
            <p className={cn(
              'mb-2 text-[11px] transition-colors',
              input.trim().length > 0 && charCount < MIN_CHAR_COUNT
                ? 'text-amber-500'
                : 'text-gray-400'
            )}>
              {input.trim().length === 0
                ? `İlk mesajınızda gündeминizi detaylıca yazın — en az ${MIN_CHAR_COUNT} karakter`
                : charCount < MIN_CHAR_COUNT
                  ? `Seansı daha verimli kullanmak için en az ${MIN_CHAR_COUNT} karakter yazın (${charCount}/${MIN_CHAR_COUNT})`
                  : null
              }
            </p>
          )}
          <form onSubmit={onSubmit}>
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={sessionEnded ? 'Seans sona erdi' : 'Mesajınızı yazın...'}
                  className="min-h-[44px] max-h-36 resize-none rounded-2xl border-violet-200 bg-violet-50/60 pr-12 py-3 text-sm focus:ring-violet-400 focus:border-violet-400 transition-colors"
                  disabled={sessionEnded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e);
                    }
                  }}
                />
                {input.trim().length > 0 && (
                  <span className={cn(
                    'absolute right-3 bottom-3 text-[10px] tabular-nums font-medium',
                    charCount > MAX_CHAR_COUNT
                      ? 'text-red-500'
                      : charCount > MAX_CHAR_COUNT * 0.85
                      ? 'text-amber-400'
                      : userMessageCount === 0 && charCount < MIN_CHAR_COUNT
                      ? 'text-amber-400'
                      : 'text-emerald-500'
                  )}>
                    {charCount}/{userMessageCount === 0 && charCount < MIN_CHAR_COUNT ? MIN_CHAR_COUNT : MAX_CHAR_COUNT}
                  </span>
                )}
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim() || sessionEnded || (userMessageCount === 0 && charCount < MIN_CHAR_COUNT) || charCount > MAX_CHAR_COUNT}
                className="h-11 w-11 shrink-0 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white shadow-sm transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>

      {/* Değerlendirme Anketi Modal */}
      {showRating && !ratingSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl my-4">
            <h3 className="mb-2 text-center text-lg font-semibold">Seans Değerlendirmesi</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Deneyiminizi değerlendirin
            </p>

            {/* Detaylı Sorular */}
            <div className="space-y-4 mb-6">
              {[
                { key: 'contentQuality', label: 'İçerik Yeterliliği', desc: 'Seans içeriği faydalı mıydı?' },
                { key: 'sessionDuration', label: 'Süre Yeterliliği', desc: '10 soru yeterli miydi?' },
                { key: 'responseSpeed', label: 'Yanıt Hızı', desc: 'Yanıtlar hızlı geldi mi?' },
                { key: 'communication', label: 'İletişim Kalitesi', desc: 'Sorular anlaşılır mıydı?' },
                { key: 'overall', label: 'Genel Memnuniyet', desc: 'Genel olarak memnun kaldınız mı?' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(key as keyof typeof ratings, star)}
                        className={cn(
                          'text-xl transition-transform hover:scale-110',
                          star <= ratings[key as keyof typeof ratings] ? 'text-yellow-400' : 'text-gray-300'
                        )}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* NPS Sorusu */}
            <div className="mb-6 p-4 rounded-xl bg-muted/50">
              <p className="text-sm font-medium mb-1">Bu hizmeti arkadaşlarınıza önerir misiniz?</p>
              <p className="text-xs text-muted-foreground mb-3">0 = Kesinlikle hayır, 10 = Kesinlikle evet</p>
              <div className="flex justify-between gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => setNpsScore(score)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                      npsScore === score
                        ? score >= 9 ? 'bg-green-500 text-white'
                          : score >= 7 ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Yorum Alanı */}
            <Textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Görüşlerinizi paylaşın (opsiyonel)..."
              className="mb-4 min-h-[80px] resize-none"
            />

            {/* Butonlar */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRating(false);
                  router.push('/panel');
                }}
              >
                Geç
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
                disabled={!isRatingComplete}
                onClick={submitRating}
              >
                Gönder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Değerlendirme Teşekkür */}
      {ratingSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
            <button
              onClick={() => router.push('/panel')}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="mb-4 text-4xl">🙏</div>
            <h3 className="mb-2 text-lg font-semibold">Teşekkürler!</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Değerlendirmeniz için teşekkür ederiz.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/panel')}
              >
                Panele Dön
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Yeni Seans Başlat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Seans Onay Modalı */}
      <SessionConfirmModal
        isOpen={showSessionConfirm}
        onConfirm={handleSessionConfirm}
        onCancel={() => setShowSessionConfirm(false)}
        type="session"
        title="Seans Başlatılacak"
        description={`${mentor.title} ile koçluk/mentorluk seansı başlatmak üzeresiniz. 10 soruluk bir görüşme yapacak ve sonunda ödev ile özet alacaksınız.`}
      />

      {/* Seans Çıkış Uyarı Modalı */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-white">
              Seanstan Ayrılmak İstiyor musunuz?
            </h3>
            <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Seansınız henüz tamamlanmadı. Şimdi ayrılırsanız{' '}
              <span className="font-semibold text-red-600 dark:text-red-400">seans hakkınız yanacaktır</span> ve
              bu görüşmeye geri dönemezsiniz.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowExitWarning(false)}
              >
                Seansa Dön
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  setShowExitWarning(false);
                  router.push('/mentors');
                }}
              >
                Yine de Çık
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
