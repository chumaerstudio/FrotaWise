'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthenticatedUserDTO, UserCapabilities } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { clearSessionScopedCaches } from '@/lib/queryKeys';

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'revoked'
  | 'forbidden';

const DEFAULT_EMPTY_CAPABILITIES: UserCapabilities = Object.freeze({
  canManageVehicles: false,
  canManageTires: false,
  canManageMalha: false,
  canManagePreventiveRules: false,
  canManageFuelings: false,
  canManageMaintenances: false,
  canManageFines: false,
  canImportData: false,
  canExportData: false,
});

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthenticatedUserDTO | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const response = await httpClient.get<{ user: AuthenticatedUserDTO }>(
        '/auth/me'
      );
      setUser(response.data.user);
      setStatus('authenticated');
    } catch (err: unknown) {
      clearSessionScopedCaches();
      setUser(null);

      const axiosStatus = (
        err as { response?: { status?: number; data?: { code?: string } } }
      )?.response?.status;
      const errorCode = (err as { response?: { data?: { code?: string } } })
        ?.response?.data?.code;

      if (axiosStatus === 403) {
        setStatus('forbidden');
        setErrorMessage(
          'Acesso bloqueado por perfil ou política de rede corporativa.'
        );
      } else if (errorCode === 'SESSION_REVOKED') {
        setStatus('revoked');
        setErrorMessage(
          'Sua sessão foi encerrada porque um novo login foi realizado em outro navegador.'
        );
      } else {
        setStatus('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (email: string, password?: string) => {
    setErrorMessage(null);
    if (!password) {
      setErrorMessage('A senha é obrigatória.');
      return false;
    }

    try {
      clearSessionScopedCaches();
      const response = await httpClient.post<{ user: AuthenticatedUserDTO }>(
        '/auth/login',
        { email, password }
      );
      setUser(response.data.user);
      setStatus('authenticated');
      return true;
    } catch (err: unknown) {
      setUser(null);
      const axiosErr = err as {
        response?: { status?: number; data?: { detail?: string } };
      };
      const statusHttp = axiosErr.response?.status;
      if (statusHttp === 401) {
        setStatus('unauthenticated');
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (statusHttp === 403) {
        setStatus('forbidden');
        setErrorMessage(
          axiosErr.response?.data?.detail ??
            'Acesso não autorizado para este IP ou perfil.'
        );
      } else {
        setStatus('unauthenticated');
        setErrorMessage(
          axiosErr.response?.data?.detail ??
            'Não foi possível autenticar no momento.'
        );
      }
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpClient.post('/auth/logout');
    } finally {
      clearSessionScopedCaches();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  return {
    status,
    autenticado: status === 'authenticated' && user !== null,
    carregando: status === 'loading',
    usuario: user,
    capabilities: user?.capabilities ?? DEFAULT_EMPTY_CAPABILITIES,
    erro: errorMessage,
    login,
    logout,
    revalidarSessao: checkSession,
  };
}
