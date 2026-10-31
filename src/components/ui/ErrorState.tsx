'use client';

import React from 'react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Não foi possível carregar os dados',
  message,
  code,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-slate-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-400">{title}</h3>
          <p className="mt-1 text-xs text-slate-300">{message}</p>
          {code && (
            <span className="mt-2 inline-block rounded bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-400">
              Código: {code}
            </span>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-red-600/80 hover:bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
