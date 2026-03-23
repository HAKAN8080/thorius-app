'use client';

import { Mentor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MessageCircle, Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MentorCardProps {
  mentor: Mentor;
  userPlan?: string | null;
}

function isImageUrl(avatar: string): boolean {
  return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/');
}

export function MentorCard({ mentor, userPlan }: MentorCardProps) {
  const isCoach = mentor.category === 'coach';
  const isPremiumLocked = mentor.isPremium && userPlan !== 'premium';

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
      isPremiumLocked
        ? 'border-amber-200/60 hover:border-amber-300/80 hover:shadow-amber-100'
        : 'border-border hover:border-primary/30 hover:shadow-primary/8'
    }`}>
      {/* Avatar — tam genişlik, üstte */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {isImageUrl(mentor.avatar) ? (
          <Image
            src={mentor.avatar}
            alt={mentor.title}
            fill
            className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${isPremiumLocked ? 'brightness-90' : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl">
            {mentor.avatar}
          </div>
        )}

        {/* Kategori etiketi */}
        <div className="absolute left-3 top-3">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${
            isCoach ? 'bg-primary' : 'bg-secondary'
          }`}>
            {isCoach ? 'AI Koç' : 'AI Mentor'}
          </span>
        </div>

        {/* Premium rozeti — avatarın sağ üst köşesi */}
        {mentor.isPremium && (
          <div className="absolute right-3 top-3">
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #92400e, #d97706, #fbbf24)', color: '#fff' }}>
              <Crown className="h-3 w-3" />
              Premium
            </div>
          </div>
        )}

        {/* Kilit overlay — premium olmayan kullanıcı için */}
        {isPremiumLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-black/10 to-transparent">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-300/60 bg-amber-500/20 backdrop-blur-sm">
              <Lock className="h-6 w-6 text-amber-200" />
            </div>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 text-lg font-bold text-foreground">{mentor.title}</h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{mentor.description}</p>

        {/* Uzmanlık etiketleri */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {mentor.expertise.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {skill}
            </span>
          ))}
          {mentor.expertise.length > 3 && (
            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              +{mentor.expertise.length - 3}
            </span>
          )}
        </div>

        {isPremiumLocked ? (
          <Link href="/pricing">
            <Button className="w-full gap-2 border border-amber-300/60 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-100 font-medium" variant="outline">
              <Crown className="h-4 w-4 text-amber-500" />
              Premium'a Geç
            </Button>
          </Link>
        ) : (
          <Link href={`/chat/${mentor.id}`}>
            <Button className="w-full gap-2 bg-primary text-white shadow-sm hover:bg-primary/90 font-medium">
              <MessageCircle className="h-4 w-4" />
              Sohbete Başla
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
