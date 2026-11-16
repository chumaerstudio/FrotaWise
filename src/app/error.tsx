'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="ef-system-error"><section className="ef-system-error-card" role="alert"><div className="ef-system-error-mark"><AlertTriangle size={23}/></div><span className="ef-system-error-kicker">FROTAWISE · OPERAÇÃO</span><h1>Não foi possível abrir esta página</h1><p>Ocorreu um problema ao apresentar as informações. Os dados que já foram salvos permanecem registrados. Tente novamente e, se o erro continuar, entre em contato com o responsável pelo sistema.</p><button type="button" onClick={reset}><RotateCcw size={16}/> Tentar novamente</button></section></main>;
}
