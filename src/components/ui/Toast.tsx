'use client';

import React from 'react';

export interface ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export function Toast({ variant = 'info', message, onClose }: ToastProps) {
  const styles = {
    success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200',
    error: 'border-red-500/40 bg-red-950/90 text-red-200',
    warning: 'border-amber-500/40 bg-amber-950/90 text-amber-200',
    info: 'border-blue-500/40 bg-slate-900/90 text-slate-100',
  }[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-xs shadow-lg ' +
        styles
      }
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 font-bold opacity-75 hover:opacity-100"
          aria-label="Fechar aviso"
        >
          ×
        </button>
      )}
    </div>
  );
}
