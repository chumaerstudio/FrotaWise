'use client';

import { useState, useCallback } from 'react';

export function useAuth() {
  const [autenticado, setAutenticado] = useState<boolean>(true);

  const login = useCallback((email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecofrota_jwt_token', 'jwt-frotawise-active');
      localStorage.setItem('ecofrota_user_email', email);
    }
    setAutenticado(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ecofrota_jwt_token');
    }
    setAutenticado(false);
  }, []);

  return { autenticado, login, logout };
}
