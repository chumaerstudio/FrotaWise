'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastTone } from '@/hooks/useFrotaWiseStore';

export interface ToastProps {
  variant?: ToastTone;
  message: string;
  onClose?: () => void;
}

export function Toast({ variant = 'info', message, onClose }: ToastProps) {
  const Icon = { success: CheckCircle2, error: AlertCircle, warning: AlertTriangle, info: Info }[variant];
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), (variant === 'error' ? 7500 : 4800) - 220);
    return () => clearTimeout(timer);
  }, [variant, message]);
  const close = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => onClose?.(), 200);
  };

  const node = (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      style={{ zIndex: 200 }}
      className={`${leaving ? 'ef-toast-out' : 'ef-toast'} ef-notice ef-notice-${variant} fixed bottom-4 right-4 z-[200] flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl`}
    >
      <Icon size={20} aria-hidden="true" className="shrink-0 mt-0.5" />
      <span className="flex-1 text-sm leading-relaxed break-words">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={close}
          className="ef-notice-close shrink-0 rounded-lg p-1 -m-1"
          aria-label="Fechar aviso"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );

  // Portal no final da raiz (.ef-shell) para aparecer sempre acima do backdrop blur dos modais.
  const root = typeof document !== 'undefined' ? (document.querySelector('.ef-shell') ?? document.body) : null;
  return root ? createPortal(node, root) : node;
}
