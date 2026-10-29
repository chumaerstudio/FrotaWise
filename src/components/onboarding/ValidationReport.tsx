'use client';

import React from 'react';
import type { SnapshotValidationConflict } from '@/services/onboardingService';

export interface ValidationReportProps {
  versaoDetectada: string | null;
  conflitos: SnapshotValidationConflict[];
}

export function ValidationReport({
  versaoDetectada,
  conflitos,
}: ValidationReportProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-semibold">
          Relatório de Pré-Validação (Dry-Run)
        </span>
        <span className="font-mono text-slate-400">
          Versão: {versaoDetectada ?? 'N/A'}
        </span>
      </div>
      {conflitos.length === 0 ? (
        <p className="mt-3 text-emerald-400">
          Nenhum conflito estrutural detectado. Pronto para submissão controlada.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-red-300">
          {conflitos.map((c, i) => (
            <li key={i}>
              [{c.entidade} #{c.indice} - {c.campo}]: {c.mensagem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
