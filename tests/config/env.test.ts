import { describe, it, expect } from 'vitest';
import {
  getClientEnv,
  getServerEnv,
  resolveAppMode,
  assertNoPublicSecrets,
} from '@/config/env';

describe('Issue FE-01 — Validação de Variáveis de Ambiente e Segurança', () => {
  it('falha explicitamente em modo API quando BACKEND_API_URL está ausente', () => {
    expect(() =>
      getServerEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_MODE: 'API',
        NEXT_PUBLIC_BFF_BASE_PATH: '/api',
      })
    ).toThrow(/BACKEND_API_URL está ausente no modo API/i);
  });

  it('bloqueia seleção do modo DEMO em ambiente de produção por padrão', () => {
    expect(() =>
      resolveAppMode({
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_MODE: 'DEMO',
      })
    ).toThrow(/Modo DEMO não é permitido em build de produção/i);
  });

  it('rejeita qualquer segredo, chave ou token iniciado com NEXT_PUBLIC_', () => {
    expect(() =>
      assertNoPublicSecrets({
        NODE_ENV: 'development',
        NEXT_PUBLIC_JWT_SECRET: 'segredo-indevido',
      })
    ).toThrow(/Variável pública proibida detectada/i);
  });

  it('rejeita NEXT_PUBLIC_BFF_BASE_PATH que aponte para URL externa absoluta', () => {
    expect(() =>
      getClientEnv({
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_MODE: 'API',
        NEXT_PUBLIC_BFF_BASE_PATH: 'https://api.frotawise.com.br/v1',
      })
    ).toThrow(/caminho relativo same-origin/i);
  });
});
