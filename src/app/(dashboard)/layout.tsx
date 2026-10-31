'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  Fuel,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { APP_VERSION, LOGO_FROTAWISE, LOGO_FROTAWISE_ICON } from '@/services/api';
import { Btn, cx } from '@/components/ui';
import { GlobalModals } from '@/components/forms/GlobalModals';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {logout, usuario} = useAuth();
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
    liveMode, isLoadingLiveData, liveError, refreshLiveData,
  } = useEstoquePneus();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecofrota_v3_sidebar_collapsed');
      if (saved === 'true') setSidebarCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ecofrota_v3_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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
      href: '/abastecimento',
      label: 'Abastecimento',
      sub: 'Lançamentos de combustível, KM e média de consumo',
      icon: Fuel,
      badge: null,
    },
    {
      href: '/usuarios',
      label: 'Usuários e acesso',
      sub: 'Gestão de contas, permissões e senhas',
      icon: Users,
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

      <aside className={cx('ef-side', sidebarCollapsed && 'ef-side-collapsed')}>
        <div
          className={cx(
            'pt-5 pb-4 flex items-center',
            sidebarCollapsed ? 'px-2 flex-col gap-3 justify-center' : 'px-4 justify-between gap-2'
          )}
          style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}
        >
          <Link
            href="/"
            title="Voltar para a página inicial (Visão geral)"
            className="inline-flex items-center focus:outline-none transition-transform hover:scale-[1.02]"
          >
            {company.logoUrl ? (
              <div className="inline-flex rounded-xl bg-white p-1.5">
                <img
                  src={company.logoUrl}
                  alt="Logo da empresa"
                  className={cx('object-contain', sidebarCollapsed ? 'h-8 w-8' : 'h-10 w-auto')}
                />
              </div>
            ) : sidebarCollapsed ? (
              <img
                src={LOGO_FROTAWISE_ICON}
                alt="FrotaWise"
                draggable={false}
                className="block h-10 w-10 object-contain ef-fade"
              />
            ) : (
              <img
                src={LOGO_FROTAWISE}
                alt="FrotaWise"
                draggable={false}
                className="block h-auto ef-fade"
                style={{ width: 170 }}
              />
            )}
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className="ef-collapse-btn"
            title={sidebarCollapsed ? 'Expandir menu lateral' : 'Minimizar menu lateral'}
            aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Minimizar menu lateral'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="ef-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isOn = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                aria-current={isOn ? 'page' : undefined}
                className={cx('nav', isOn && 'nav-on')}
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} className="shrink-0" />
                  <span className="ef-nav-label">{item.label}</span>
                </span>
                {item.badge &&
                  (sidebarCollapsed ? (
                    <span className="mono ef-nav-badge-mini">{item.badge}</span>
                  ) : (
                    <span
                      className="mono ef-t11 font-bold px-2 ef-py0_5 rounded-full"
                      style={{ background: 'var(--brand)', color: '#06213F' }}
                    >
                      {item.badge}
                    </span>
                  ))}
              </Link>
            );
          })}
        </nav>

        <div className="ef-side-foot">
          <button
            onClick={handleExportBackup}
            title={sidebarCollapsed ? 'Salvar backup no Pen Drive' : undefined}
            className="btn w-full"
            style={{
              background: 'rgba(255,255,255,.08)',
              color: '#fff',
              padding: sidebarCollapsed ? '10px 0' : undefined,
            }}
          >
            <Download size={16} color="#18B389" className="shrink-0" />
            {!sidebarCollapsed && <span>Salvar backup no Pen Drive</span>}
          </button>
          {!sidebarCollapsed && (
            <div className="ef-t11_5 mt-3 text-center" style={{ color: '#7F93B3' }}>
              Versão {APP_VERSION} · {company.nomeEmpresa}
            </div>
          )}
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
              <span>{company.nomeEmpresa} · {liveMode ? 'Supabase / Render (online)' : 'Banco local ativo · 100% offline'}</span>
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
            {liveMode && usuario && <Btn onClick={() => void logout().then(() => router.replace('/login'))}>Sair</Btn>}
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
          {liveMode && isLoadingLiveData && <div role="status" className="card p-5 mb-4">Carregando os dados da transportadora no Supabase…</div>}
          {liveMode && liveError && <div role="alert" className="card p-5 mb-4">
            <strong>Não foi possível carregar os dados reais:</strong> {liveError}
            <button className="btn ml-3" onClick={() => void refreshLiveData().catch(() => {})}>Tentar novamente</button>
          </div>}
          <p className="ef-t13_5 mb-5" style={{ color: 'var(--ink2)' }}>
            {activeNav.sub}
          </p>
          <div key={pathname} className="ef-rise">
            {(!liveMode || (!isLoadingLiveData && !liveError)) ? children : null}
          </div>
        </main>
      </div>

      <GlobalModals />
    </div>
  );
}
