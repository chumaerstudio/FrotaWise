'use client';

import React, { useEffect, useState } from 'react';
import { X, LucideIcon } from 'lucide-react';
import { formatNumber } from '@/services/api';
import { getTireRecapStyle } from '@/services/pneusService';
import { Pneu } from '@/types/frotawise';

export const cx = (...a: (string | boolean | undefined | null)[]) => a.filter(Boolean).join(' ');

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  v?: 'primary' | 'dark' | 'danger' | 'ghost' | 'soft';
  sm?: boolean;
  icon?: LucideIcon;
}

export const Btn: React.FC<BtnProps> = ({
  v = 'ghost',
  sm,
  icon: Icon,
  children,
  className,
  ...p
}) => (
  <button className={cx('btn', `btn-${v}`, sm && 'btn-sm', className)} {...p}>
    {Icon && <Icon size={sm ? 14 : 16} />}
    {children}
  </button>
);

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
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 ef-fade"
      style={{ background: 'rgba(6,16,32,.55)', backdropFilter: 'blur(3px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cx('card ef-pop w-full overflow-y-auto', wide ? 'max-w-lg' : 'max-w-md')}
        style={{ maxHeight: '92vh', boxShadow: '0 24px 60px rgba(6,16,32,.35)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <h3 className="ef-t17 font-semibold">{title}</h3>
          <button aria-label="Fechar" onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const Drawer: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 ef-fade"
      style={{ background: 'rgba(6,16,32,.45)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside role="dialog" aria-modal="true" className="ef-drawer">
        {children}
      </aside>
    </div>
  );
};

export const FormActions: React.FC<{
  onCancel: () => void;
  label?: string;
  v?: 'primary' | 'dark' | 'danger' | 'ghost' | 'soft';
}> = ({ onCancel, label = 'Salvar', v = 'dark' }) => (
  <div className="flex justify-end gap-2 pt-3">
    <Btn type="button" onClick={onCancel}>
      Cancelar
    </Btn>
    <Btn type="submit" v={v}>
      {label}
    </Btn>
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
}> = ({ t, selected, onSelect, onDragStartTire, onDragEndTire }) => {
  const st = getTireRecapStyle(t.recapagens);
  return (
    <div
      tabIndex={0}
      draggable
      className={cx('tire', selected && 'tire-sel')}
      style={{ backgroundColor: st.c }}
      onDragStart={() => onDragStartTire(t.id)}
      onDragEnd={onDragEndTire}
      onClick={() => onSelect(t.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(t.id)}
      title={`Fogo #${t.fogo} | ${t.marca} | ${st.label} | KM: ${formatNumber(t.kmTotal)}`}
    >
      <b className="mono ef-t12_5 leading-none">{t.fogo}</b>
      <span className="ef-t9_5 opacity-80 leading-none mt-1">{formatNumber(t.kmTotal)} km</span>
    </div>
  );
};
