'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  type?: 'test' | 'session';
}

export function SessionConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  type = 'session',
}: SessionConfirmModalProps) {
  if (!isOpen) return null;

  const defaultTitle = type === 'test'
    ? 'Test Başlatılacak'
    : 'Seans Başlatılacak';

  const defaultDescription = type === 'test'
    ? 'Bu testi tamamladığınızda seans hakkınızdan 1 adet düşülecektir. Karşılığında detaylı AI analizi ve PDF raporu alacaksınız.'
    : 'Bu görüşme başladığında seans hakkınızdan 1 adet düşülecektir. 10 soruluk bir koçluk/mentorluk seansı yapacaksınız.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title || defaultTitle}</h3>
              <p className="text-sm text-muted-foreground">Seans hakkı kullanımı</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ <strong>1 seans hakkınız düşülecektir.</strong>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {description || defaultDescription}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Vazgeç
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            onClick={onConfirm}
          >
            Onaylıyorum, Başla
          </Button>
        </div>
      </div>
    </div>
  );
}
