'use client';

import React from 'react';
import { SeveridadeAlerta, StatusPneu } from '@/types/frotawise';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const estilosVariante: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700',
  };

  const estilosTamanho: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-md',
    md: 'px-4 py-2 text-sm font-medium rounded-lg',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-lg',
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${estilosVariante[variant]} ${estilosTamanho[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface AlertBadgeProps {
  severidade?: SeveridadeAlerta;
  statusPneu?: StatusPneu;
  textoCustomizado?: string;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  severidade,
  statusPneu,
  textoCustomizado,
}) => {
  if (severidade) {
    const mapaCores: Record<SeveridadeAlerta, string> = {
      CRITICA: 'bg-red-100 text-red-800 border-red-300',
      ALTA: 'bg-amber-100 text-amber-800 border-amber-300',
      MEDIA: 'bg-blue-100 text-blue-800 border-blue-300',
      BAIXA: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${mapaCores[severidade]}`}>
        {textoCustomizado || severidade}
      </span>
    );
  }

  if (statusPneu) {
    const mapaStatus: Record<StatusPneu, string> = {
      EM_USO: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      ESTOQUE: 'bg-blue-100 text-blue-800 border-blue-300',
      EM_REMOLD: 'bg-amber-100 text-amber-800 border-amber-300',
      MANUTENCAO: 'bg-purple-100 text-purple-800 border-purple-300',
      SUCATA: 'bg-slate-200 text-slate-700 border-slate-400',
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${mapaStatus[statusPneu]}`}>
        {textoCustomizado || statusPneu.replace('_', ' ')}
      </span>
    );
  }

  return (
    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
      {textoCustomizado}
    </span>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, helperText, className = '', ...props }) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</label>
    <input
      className={`px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${className}`}
      {...props}
    />
    {helperText && <span className="text-xs text-slate-500">{helperText}</span>}
  </div>
);

interface ModalProps {
  aberto: boolean;
  titulo: string;
  subtitulo?: string;
  aoFechar: () => void;
  children: React.ReactNode;
}

export const ModalCorporativo: React.FC<ModalProps> = ({
  aberto,
  titulo,
  subtitulo,
  aoFechar,
  children,
}) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">{titulo}</h3>
            {subtitulo && <p className="text-xs text-slate-300 mt-0.5">{subtitulo}</p>}
          </div>
          <button
            onClick={aoFechar}
            className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
