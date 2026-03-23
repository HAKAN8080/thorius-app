'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Sparkles, AlertTriangle, Lock, Crown, Volume2, VolumeX, Star, CheckCircle2 } from 'lucide-react';
import { Mentor } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const MAX_USER_MESSAGES = 10;

interface ChatInterfaceProps {
  mentor: Mentor;
}

// İlk mesajda seansı başlat
async function startSession(
  mentor: Mentor,
  firstMessage: string,
  onSessionStarted?: (id: string) => void
) {
  try {
    const res = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorTitle: mentor.title,
        firstMessage,
      }),
    });
    const data = await res.json();
    if (data.id && onSessionStarted) {
      onSessionStarted(data.id);
    }
    return data.id;
  } catch {
    return null;
  }
}

// Seansı tamamla (özet ve ödev oluştur)
async function completeSession(
  sessionId: string,
  mentor: Mentor,
  messages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text?: string }> }>,
  onSessionCompleted?: () => void
) {
  try {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorTitle: mentor.title,
        messages: messages.map((m) => ({ role: m.role, text: getTextContent(m) })),
      }),
    });
    if (onSessionCompleted) {
      onSessionCompleted();
    }
  } catch {
    // sessiz hata
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
  sessionLimit: number;
  limitReached: boolean;
  isFree: boolean;
}

