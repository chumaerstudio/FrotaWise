'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ItemNavegacao {
  nome: string;
  rota: string;
  descricaoCurta: string;
}

const ITENS_MENU: ItemNavegacao[] = [
  { nome: 'Painel Principal', rota: '/', descricaoCurta: 'Visão Geral & Alertas Remold' },
  { nome: 'Estoque de Pneus', rota: '/pneus', descricaoCurta: 'Alocação, Fogo & Envio Remold' },
  { nome: 'Malha de Pneus', rota: '/malha-pneus', descricaoCurta: 'Marcas, Aros & Limites de KM' },
  { nome: 'Frota de Veículos', rota: '/veiculos', descricaoCurta: 'Caminhões & Mapa de Eixos' },
  { nome: 'Custos e Multas', rota: '/custos-multas', descricaoCurta: 'Infrações & Reparos por KM' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Menu Lateral Fixo (Sidebar) */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-base">
            FW
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight block leading-none">
              FrotaWise
            </span>
            <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
              Enterprise Edition
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {ITENS_MENU.map((item) => {
            const ativo = pathname === item.rota;
            return (
              <Link
                key={item.rota}
                href={item.rota}
                className={`block px-4 py-3 rounded-xl transition-all ${
                  ativo
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="text-sm font-bold">{item.nome}</div>
                <div className={`text-xs ${ativo ? 'text-blue-100' : 'text-slate-400'}`}>
                  {item.descricaoCurta}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-1">
          <div className="text-slate-400 font-medium">Unidade Operacional Ativa</div>
          <div className="font-bold text-white truncate">
            {usuario?.tenant.nomeFantasia || 'TransLog Brasil S.A.'}
          </div>
          <div className="text-emerald-400 font-semibold">
            ● Telemetria Online ({usuario?.tenant.frotaTotal || 420} caminhões)
          </div>
        </div>
      </aside>

      {/* Área Principal + Topo Fixo com Nome da Transportadora */}
      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-bold tracking-wider uppercase">
              {usuario?.tenant.id || 'TRANSLOG-BR'}
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {usuario?.tenant.razaoSocial || 'TransLog Brasil S.A. Logística Integrada'}
              </h2>
              <p className="text-xs text-slate-500">
                CNPJ: {usuario?.tenant.cnpj || '14.892.301/0001-88'} • {usuario?.tenant.unidadesAtivas || 18} Filiais Conectadas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">{usuario?.nome}</div>
              <div className="text-xs text-slate-500">{usuario?.cargo.replace('_', ' ')}</div>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Trocar Conta
            </Link>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
