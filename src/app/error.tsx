'use client';

import React from 'react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full rounded-xl border border-red-500/30 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-red-400 mb-2">
          Falha ao processar operação
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          {error.message ||
            'Ocorreu um erro inesperado na comunicação com o servidor.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
