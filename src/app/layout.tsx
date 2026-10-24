import type { Metadata } from 'next';
import './globals.css';
import { FrotaWiseProvider } from '@/hooks/useFrotaWiseStore';

export const metadata: Metadata = {
  title: 'FrotaWise Enterprise | Sistema de Gestão Logística e Pneus',
  description: 'Gestão corporativa de frotas, movimentação de pneus no chassi, malha de modelos e despesas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <FrotaWiseProvider>{children}</FrotaWiseProvider>
      </body>
    </html>
  );
}
