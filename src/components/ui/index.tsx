'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, LoaderCircle, LucideIcon } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatNumber } from '@/services/api';
import { getTireRecapStyle } from '@/services/pneusService';
import { Pneu } from '@/types/frotawise';

export const cx = (...a: (string | boolean | undefined | null)[]) => a.filter(Boolean).join(' ');

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  v?: 'primary' | 'dark' | 'danger' | 'ghost' | 'soft';
  sm?: boolean;
  icon?: LucideIcon;
  loading?: boolean;
  loadingLabel?: string;
}

export const Btn: React.FC<BtnProps> = ({
  v = 'ghost',
  sm,
  icon: Icon,
  loading = false,
  loadingLabel,
  children,
  className,
  onClick,
  disabled,
  ...p
}) => {
  const [autoLoading, setAutoLoading] = useState(false);
  const pending = useRef(false);
  const isLoading = loading || autoLoading;
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (pending.current || loading) return;
    const result = onClick?.(event) as unknown;
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      pending.current = true;
      setAutoLoading(true);
      Promise.resolve(result).then(
        () => { pending.current = false; setAutoLoading(false); },
        () => { pending.current = false; setAutoLoading(false); }
      );
    }
  };
  return (
    <button className={cx('btn', `btn-${v}`, sm && 'btn-sm', className)} {...p}
      onClick={handleClick} disabled={disabled || isLoading} aria-busy={isLoading}>
      {isLoading ? <LoaderCircle className="ef-spin shrink-0" size={sm ? 14 : 16} aria-hidden="true" /> : Icon && <Icon size={sm ? 14 : 16} />}
      {isLoading ? (loadingLabel || (p.type === 'submit' ? 'Salvando…' : 'Processando…')) : children}
    </button>
  );
};

export const Chip: React.FC<{
  tone?: 'teal' | 'amber' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
}> = ({ tone = 'gray', children }) => <span className={cx('chip', `c-${tone}`)}>{children}</span>;

export const Plate: React.FC<{ v: { placa: string; uf?: string } }> = ({ v }) => (
  <span className="plate">
    {v.placa}
    <i>{v.uf || 'BR'}</i>
  </span>
);

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="block">
    <span className="lbl">{label}</span>
    {children}
  </label>
);

export const Empty: React.FC<{ icon: LucideIcon; title: string; text: string }> = ({
  icon: Icon,
  title,
  text,
}) => (
  <div className="py-14 px-6 text-center">
    <div
      className="mx-auto mb-3 w-11 h-11 rounded-full flex items-center justify-center"
      style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
    >
      <Icon size={20} />
    </div>
    <div className="font-semibold">{title}</div>
    <div className="ef-t13 mt-1" style={{ color: 'var(--mute)' }}>
      {text}
    </div>
  </div>
);