export function ChatInterface({ mentor }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);

  const [closingSent, setClosingSent] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(true);
  const [audioTime, setAudioTime] = useState(0);
  const [preparingAudioId, setPreparingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  const wordTimingsRef = useRef<Map<string, Array<{ word: string; start: number; end: number }>>>(new Map());

  // Rating state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratings, setRatings] = useState({
    contentQuality: 0,
    sessionDuration: 0,
    responseSpeed: 0,
    communication: 0,
    overall: 0,
  });
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  const RATING_QUESTIONS = [
    { key: 'contentQuality', label: 'İçerik Yeterliliği', desc: 'Verilen bilgiler faydalı mıydı?' },
    { key: 'sessionDuration', label: 'Süre Yeterliliği', desc: 'Seans süresi yeterli miydi?' },
    { key: 'responseSpeed', label: 'Yanıt Hızı', desc: 'Yanıtlar yeterince hızlı mıydı?' },
    { key: 'communication', label: 'İletişim Kalitesi', desc: 'Sorunlarınıza odaklanıldı mı?' },
    { key: 'overall', label: 'Genel Değerlendirme', desc: 'Seansı genel olarak nasıl buldunuz?' },
  ] as const;

  const allRated = Object.values(ratings).every(r => r > 0) && npsScore !== null;

  async function submitRating() {
    if (!sessionId || !allRated) return;
    setRatingLoading(true);
    try {
      await fetch('/api/sessions/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ratings, npsScore, comment: feedbackComment }),
      });
      setRatingSubmitted(true);
    } catch {
      // Sessiz hata
    } finally {
      setRatingLoading(false);
    }
  }

  function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-muted-foreground/40 hover:text-amber-300'
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  async function handleSpeak(messageId: string, text: string) {
    if (playingId === messageId) {
      audioRef.current?.pause();
      setPlayingId(null);
      setPreparingAudioId(null);
      setAudioTime(0);
      return;
    }
    setPreparingAudioId(messageId);
    setAudioTime(0);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mentorId: mentor.id }),
      });
      if (!res.ok) { setPreparingAudioId(null); return; }
      const data = await res.json() as { audioBase64: string; wordTimings: Array<{ word: string; start: number; end: number }> };
      wordTimingsRef.current.set(messageId, data.wordTimings ?? []);
      const audioBytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); }
      audioRef.current = new Audio(url);
      audioRef.current.ontimeupdate = () => setAudioTime(audioRef.current?.currentTime ?? 0);
      setPreparingAudioId(null);
      setPlayingId(messageId);
      audioRef.current.play();
      audioRef.current.onended = () => { setPlayingId(null); setAudioTime(0); URL.revokeObjectURL(url); };
    } catch { setPreparingAudioId(null); setPlayingId(null); }
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

  // Seans aktifken sayfa değişikliğinde uyarı ver
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionStarted && !sessionCompleted) {
        e.preventDefault();
        // Modern tarayıcılar custom mesaj göstermiyor ama returnValue gerekli
        e.returnValue = 'Seans hakkınız düştü. Seans bitmeden çıkış yapmak istediğinize emin misiniz?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStarted, sessionCompleted]);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  // Kapanış cevabı gelince seansı tamamla
  useEffect(() => {
    if (!closingSent || sessionCompleted || isLoading || messages.length <= 1) return;
    if (!activeSessionId) return; // seans başlatılmamışsa
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;
    setSessionCompleted(true);
    setSessionId(activeSessionId);
    setShowRating(true);
    completeSession(activeSessionId, mentor, messages as Parameters<typeof completeSession>[2], () => {
      // Tamamlandı
    });
  }, [closingSent, sessionCompleted, isLoading, messages, mentor, activeSessionId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || sessionEnded) return;

    const messageText = input.trim();

    // İlk mesajda seansı başlat (hak düşsün)
    if (!sessionStarted && userMessageCount === 0) {
      setSessionStarted(true);
      const id = await startSession(mentor, messageText, (sessionId) => {
        setActiveSessionId(sessionId);
      });
      if (!id) {
        // Seans başlatılamadı (limit dolmuş olabilir)
        setSessionStarted(false);
        return;
      }
    }

    sendMessage({ role: 'user', parts: [{ type: 'text', text: messageText }] });
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
    <div className="flex flex-col gap-3">
      {/* AI Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/8 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          <span className="font-semibold">Önemli Uyarı:</span> Bu platformdaki tüm yanıtlar yapay zeka (AI) tarafından
          otomatik olarak üretilmektedir. Thorius ve çalışanları, AI yanıtlarının doğruluğu veya bu yanıtlara dayanılarak
          alınan kararların sonuçlarından <span className="font-semibold">hiçbir sorumluluk kabul etmez</span>.
          Sağlık, hukuk veya finansal konularda mutlaka alanında uzman bir profesyonele danışınız.
        </p>
      </div>

      <div className="flex h-[calc(100vh-16rem)] min-h-[400px] flex-col overflow-hidden rounded-2xl border-2 border-border/80 bg-gradient-to-b from-card/80 to-card/40 shadow-2xl shadow-primary/5 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center gap-4 border-b-2 border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 px-5 py-4">
          <div className="relative">
            <MentorAvatar size="md" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold tracking-tight">{mentor.name}</h3>
            <p className="text-sm font-medium text-muted-foreground">{mentor.title}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Soru Sayacı */}
            <div className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5',
              userMessageCount >= 8
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600'
                : 'border-border bg-muted/50 text-muted-foreground'
            )}>
              <div className="flex gap-0.5">
                {Array.from({ length: MAX_USER_MESSAGES }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors',
                      i < userMessageCount ? 'bg-primary' : 'bg-border'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold tabular-nums">
                {userMessageCount}/{MAX_USER_MESSAGES}
              </span>
            </div>
            {/* Ses/Metin Toggle */}
            <button
              onClick={() => {
                if (voiceMode) { audioRef.current?.pause(); setPlayingId(null); }
                setVoiceMode((v) => !v);
              }}
              title={voiceMode ? 'Sesi kapat (metin modu)' : 'Sesi aç (sesli mod)'}
              className={cn(
                'flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all',
                voiceMode
                  ? 'border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/20 hover:bg-primary/20'
                  : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {voiceMode ? 'Sesli' : 'Metin'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="min-h-0 flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl" />
                  <div className="relative rounded-full border-4 border-primary/20 p-1">
                    <MentorAvatar size="lg" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold tracking-tight">Merhaba! Ben {mentor.title}</h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {mentor.description}. Bugün sana nasıl yardımcı olabilirim?
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {mentor.expertise.map((skill) => (
                    <span key={skill} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Bu seansta <span className="font-bold text-foreground">{MAX_USER_MESSAGES} soru</span> hakkınız var
                  </p>
                </div>
              </div>
            )}

            {visibleMessages.map((message) => {
              const text = getTextContent(message as Parameters<typeof getTextContent>[0]);
              if (!text) return null;
              // Sesli modda: streaming veya ses hazırlanırken mesajı gizle
              const isStreamingThisMsg = voiceMode && status === 'streaming' &&
                message.role === 'assistant' && message.id === messages[messages.length - 1]?.id;
              const isPreparingThisMsg = voiceMode && preparingAudioId === message.id;
              if (isStreamingThisMsg || isPreparingThisMsg) return null;
              return (
                <div key={message.id} className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}>
                  {message.role === 'user' ? (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-gradient-to-br from-secondary/20 to-primary/20 text-sm shadow-sm">
                      👤
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <MentorAvatar size="sm" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 max-w-[80%]">
                    <div className={cn(
                      'rounded-2xl px-4 py-3 shadow-sm',
                      message.role === 'user'
                        ? 'rounded-br-md bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-primary/20'
                        : 'rounded-bl-md border border-border/50 bg-card/80 shadow-sm'
                    )}>
                      {message.role === 'assistant' ? renderHighlightedText(text, message.id) : <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>}
                    </div>
                    {message.role === 'assistant' && playingId === message.id && (
                      <button
                        onClick={() => { audioRef.current?.pause(); setPlayingId(null); }}
                        className="flex items-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        <VolumeX className="h-3 w-3" /> Durdur
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {(status === 'submitted' || (voiceMode && status === 'streaming') || preparingAudioId) && (
              <div className="flex gap-3">
                <div className="shrink-0 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <MentorAvatar size="sm" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-border/50 bg-card/80 px-4 py-3 shadow-sm">
                  {preparingAudioId ? (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Sesli yanıt hazırlanıyor...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {voiceMode && status === 'streaming' ? 'Yanıt oluşturuluyor...' : 'Düşünüyor...'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            {!voiceMode && status === 'streaming' && messages[messages.length - 1]?.role === 'assistant' && (
              // Metin modunda: streaming devam ediyor ama mesaj zaten render ediliyor, spinner yok
              null
            )}

            {sessionEnded && sessionCompleted && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent px-6 py-6">
                {/* Rating Form */}
                {showRating && !ratingSubmitted && (
                  <div className="mb-6">
                    <div className="mb-4 text-center">
                      <h4 className="font-semibold text-foreground">Seansı Değerlendir</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Geri bildiriminiz hizmetimizi geliştirmemize yardımcı olur
                      </p>
                    </div>
                    <div className="space-y-3">
                      {RATING_QUESTIONS.map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-card/50 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{label}</p>
                            <p className="text-xs text-muted-foreground truncate">{desc}</p>
                          </div>
                          <StarRating
                            value={ratings[key as keyof typeof ratings]}
                            onChange={(v) => setRatings(prev => ({ ...prev, [key]: v }))}
                          />
                        </div>
                      ))}

                      {/* NPS Sorusu */}
                      <div className="mt-4 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 px-4 py-4">
                        <p className="text-sm font-semibold text-foreground text-center mb-1">
                          Thorius'u bir arkadaşınıza önerir misiniz?
                        </p>
                        <p className="text-xs text-muted-foreground text-center mb-3">
                          0 = Kesinlikle hayır, 10 = Kesinlikle evet
                        </p>
                        <div className="flex justify-center gap-1">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setNpsScore(score)}
                              className={cn(
                                'h-8 w-8 rounded-lg text-xs font-bold transition-all',
                                npsScore === score
                                  ? score <= 6
                                    ? 'bg-red-500 text-white scale-110'
                                    : score <= 8
                                    ? 'bg-amber-500 text-white scale-110'
                                    : 'bg-green-500 text-white scale-110'
                                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground px-1">
                          <span>Önermem</span>
                          <span>Kesinlikle öneririm</span>
                        </div>
                      </div>

                      {/* Açık Uçlu Yorum */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Talep, Öneri veya Şikayetiniz
                          <span className="text-muted-foreground font-normal ml-1">(opsiyonel)</span>
                        </label>
                        <Textarea
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="Deneyiminizi nasıl geliştirebiliriz? Herhangi bir öneriniz veya şikayetiniz var mı?"
                          className="min-h-[80px] resize-none rounded-xl border-border/80 bg-card/50 text-sm"
                          maxLength={500}
                        />
                        <p className="mt-1 text-right text-xs text-muted-foreground">
                          {feedbackComment.length}/500
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={submitRating}
                      disabled={!allRated || ratingLoading}
                      className="mt-4 w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      {ratingLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Değerlendirmeyi Gönder</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Rating Submitted */}
                {ratingSubmitted && (
                  <div className="mb-6 flex flex-col items-center gap-2 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                    <p className="font-semibold text-foreground">Teşekkürler!</p>
                    <p className="text-sm text-muted-foreground">
                      Değerlendirmeniz kaydedildi.
                    </p>
                  </div>
                )}

                {/* Session Complete Info */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <Lock className="h-6 w-6 text-primary/60" />
                  <div>
                    <p className="font-semibold">Seans tamamlandı</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bu seansta {MAX_USER_MESSAGES} sorunuzu kullandınız.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="mt-1">
                    Yeni Seans Başlat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={onSubmit} className="border-t-2 border-border/60 bg-gradient-to-r from-muted/30 via-transparent to-muted/30 p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sessionEnded ? 'Seans sona erdi.' : 'Mesajınızı yazın...'}
                className="min-h-[52px] max-h-32 resize-none rounded-xl border-2 border-border/80 bg-card/80 pr-4 text-sm shadow-inner focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                disabled={sessionEnded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || sessionEnded}
              className="h-[52px] w-[52px] shrink-0 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 disabled:hover:scale-100"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
            Claude Sonnet 4.6 ile desteklenmektedir
          </p>
        </form>
      </div>
    </div>
  );
}
