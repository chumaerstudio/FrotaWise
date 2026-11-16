import Link from 'next/link';
import { ArrowLeft, MapPinOff } from 'lucide-react';

export default function NotFound() {
  return <main className="ef-system-error"><section className="ef-system-error-card"><div className="ef-system-error-mark"><MapPinOff size={23}/></div><span className="ef-system-error-kicker">FROTAWISE · NAVEGAÇÃO</span><h1>Página não encontrada</h1><p>O endereço que você tentou abrir não existe ou não está mais disponível. Volte para a visão geral para continuar a operação.</p><Link href="/"><ArrowLeft size={16}/> Voltar à visão geral</Link></section></main>;
}