export const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ title, onClose, children, wide }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>('[autofocus], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)');
      first?.focus();
    });
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); }
      if (e.key !== 'Tab') return;
      const focusables = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])') || []);
      if (!focusables.length) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = priorOverflow; window.removeEventListener('keydown', h); previousFocus?.focus(); };
  }, []);

  const overlay = (
    <div
      className="ef-modal-overlay fixed inset-0 flex items-center justify-center p-3 sm:p-5 ef-fade"
      style={{ background: 'rgba(6,16,32,.47)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx('card ef-pop ef-modal-dialog w-full overflow-y-auto overscroll-contain', wide ? 'max-w-2xl' : 'max-w-xl')}
        style={{ maxHeight: 'calc(100dvh - 32px)', boxShadow: '0 24px 60px rgba(6,16,32,.28)' }}
      >
        <div
          className="ef-modal-heading sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <h3 id={titleId} className="ef-t17 font-semibold">{title}</h3>
          <button aria-label="Fechar" onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
  // As páginas usam animações com transform: um modal fixed dentro delas fica
  // recortado pelo contêiner animado. O portal o coloca na raiz do dashboard,
  // preservando as variáveis do tema e cobrindo a viewport inteira.
  const root = typeof document !== 'undefined' ? document.querySelector('.ef-shell') : null;
  return root ? createPortal(overlay, root) : overlay;
};

export const Drawer: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => {
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')?.focus();
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const focusable = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"])') || []);
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, []);

  const overlay = (
    <div
      className="ef-drawer-overlay fixed inset-0 ef-fade"
      style={{ background: 'rgba(6,16,32,.45)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside ref={drawerRef} role="dialog" aria-label="Detalhes" aria-modal="true" className="ef-drawer">
        {children}
      </aside>
    </div>
  );
  const root = typeof document !== 'undefined' ? document.querySelector('.ef-shell') : null;
  return root ? createPortal(overlay, root) : overlay;
};

export const FormActions: React.FC<{
  onCancel: () => void;
  label?: string;
  v?: 'primary' | 'dark' | 'danger' | 'ghost' | 'soft';
  loading?: boolean;
}> = ({ onCancel, label = 'Salvar', v = 'dark', loading }) => {
  const { pendingMutationCount } = useEstoquePneus();
  const pending = loading ?? pendingMutationCount > 0;
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-3 ef-form-actions">
      <Btn type="button" onClick={onCancel} disabled={pending}>Cancelar</Btn>
      <Btn type="submit" v={v} loading={pending} loadingLabel={label.startsWith('Confirm') ? 'Confirmando…' : 'Salvando…'}>{label}</Btn>
    </div>
  );
};

export const PageSkeleton: React.FC<{ label?: string }> = ({ label = 'Carregando informações…' }) => (
  <div role="status" aria-label={label} className="space-y-5" aria-busy="true">
    <span className="sr-only">{label}</span>
    <div className="ef-g-kpi">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="card p-5 space-y-4">
          <div className="ef-skeleton h-4 w-2/3" /><div className="ef-skeleton h-8 w-1/2" /><div className="ef-skeleton h-3 w-3/4" />
        </div>
      ))}
    </div>
    <div className="card p-5 space-y-4">
      <div className="ef-skeleton h-5 w-44" />
      {Array.from({ length: 5 }, (_, i) => <div key={i} className="ef-skeleton h-9 w-full" />)}
    </div>
  </div>
);

