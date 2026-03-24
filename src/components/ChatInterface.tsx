'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Sparkles, AlertTriangle, Lock, Crown, Volume2, VolumeX } from 'lucide-react';
import { Mentor } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const MAX_USER_MESSAGES = 10;

interface ChatInterfaceProps {
  mentor: Mentor;
}

async function saveSession(
  mentor: Mentor,
  messages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text?: string }> }>
) {
  // İlk gerçek kullanıcı mesajını gündem olarak kaydet
  const firstUserMsg = messages.find(
    (m) => m.role === 'user' && getTextContent(m) !== '__KAPANIS__' && getTextContent(m).trim()
  );
  const agenda = firstUserMsg ? getTextContent(firstUserMsg).slice(0, 300) : null;

  try {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorTitle: mentor.title,
        messages: messages.map((m) => ({ role: m.role, text: getTextContent(m) })),
        agenda,
      }),
    });
  } catch {
    // sessiz hata — kullanıcıyı etkilemesin
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
  const [sessionSaved, setSessionSaved] = useState(false);
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);

  const [closingSent, setClosingSent] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(true);
  const [audioTime, setAudioTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  const wordTimingsRef = useRef<Map<string, Array<{ word: string; start: number; end: number }>>>(new Map());

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
      audioRef.current.onended = () => { setPlayingId(null); setAudioTime(0); URL.revokeObjectURL(url); };
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

  // Kapanış cevabı gelince kaydet
  useEffect(() => {
    if (!closingSent || sessionSaved || isLoading || messages.length <= 1) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;
    setSessionSaved(true);
    saveSession(mentor, messages as Parameters<typeof saveSession>[1]);
  }, [closingSent, sessionSaved, isLoading, messages, mentor]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || sessionEnded) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
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

      <div className="flex h-[calc(100vh-14rem)] flex-col rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/50 p-4">
          <MentorAvatar size="md" />
          <div>
            <h3 className="font-semibold">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground">{mentor.title}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className={cn(
              'text-xs font-medium tabular-nums',
              userMessageCount >= 8 ? 'text-amber-500' : 'text-muted-foreground'
            )}>
              {userMessageCount}/{MAX_USER_MESSAGES} soru
            </span>
            <button
              onClick={() => {
                if (voiceMode) { audioRef.current?.pause(); setPlayingId(null); }
                setVoiceMode((v) => !v);
              }}
              title={voiceMode ? 'Sesi kapat (metin modu)' : 'Sesi aç (sesli mod)'}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                voiceMode
                  ? 'bg-primary/15 text-primary hover:bg-primary/25'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {voiceMode ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {voiceMode ? 'Sesli' : 'Metin'}
            </button>
            {!sessionEnded && (
              <div className="flex items-center gap-1.5 text-xs text-green-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Çevrimiçi
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4"><MentorAvatar size="lg" /></div>
                <h3 className="mb-2 text-lg font-semibold">Merhaba! Ben {mentor.title}</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  {mentor.description}. Bugün sana nasıl yardımcı olabilirim?
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {mentor.expertise.map((skill) => (
                    <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Bu seansta <span className="font-medium">{MAX_USER_MESSAGES} soru</span> hakkınız var.
                </p>
              </div>
            )}

            {visibleMessages.map((message) => {
              const text = getTextContent(message as Parameters<typeof getTextContent>[0]);
              if (!text) return null;
              // Sesli modda: asistan mesajları gösterilmez — sadece ses çalar
              if (voiceMode && message.role === 'assistant') return null;
              // Sesli modda streaming olan son asistan mesajını da gizle
              if (!voiceMode && status === 'streaming' &&
                message.role === 'assistant' && message.id === messages[messages.length - 1]?.id) {
                // streaming devam ediyor, mesaj zaten visibleMessages'da gösteriliyor
              }
              return (
                <div key={message.id} className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}>
                  {message.role === 'user' ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 text-sm">
                      👤
                    </div>
                  ) : (
                    <div className="shrink-0"><MentorAvatar size="sm" /></div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                        : 'bg-muted/50'
                    )}>
                      {message.role === 'assistant' ? renderHighlightedText(text, message.id) : <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sesli mod: ses çalarken dalga animasyonu */}
            {voiceMode && playingId && (
              <div className="flex gap-3">
                <div className="shrink-0"><MentorAvatar size="sm" /></div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-muted/50 px-4 py-3">
                  {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                    <span key={i} className="h-4 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}s` }} />
                  ))}
                  <button
                    onClick={() => { audioRef.current?.pause(); setPlayingId(null); }}
                    className="ml-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    <VolumeX className="h-3 w-3" /> Durdur
                  </button>
                </div>
              </div>
            )}

            {/* Metin modunda yükleme göstergesi */}
            {!voiceMode && status === 'submitted' && (
              <div className="flex gap-3">
                <div className="shrink-0"><MentorAvatar size="sm" /></div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Düşünüyor...</span>
                </div>
              </div>
            )}
            {!voiceMode && status === 'streaming' && messages[messages.length - 1]?.role === 'assistant' && (
              null
            )}

            {sessionEnded && sessionSaved && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-6 text-center">
                <Lock className="h-8 w-8 text-primary/60" />
                <div>
                  <p className="font-semibold">Seans tamamlandı</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bu seansta {MAX_USER_MESSAGES} sorunuzu kullandınız.
                    Yeni bir seans başlatmak için sayfayı yenileyin.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="mt-1">
                  Yeni Seans Başlat
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={onSubmit} className="border-t border-border/50 p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sessionEnded ? 'Seans sona erdi.' : 'Mesajınızı yazın...'}
              className="min-h-[48px] max-h-32 resize-none bg-muted/30"
              disabled={sessionEnded}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || sessionEnded}
              className="h-12 w-12 shrink-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3" />
            Claude Sonnet 4.6 ile desteklenmektedir
          </p>
        </form>
      </div>
    </div>
  );
}
