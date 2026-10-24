'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Disc,
  Wrench,
  Database,
  Download,
  Plus,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { APP_VERSION, LOGO_FROTAWISE } from '@/services/api';
import { Btn, cx } from '@/components/ui';
import { GlobalModals } from '@/components/forms/GlobalModals';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    company,
    theme,
    setTheme,
    toast,
    tireAlerts,
    totalStockTires,
    setShowVehicleModal,
    setShowTireModal,
    setShowMaintenanceModal,
    handleExportBackup,
  } = useEstoquePneus();

  const navItems = [
    {
      href: '/',
      label: 'Visão geral',
      sub: 'Indicadores, despesas e ordens de ação da frota',
      icon: LayoutDashboard,
      badge: tireAlerts.length || null,
    },
    {
      href: '/veiculos',
      label: 'Frota de veículos',
      sub: 'Cadastro e acompanhamento de cada equipamento',
      icon: Truck,
      badge: null,
    },
    {
      href: '/pneus',
      label: 'Pneus e estoque',
      sub: 'Movimentação no chassi, almoxarifado e histórico',
      icon: Disc,
      badge: totalStockTires.length || null,
    },
    {
      href: '/custos-multas',
      label: 'Manutenções e multas',
      sub: 'Despesas lançadas por veículo',
      icon: Wrench,
      badge: null,
    },
    {
      href: '/malha-pneus',
      label: 'Configurações e malha',
      sub: 'Empresa, regras de alerta por modelo e cópia de segurança',
      icon: Database,
      badge: null,
    },
  ];

  const activeNav = navItems.find((n) => n.href === pathname) || navItems[0];

  return (
    <div className="ef ef-shell" data-theme={theme}>
      {toast && (
        <div
          key={toast.k}
          role="status"
          className="ef-toast fixed bottom-5 right-5 ef-z60 px-4 py-3 rounded-xl flex items-center gap-3 ef-t13_5 font-medium text-white"
          style={{
            background: toast.type === 'error' ? '#8F2A22' : 'var(--pet)',
            boxShadow: '0 12px 30px rgba(6,16,32,.35)',
          }}
        >
          {toast.type === 'error' ? (
            <AlertTriangle size={18} color="#F2B01E" />
          ) : (
            <CheckCircle2 size={18} color="#5BE0A6" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <aside className="ef-side">
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          {company.logoUrl ? (
            <div className="inline-flex rounded-xl bg-white p-2">
              <img src={company.logoUrl} alt="Logo da empresa" className="h-11 w-auto object-contain" />
            </div>
          ) : (
            <img
              src={LOGO_FROTAWISE}
              alt="FrotaWise"
              draggable={false}
              className="block h-auto ef-fade"
              style={{ width: 184 }}
            />
          )}
        </div>

        <nav className="ef-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isOn = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isOn ? 'page' : undefined}
                className={cx('nav', isOn && 'nav-on')}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className="mono ef-t11 font-bold px-2 ef-py0_5 rounded-full"
                    style={{ background: 'var(--brand)', color: '#06213F' }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ef-side-foot">
          <button
            onClick={handleExportBackup}
            className="btn w-full"
            style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }}
          >
            <Download size={16} color="#18B389" />
            Salvar backup no Pen Drive
          </button>
          <div className="ef-t11_5 mt-3 text-center" style={{ color: '#7F93B3' }}>
            Versão {APP_VERSION} · {company.nomeEmpresa}
          </div>
        </div>
      </aside>

      <div className="ef-main">
        <header
          className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30"
          style={{
            background: 'var(--hdr)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <span
            aria-hidden
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: -1,
              height: 2,
              background: 'linear-gradient(90deg, var(--axle), var(--brand) 38%, transparent 72%)',
              opacity: 0.75,
            }}
          />
          <div>
            <div className="flex items-center gap-2 ef-t12_5" style={{ color: 'var(--mute)' }}>
              <span className="dot" />
              <span>{company.nomeEmpresa} · Banco local ativo · 100% offline</span>
            </div>
            <h1 className="ef-t22 font-semibold leading-tight">{activeNav.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Btn
              icon={theme === 'dark' ? Sun : Moon}
              title="Alternar tema claro/escuro"
              aria-label="Alternar tema claro/escuro"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <Btn icon={Plus} onClick={() => setShowVehicleModal(true)}>
              Veículo
            </Btn>
            <Btn icon={Plus} onClick={() => setShowTireModal(true)}>
              Pneu
            </Btn>
            <Btn v="dark" icon={Plus} onClick={() => setShowMaintenanceModal(true)}>
              Despesa
            </Btn>
          </div>
        </header>

        <main className="p-6 flex-1">
          <p className="ef-t13_5 mb-5" style={{ color: 'var(--ink2)' }}>
            {activeNav.sub}
          </p>
          <div key={pathname} className="ef-rise">
            {children}
          </div>
        </main>
      </div>

      <GlobalModals />
    </div>
  );
}
