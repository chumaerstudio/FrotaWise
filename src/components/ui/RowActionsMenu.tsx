'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';

export interface RowAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  danger?: boolean;
  disabled?: boolean;
}

interface Props {
  label: string;
  actions: RowAction[];
}

/**
 * Menu flutuante de registros. O portal impede que tabelas com overflow e
 * cartões animados recortem as ações. A posição acompanha rolagem e resize.
 */
export function RowActionsMenu({ label, actions }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const box = trigger.getBoundingClientRect();
      const width = 212;
      const height = actions.length * 41 + 12;
      const left = Math.max(12, Math.min(box.right - width, window.innerWidth - width - 12));
      const spaceBelow = window.innerHeight - box.bottom;
      const top = spaceBelow >= height + 12 || spaceBelow >= box.top
        ? Math.min(box.bottom + 6, window.innerHeight - height - 12)
        : Math.max(12, box.top - height - 6);
      setPosition({ left, top: Math.max(12, top) });
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', keyboard);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', keyboard);
    };
  }, [open, actions.length]);

  const menu = open && position && (
    <div ref={menuRef} className="ef-row-dropdown ef-pop" role="menu" aria-label={label}
      style={{ position: 'fixed', left: position.left, top: position.top, width: 212, zIndex: 82 }}>
      {actions.map(({ label: itemLabel, onClick, icon: Icon, danger, disabled }) => (
        <button key={itemLabel} type="button" role="menuitem" disabled={disabled}
          className={danger ? 'is-danger' : ''}
          onClick={() => { setOpen(false); onClick(); }}>
          {Icon && <Icon size={16} aria-hidden="true" />}{itemLabel}
        </button>
      ))}
    </div>
  );
  const portalRoot = typeof document !== 'undefined' ? document.querySelector('.ef-shell') : null;
  return <>
    <button ref={triggerRef} type="button" className="ef-row-actions-trigger" aria-label={label}
      title={label} aria-haspopup="menu" aria-expanded={open}
      onClick={() => { setPosition(null); setOpen(value => !value); }}>
      <MoreHorizontal size={19} aria-hidden="true" />
    </button>
    {portalRoot ? createPortal(menu, portalRoot) : menu}
  </>;
}
