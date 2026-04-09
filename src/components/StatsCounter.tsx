'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Clock, ClipboardList, CheckCircle2 } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  color: string;
}

const stats: Stat[] = [
  { label: 'Kullanıcı', value: 107, icon: Users, color: 'text-primary' },
  { label: 'Seans Dakikası', value: 2354, suffix: '+', icon: Clock, color: 'text-secondary' },
  { label: 'Verilen Ödev', value: 211, icon: ClipboardList, color: 'text-accent' },
  { label: 'Tamamlanan Ödev', value: 71, icon: CheckCircle2, color: 'text-green-500' },
];

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count.toLocaleString('tr-TR')}{suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <section className="border-y border-border/50 bg-gradient-to-r from-muted/30 via-white to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-foreground md:text-4xl">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
