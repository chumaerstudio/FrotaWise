import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FrotaWise Enterprise | Gestão Inteligente de Pneus e Frotas Pesadas',
  description: 'Sistema corporativo para controle de CPK, malha de pneus, ciclos de remold e telemetria de frotas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
