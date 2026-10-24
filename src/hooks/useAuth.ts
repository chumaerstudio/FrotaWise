'use client';

import { useState, useEffect, useCallback } from 'react';
import { UsuarioCorporativo } from '@/types/frotawise';

const MOCK_USUARIO_LOGADO: UsuarioCorporativo = {
  id: 'USR-CORP-001',
  nome: 'Henrique Vasconcelos',
  email: 'henrique.vasconcelos@translogbrasil.com.br',
  cargo: 'DIRETOR_OPERACOES',
  tenant: {
    id: 'TENANT-TRANSLOG-01',
    razaoSocial: 'TransLog Brasil S.A. Logística Integrada',
    nomeFantasia: 'TransLog Brasil S.A.',
    cnpj: '14.892.301/0001-88',
    unidadesAtivas: 18,
    frotaTotal: 420,
  },
};

export function useAuth() {
  const [usuario, setUsuario] = useState<UsuarioCorporativo | null>(MOCK_USUARIO_LOGADO);
  const [autenticado, setAutenticado] = useState<boolean>(true);
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tokenSalvo = localStorage.getItem('@FrotaWise:jwt_token');
      if (!tokenSalvo) {
        localStorage.setItem('@FrotaWise:jwt_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.frotawise.enterprise');
        localStorage.setItem('@FrotaWise:tenant_id', MOCK_USUARIO_LOGADO.tenant.id);
      }
    }
  }, []);

  const realizarLoginCorporativo = useCallback(async (email: string, _senha: string) => {
    setCarregando(true);
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const usuarioAtualizado: UsuarioCorporativo = {
          ...MOCK_USUARIO_LOGADO,
          email: email || MOCK_USUARIO_LOGADO.email,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('@FrotaWise:jwt_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.frotawise.enterprise');
          localStorage.setItem('@FrotaWise:tenant_id', usuarioAtualizado.tenant.id);
        }
        setUsuario(usuarioAtualizado);
        setAutenticado(true);
        setCarregando(false);
        resolve(true);
      }, 450);
    });
  }, []);

  const encerrarSessao = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@FrotaWise:jwt_token');
    }
    setAutenticado(false);
    setUsuario(null);
  }, []);

  return {
    usuario,
    autenticado,
    carregando,
    realizarLoginCorporativo,
    encerrarSessao,
  };
}
