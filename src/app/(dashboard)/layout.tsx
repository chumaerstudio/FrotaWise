'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  Menu,
  X,
  Fuel,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Route,
  ChevronDown,
  LogOut,
  Search,
  FileWarning,
  CalendarClock,
  UserRound,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { LOGO_FROTAWISE, LOGO_FROTAWISE_ICON } from '@/services/api';
import { Btn, cx, PageSkeleton } from '@/components/ui';
import { Toast } from '@/components/ui/Toast';
import { GlobalModals } from '@/components/forms/GlobalModals';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F3F6FA', color: '#0E2240' }}>Preparando sua área de trabalho…</div>}><DashboardLayoutContent>{children}</DashboardLayoutContent></Suspense>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {logout, usuario} = useAuth();
  const {
    company,
    theme,
    setTheme,
    toast,
    dismissToast,
    pendingConfirmation,
    setPendingConfirmation,
    tireAlerts,
    setShowVehicleModal,
    setShowTireModal,
    setShowMaintenanceModal,
    setShowFineModal,
    setShowFuelModal,
    handleExportBackup,
    liveMode, isLoadingLiveData, hasLoadedLiveData, liveError, refreshLiveData,
  } = useEstoquePneus();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const mobileNavRef = useRef<HTMLElement>(null);
  const openMenuButtonRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMobileNavOpen(false); setProfileOpen(false); setNewOpen(false); }, [pathname, searchParams]);
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(value => !value);
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  useEffect(() => {
    if (!profileOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileOpen]);
  useEffect(() => {
    if (!mobileNavOpen) return;
    const before = document.body.style.overflow;
    const menuButton = openMenuButtonRef.current;
    document.body.style.overflow = 'hidden';
    mobileNavRef.current?.querySelector<HTMLElement>('.ef-mobile-close')?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileNavOpen(false); return; }
      if (event.key !== 'Tab') return;
      const focusables = Array.from(mobileNavRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]') || []).filter(el => getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', dismiss);
    return () => { document.body.style.overflow = before; window.removeEventListener('keydown', dismiss); menuButton?.focus(); };
  }, [mobileNavOpen]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecofrota_v3_sidebar_collapsed');
      if (saved === 'true') setSidebarCollapsed(true);
      if (localStorage.getItem('frotawise-density') === 'compact') setDensity('compact');
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    const change = (event: Event) => setDensity((event as CustomEvent<'comfortable' | 'compact'>).detail);
    window.addEventListener('frotawise-density-change', change);
    return () => window.removeEventListener('frotawise-density-change', change);
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

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // O logout já encerra a sessão local mesmo se o serviço não responder.
    } finally {
      setProfileOpen(false);
      setLoggingOut(false);
      router.replace('/login');
    }
  };

  const displayName = usuario?.nome?.trim() || 'Usuário';
  const initials = displayName.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toLocaleUpperCase('pt-BR');
  const roleLabel = usuario?.papel === 'ADMIN' ? 'Administrador' : usuario?.papel === 'DIRETOR' ? 'Diretor' : 'Operador';

  const navItems = [
    {
      href: '/',
      label: 'Visão geral',
      sub: 'Indicadores, despesas e ordens de ação da frota',
      icon: LayoutDashboard,
      badge: tireAlerts.length || null,
      group: 'Início',
    },
    {
      href: '/veiculos',
      label: 'Frota de veículos',
      sub: 'Cadastro e acompanhamento de cada equipamento',
      icon: Truck,
      badge: null,
      group: 'Operação',
    },
    {
      href: '/pneus',
      label: 'Pneus e estoque',
      sub: 'Movimentação no chassi, almoxarifado e histórico',
      icon: Disc,
      badge: tireAlerts.length || null,
      group: 'Operação',
    },
    {
      href: '/custos-multas?aba=maintenances',
      label: 'Manutenções',
      sub: 'Serviços, preventivas e corretivas da frota',
      icon: Wrench,
      badge: null,
      group: 'Controle',
    },
    {
      href: '/custos-multas?aba=fines',
      label: 'Multas',
      sub: 'Infrações, notificações e acompanhamento',
      icon: FileWarning,
      badge: null,
      group: 'Controle',
    },
    {
      href: '/abastecimento',
      label: 'Abastecimento',
      sub: 'Lançamentos de combustível, KM e média de consumo',
      icon: Fuel,
      badge: null,
      group: 'Operação',
    },
    {
      href: '/viagens',
      label: 'Viagens',
      sub: 'KM inicial e final, itens transportados e despesas de cada viagem',
      icon: Route,
      badge: null,
      group: 'Operação',
    },
    {
      href: '/financeiro',
      label: 'Financeiro',
      sub: 'Pagamentos a vencer, vencidos e pagos por categoria',
      icon: DollarSign,
      badge: null,
      group: 'Controle',
    },
    {
      href: '/custos-multas?aba=fixed',
      label: 'Custos fixos',
      sub: 'Compromissos recorrentes por veículo',
      icon: CalendarClock,
      badge: null,
      group: 'Controle',
    },
    {
      href: '/usuarios',
      label: 'Usuários e acesso',
      sub: 'Gestão de contas, permissões e senhas',
      icon: Users,
      badge: null,
      group: 'Administração',
    },
    {
      href: '/malha-pneus',
      label: 'Configurações e malha',
      sub: 'Empresa, regras de alerta por modelo e cópia de segurança',
      icon: Database,
      badge: null,
      group: 'Administração',
    },
  ];

  const activeHref = pathname === '/custos-multas'
    ? `/custos-multas?aba=${searchParams.get('aba') || 'maintenances'}`
    : pathname;
  const activeNav = navItems.find((n) => n.href === activeHref) || navItems.find(n => n.href.split('?')[0] === pathname) || { label: pathname === '/minha-conta' ? 'Minha conta' : 'Visão geral', sub: pathname === '/minha-conta' ? 'Seus dados e preferências de acesso' : '', href: '/', group: 'Início' };
  const primaryActions: Record<string, { label: string; action: () => void }> = {
    '/veiculos': { label: 'Cadastrar veículo', action: () => setShowVehicleModal(true) },
    '/pneus': { label: 'Cadastrar pneu', action: () => setShowTireModal(true) },
    '/abastecimento': { label: 'Registrar abastecimento', action: () => setShowFuelModal(true) },
    '/custos-multas?aba=maintenances': { label: 'Lançar manutenção', action: () => setShowMaintenanceModal(true) },
    '/custos-multas?aba=fines': { label: 'Lançar multa', action: () => setShowFineModal(true) },
  };
  const primaryAction = primaryActions[activeHref];

  return (
    <div className="ef ef-shell" data-theme={theme} data-density={density}>
      {toast && <Toast key={toast.k} variant={toast.type} message={toast.message} onClose={() => dismissToast(toast.k)} />}
      {mobileNavOpen && <button type="button" className="ef-mobile-backdrop" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}

      <aside ref={mobileNavRef} id="frotawise-sidebar" role={mobileNavOpen ? 'dialog' : undefined} aria-modal={mobileNavOpen ? true : undefined} aria-label={mobileNavOpen ? 'Menu principal' : undefined} className={cx('ef-side', sidebarCollapsed && 'ef-side-collapsed', mobileNavOpen && 'ef-side-mobile-open')}>
        <div
          className={cx(
            'pt-5 pb-4 flex items-center',
            sidebarCollapsed ? 'px-2 flex-col gap-3 justify-center' : 'px-4 justify-between gap-2'
          )}
          style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}
        >
          <Link
            href="/"
            onClick={() => setMobileNavOpen(false)}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="ef-collapse-btn"
              title={sidebarCollapsed ? 'Expandir menu lateral' : 'Minimizar menu lateral'}
              aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Minimizar menu lateral'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <button type="button" className="ef-mobile-close" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="ef-nav" aria-label="Navegação principal">
          {(['Início', 'Operação', 'Controle', 'Administração'] as const).map((group) => <div className="ef-nav-section" key={group}>
            <span className="ef-nav-group-title">{group}</span>
            {navItems.filter(item => item.group === group).map((item) => {
            const Icon = item.icon;
            const isOn = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
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
          })}</div>)}
        </nav>

        <div className="ef-side-foot">
          <button
            onClick={handleExportBackup}
            title={sidebarCollapsed ? 'Baixar backup' : undefined}
            className="btn w-full"
            style={{
              background: 'rgba(255,255,255,.08)',
              color: '#fff',
              padding: sidebarCollapsed ? '10px 0' : undefined,
            }}
          >
            <Download size={16} color="#18B389" className="shrink-0" />
            {!sidebarCollapsed && <span>Baixar backup</span>}
          </button>
          {!sidebarCollapsed && (
            <div className="ef-t11_5 mt-3 text-center" style={{ color: '#7F93B3', letterSpacing: '.035em' }}>
              © {new Date().getFullYear()} FrotaWise
            </div>
          )}
        </div>
      </aside>

      <div className="ef-main">
        <header
          className="ef-topbar px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30"
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
          <div className="flex items-center gap-3 min-w-0">
            <button ref={openMenuButtonRef} type="button" className="ef-mobile-menu icon-btn" aria-label="Abrir menu" aria-expanded={mobileNavOpen} aria-controls="frotawise-sidebar" onClick={() => setMobileNavOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <h1 className="ef-t22 font-semibold leading-tight">{activeNav.label}</h1>
            </div>
          </div>
          <div className="ef-header-tools">
            <div className="ef-header-actions" aria-label="Ações rápidas">
              <button type="button" className="ef-header-search" onClick={() => setSearchOpen(true)} aria-label="Buscar na frota"><Search size={17} /><span>Buscar na frota</span><kbd>Ctrl K</kbd></button>
              {primaryAction ? <Btn v="primary" icon={Plus} onClick={primaryAction.action}>{primaryAction.label}</Btn> : pathname === '/' ? (
                <div className="ef-new-wrap">
                  <Btn v="primary" icon={Plus} aria-expanded={newOpen} onClick={() => setNewOpen(v => !v)}>Novo <ChevronDown size={14}/></Btn>
                  {newOpen && <div className="ef-new-menu ef-pop">
                    {[
                      { title: 'Veículo', onClick: () => setShowVehicleModal(true) },
                      { title: 'Pneu', onClick: () => setShowTireModal(true) },
                      { title: 'Manutenção', onClick: () => setShowMaintenanceModal(true) },
                      { title: 'Abastecimento', onClick: () => setShowFuelModal(true) },
                    ].map(action => <button key={action.title} type="button" onClick={() => { setNewOpen(false); action.onClick(); }}>{action.title}</button>)}
                  </div>}
                </div>
              ) : null}
            </div>
            <div className="ef-header-account">
              <Btn
                icon={theme === 'dark' ? Sun : Moon}
                title="Alternar tema claro/escuro"
                aria-label="Alternar tema claro/escuro"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              {usuario && (
                <div className="ef-profile" ref={profileRef}>
                  <button
                    ref={profileButtonRef}
                    type="button"
                    className="ef-profile-trigger"
                    title="Meu perfil"
                    aria-haspopup="dialog"
                    aria-expanded={profileOpen}
                    aria-controls="frotawise-profile-menu"
                    aria-label={`Abrir perfil de ${displayName}`}
                    onClick={() => setProfileOpen(open => !open)}
                  >
                    <span className="ef-profile-avatar" aria-hidden="true">{initials}</span>
                    <span className="ef-profile-identity"><b>{displayName.split(' ')[0]}</b><small>{roleLabel}</small></span>
                    <ChevronDown size={15} className={cx('ef-profile-chevron', profileOpen && 'is-open')} aria-hidden="true" />
                  </button>
                  {profileOpen && (
                    <div id="frotawise-profile-menu" className="ef-profile-menu ef-pop" role="dialog" aria-label="Meu perfil">
                      <div className="ef-profile-menu-head">
                        <span className="ef-profile-avatar ef-profile-avatar-large" aria-hidden="true">{initials}</span>
                        <div className="min-w-0">
                          <b className="ef-profile-full-name">{displayName}</b>
                          <span className="ef-profile-email">{usuario.email}</span>
                        </div>
                      </div>
                      <div className="ef-profile-menu-info"><span>Perfil de acesso</span><b>{roleLabel}</b></div>
                      <div className="ef-profile-menu-footer">
                        <Link href="/minha-conta" className="ef-profile-account-link" onClick={() => setProfileOpen(false)}><UserRound size={16}/> Minha conta</Link>
                        <Btn type="button" className="ef-profile-logout w-full" icon={LogOut} loading={loggingOut} loadingLabel="Saindo…" onClick={handleLogout}>Sair da conta</Btn>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ef-content p-6 flex-1">
          {liveMode && hasLoadedLiveData && isLoadingLiveData && <div role="status" className="ef-refresh-notice mb-4"><span className="ef-spin ef-refresh-ring" />Atualizando informações…</div>}
          {liveMode && liveError && <div role="alert" className="card p-5 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><strong>Não conseguimos atualizar as informações.</strong><p className="ef-t13 mt-1" style={{color:'var(--ink2)'}}>{liveError}</p></div>
            <Btn onClick={() => refreshLiveData().catch(() => {})} loading={isLoadingLiveData} loadingLabel="Tentando novamente…">Tentar novamente</Btn>
          </div>}
          <p className="ef-t13_5 mb-5" style={{ color: 'var(--ink2)' }}>
            {activeNav.sub}
          </p>
          <div key={pathname} className="ef-rise">
            {liveMode && !hasLoadedLiveData ? (!liveError ? <PageSkeleton /> : null) : children}
          </div>
        </main>
      </div>

      {(!liveMode || hasLoadedLiveData) && <GlobalModals />}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      {pendingConfirmation && <ConfirmDialog title={pendingConfirmation.title} description={pendingConfirmation.description} confirmLabel={pendingConfirmation.confirmLabel} onConfirm={pendingConfirmation.action} onCancel={() => setPendingConfirmation(null)} />}
    </div>
  );
}
