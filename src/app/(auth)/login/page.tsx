'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LOGO_FROTAWISE } from '@/services/api';
import { Btn, Field } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('gestao@ecofrota.com.br');
  const [senha, setSenha] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    router.push('/');
  };

  return (
    <div className="ef min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg,#0B2342 0%,#08192F 100%)' }}>
      <div className="card w-full max-w-md p-8 space-y-6 ef-pop">
        <div className="p-4 rounded-xl flex justify-center" style={{ background: '#0B2342' }}>
          <img src={LOGO_FROTAWISE} alt="FrotaWise" className="h-12 w-auto" />
        </div>
        <div className="text-center">
          <h1 className="ef-t22 font-semibold">Acesso Corporativo FrotaWise</h1>
          <p className="ef-t13 mt-1" style={{ color: 'var(--mute)' }}>
            Gestão de Frotas, Chassi Interativo e Ciclo de Recapagem
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="E-mail Corporativo">
            <input
              type="email"
              required
              className="inp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              required
              className="inp"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </Field>
          <Btn type="submit" v="primary" className="w-full ef-py3">
            Entrar no Painel FrotaWise
          </Btn>
        </form>
      </div>
    </div>
  );
}
