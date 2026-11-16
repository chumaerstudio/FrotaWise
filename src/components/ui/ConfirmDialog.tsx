'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Btn, Modal } from '@/components/ui';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  onCancel: () => void;
  onConfirm: () => void | Promise<unknown>;
};

/** Confirmações destrutivas usam uma linguagem única e nunca fecham enquanto salvam. */
export function ConfirmDialog({ title, description, confirmLabel = 'Excluir', variant = 'danger', onCancel, onConfirm }: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onConfirm();
      onCancel();
    } finally {
      setPending(false);
    }
  };
  return (
    <Modal title={title} onClose={() => { if (!pending) onCancel(); }}>
      <div className="space-y-5">
        <div className="ef-confirm-intro">
          <span className={`ef-confirm-icon ${variant === 'primary' ? 'is-positive' : ''}`}>{variant === 'primary' ? <CheckCircle2 size={20}/> : <AlertTriangle size={20} />}</span>
          <p>{description}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Btn type="button" disabled={pending} onClick={onCancel}>Cancelar</Btn>
          <Btn type="button" v={variant} loading={pending} loadingLabel="Processando…" onClick={handleConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </Modal>
  );
}
