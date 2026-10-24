'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, InputField } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { realizarLoginCorporativo, carregando } = useAuth();
  const [email, setEmail] = useState('henrique.vasconcelos@translogbrasil.com.br');
  const [senha, setSenha] = useState('••••••••••••');
  const [codigoTenant, setCodigoTenant] = useState('TRANSLOG-BR-MATRIZ');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await realizarLoginCorporativo(email, senha);
    if (ok) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      {/* Painel Institucional Esquerdo */}
      <div className="lg:w-7/12 p-12 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border-r border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xl">
              FW
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">FrotaWise</span>
              <span className="block text-[10px] uppercase tracking-widest text-blue-400 font-semibold">
                Enterprise Tire & Fleet Intelligence
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-xl space-y-6 my-12">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Arquitetura Multi-Filial para Grandes Transportadoras
          </span>
          <h1 className="text-4xl font-extrabold leading-tight">
            Reduza o Custo por Quilômetro (CPK) e maximize o ciclo de recapagem da sua frota.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Rastreabilidade completa por número de fogo, alertas preditivos de limite de KM para
            Remold, diagrama interativo de eixos e auditoria de multas rodoviárias.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            <strong className="block text-white text-lg font-bold">99.98%</strong>
            SLA de Disponibilidade
          </div>
          <div>
            <strong className="block text-white text-lg font-bold">-28%</strong>
            Perda de Carcaças no 1º Giro
          </div>
          <div>
            <strong className="block text-white text-lg font-bold">ISO 27001</strong>
            Segurança Corporativa SSO
          </div>
        </div>
      </div>

      {/* Formulário de Autenticação */}
      <div className="lg:w-5/12 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Acesso Corporativo</h2>
            <p className="text-sm text-slate-500 mt-1">
              Utilize suas credenciais corporativas ou Single Sign-On (Azure AD / Okta).
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <InputField
              label="Código da Transportadora (Tenant ID)"
              value={codigoTenant}
              onChange={(e) => setCodigoTenant(e.target.value)}
              required
            />

            <InputField
              label="E-mail Corporativo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              label="Senha de Acesso"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={carregando}>
              {carregando ? 'Autenticando Token JWT...' : 'Entrar no Painel de Controle'}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Ambiente protegido por criptografia ponta-a-ponta • FrotaWise v2.4 Enterprise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
