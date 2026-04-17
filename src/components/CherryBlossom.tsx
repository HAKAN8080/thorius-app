'use client';

import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

export function CherryBlossom() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const initialPetals: Petal[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 7,
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
    }));
    setPetals(initialPetals);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-fall"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
          }}
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            fill="none"
            style={{
              transform: `rotate(${petal.rotation}deg)`,
              filter: 'drop-shadow(0 0 6px rgba(255, 107, 157, 0.8)) drop-shadow(0 2px 4px rgba(255, 107, 157, 0.5))',
            }}
          >
            {/* Kiraz çiçeği yaprağı - Canlı pembe */}
            <ellipse cx="12" cy="8" rx="6" ry="8" fill="#FF6B9D" opacity="1" />
            <ellipse cx="12" cy="8" rx="4" ry="6" fill="#FF8FB5" opacity="1" />
            <circle cx="12" cy="6" r="1.5" fill="#FFB7D5" opacity="1" />
          </svg>
        </div>
      ))}

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) rotate(90deg) translateX(30px);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(-20px);
          }
          75% {
            transform: translateY(75vh) rotate(270deg) translateX(25px);
          }
          100% {
            transform: translateY(100vh) rotate(360deg) translateX(-10px);
            opacity: 0.6;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}
