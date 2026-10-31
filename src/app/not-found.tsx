import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Página não encontrada (404)</h2>
        <p className="text-sm text-slate-400 mb-6">
          O recurso solicitado não existe ou você não possui permissão de visualização.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition"
        >
          Voltar ao Painel
        </Link>
      </div>
    </div>
  );
}