export function useCount(to: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setV(to);
      return;
    }
    let raf: number;
    let start: number | undefined;
    const f = (t: number) => {
      start = start ?? t;
      const p = Math.min(1, (t - start) / ms);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

export const Kpi: React.FC<{
  label: string;
  value: number;
  fmt?: (n: number) => string;
  suffix?: string;
  sub: string;
  icon: LucideIcon;
  tone: { bg: string; fg: string };
  delay?: number;
  action?: React.ReactNode;
}> = ({
  label,
  value,
  fmt = (n) => formatNumber(Math.round(n)),
  suffix,
  sub,
  icon: Icon,
  tone,
  delay = 0,
  action,
}) => {
  const n = useCount(value);
  return (
    <div className="card p-5 ef-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="ef-t13 font-medium" style={{ color: 'var(--ink2)' }}>
          {label}
        </span>
        <div
          className="w-9 h-9 flex items-center justify-center"
          style={{ borderRadius: 10, background: tone.bg, color: tone.fg }}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="disp mt-3 ef-t28 font-semibold leading-none">
        {fmt(n)}
        {suffix && (
          <span className="ef-t15 font-medium ef-ml1_5" style={{ color: 'var(--mute)' }}>
            {suffix}
          </span>
        )}
      </div>
      <div
        className="ef-mt2_5 flex items-center justify-between ef-t12_5"
        style={{ color: 'var(--mute)' }}
      >
        <span>{sub}</span>
        {action}
      </div>
    </div>
  );
};

export const SectionHead: React.FC<{
  title: string;
  sub?: string;
  children?: React.ReactNode;
}> = ({ title, sub, children }) => (
  <div
    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
    style={{ borderBottom: '1px solid var(--line)' }}
  >
    <div>
      <h3 className="ef-t16 font-semibold">{title}</h3>
      {sub && (
        <p className="ef-t12_5 ef-mt0_5" style={{ color: 'var(--mute)' }}>
          {sub}
        </p>
      )}
    </div>
    {children}
  </div>
);

export const TireChip: React.FC<{
  t: Pneu;
  selected: boolean;
  onSelect: (id: string) => void;
  onDragStartTire: (id: string) => void;
  onDragEndTire: () => void;
  onDropTire?: (draggedId: string, targetId: string) => void;
  draggedTireId?: string | null;
  /** 'chassis' = pneu desenhado sobre a imagem do chassi (cor do status + banda). */
  variant?: 'chip' | 'chassis';
}> = ({ t, selected, onSelect, onDragStartTire, onDragEndTire, onDropTire, draggedTireId, variant = 'chip' }) => {
  const st = getTireRecapStyle(t.recapagens);
  const chassis = variant === 'chassis';
  return (
    <div
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      draggable
      className={cx('tire', chassis && 'ctire', selected && 'tire-sel')}
      style={{ backgroundColor: st.c }}
      onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', t.id); onDragStartTire(t.id); }}
      onDragEnd={onDragEndTire}
      onDragOver={onDropTire ? (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } : undefined}
      onDrop={onDropTire ? (event) => { event.preventDefault(); event.stopPropagation(); const sourceId = event.dataTransfer.getData('text/plain') || draggedTireId; if (sourceId && sourceId !== t.id) onDropTire(sourceId, t.id); } : undefined}
      onClick={() => onSelect(t.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id); } }}
      title={`Fogo #${t.fogo} | ${t.marca} | ${st.label} | KM: ${formatNumber(t.kmTotal)}`}
    >
      {chassis ? (
        <span className="tlbl mono">
          <b>{t.fogo}</b>
          <span>{formatNumber(t.kmTotal)} km</span>
        </span>
      ) : (
        <>
          <b className="mono ef-t12_5 leading-none">{t.fogo}</b>
          <span className="ef-t9_5 opacity-80 leading-none mt-1">{formatNumber(t.kmTotal)} km</span>
        </>
      )}
    </div>
  );
};


// Componentes de compatibilidade para formulários legados ainda presentes no projeto.
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'outline' | 'primary' | 'danger';
}> = ({ variant = 'outline', className, children, ...props }) => (
  <Btn
    {...props}
    v={variant === 'primary' ? 'primary' : variant === 'danger' ? 'danger' : 'ghost'}
    className={cx(variant === 'outline' && 'border border-slate-300', className)}
  >
    {children}
  </Btn>
);

export const InputField: React.FC<{
  label: string;
  type?: string;
  required?: boolean;
  step?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({ label, type = 'text', required, step, value, onChange }) => (
  <Field label={label}>
    <input
      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
      type={type}
      required={required}
      step={step}
      value={value}
      onChange={onChange}
    />
  </Field>
);

export const ModalCorporativo: React.FC<{
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}> = ({ aberto, aoFechar, titulo, subtitulo, children }) => {
  if (!aberto) return null;
  return (
    <Modal title={titulo} onClose={aoFechar} wide>
      {subtitulo && <p className="mb-4 text-sm text-slate-500">{subtitulo}</p>}
      {children}
    </Modal>
  );
};

/**
 * Filtro por placa: digite ou escolha uma placa da lista. A busca ignora hífen,
 * espaços e maiúsculas/minúsculas e aceita trechos (ex.: "opg" ou "2469").
 */
export const PlateFilter: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  plates: string[];
}> = ({ id, value, onChange, plates }) => (
  <div className="relative" style={{ minWidth: 220 }}>
    <Search
      size={15}
      className="absolute"
      style={{ left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)', pointerEvents: 'none' }}
    />
    <input
      type="search"
      list={`${id}-list`}
      aria-label="Filtrar por placa"
      placeholder="Filtrar por placa"
      className="inp mono"
      style={{ paddingLeft: 34 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <datalist id={`${id}-list`}>
      {plates.map((p) => (
        <option key={p} value={p} />
      ))}
    </datalist>
  </div>
);
