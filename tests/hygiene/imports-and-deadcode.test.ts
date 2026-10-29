import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  APP_VERSION,
  SCHEMA_VERSION,
  formatCurrencyBRL,
  formatKm,
} from '@/config/constants';
import { LOGO_FROTAWISE } from '@/assets/brand';
import * as apiFacade from '@/services/api';

describe('Issue FE-01 — Higiene de Módulos, Imports e Snapshot 3.5.0', () => {
  it('preserva APP_VERSION 3.5.0 e SCHEMA_VERSION 1 nos módulos separados e na fachada api.ts', () => {
    expect(APP_VERSION).toBe('3.5.0');
    expect(SCHEMA_VERSION).toBe(1);
    expect(apiFacade.APP_VERSION).toBe('3.5.0');
    expect(apiFacade.SCHEMA_VERSION).toBe(1);
    expect(apiFacade.LOGO_FROTAWISE).toBe(LOGO_FROTAWISE);
  });

  it('não contém fallback hardcoded para https://api.frotawise.com.br/v1 no cliente HTTP', () => {
    const clientSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/lib/http/client.ts'),
      'utf-8'
    );
    const apiSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/services/api.ts'),
      'utf-8'
    );

    expect(clientSource).not.toContain('api.frotawise.com.br');
    expect(apiSource).not.toContain('api.frotawise.com.br');
  });

  it('formata valores monetários e quilometragem de forma determinística', () => {
    expect(formatCurrencyBRL(1250.5)).toContain('1.250,50');
    expect(formatKm(145000)).toBe('145.000 km');
  });
});
