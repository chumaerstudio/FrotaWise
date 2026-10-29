/**
 * ============================================================================
 * GERADOR OFICIAL DE RELEASE (.ZIP) — FROTAWISE FRONTEND v3.5.0 (FE-01 a FE-12)
 * ============================================================================
 * Este script grava todos os 44 arquivos das Issues FE-01 a FE-12 sobre a base
 * extraída do Snapshot 3.5.0, preservando o layout JSX/CSS existente, e gera
 * automaticamente o pacote "frotawise-frontend-3.5.0-completo.zip".
 *
 * Como executar:
 *   node gerar-zip-frotawise.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Detecta automaticamente se está rodando na raiz do projeto ou um nível acima de "Nova pasta"
const CWD = process.cwd();
const SUBFOLDER = path.join(CWD, 'Nova pasta');
const PROJECT_ROOT =
  !fs.existsSync(path.join(CWD, 'package.json')) &&
  fs.existsSync(path.join(SUBFOLDER, 'package.json'))
    ? SUBFOLDER
    : CWD;

function writeProjectFile(relPath, content) {
  const fullPath = path.join(PROJECT_ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trimStart(), 'utf-8');
  console.log('[GRAVADO] ' + relPath);
}

const FILES = {
  // ==========================================================================
  // ISSUE FE-01 — HIGIENE DO REPOSITÓRIO, AMBIENTE E QUALIDADE
  // ==========================================================================
  'package.json': JSON.stringify(
    {
      name: 'frotawise-frontend',
      version: '3.5.0',
      private: true,
      engines: {
        node: '>=20.11.0 <25.0.0',
        npm: '>=10.0.0',
      },
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint --no-cache',
        'type-check': 'tsc --noEmit',
        test: 'vitest run',
        'test:watch': 'vitest',
        'test:e2e': 'playwright test',
        'audit:ci': 'npm audit --omit=dev --audit-level=high',
        'ci:check':
          'npm run lint && npm run type-check && npm run test && npm run build',
      },
      dependencies: {
        axios: '^1.7.7',
        clsx: '^2.1.1',
        'lucide-react': '^0.454.0',
        next: '14.2.35',
        react: '18.3.1',
        'react-dom': '18.3.1',
        recharts: '^2.13.3',
        'tailwind-merge': '^2.5.4',
      },
      devDependencies: {
        '@playwright/test': '^1.48.2',
        '@types/node': '^20.17.0',
        '@types/react': '^18.3.12',
        '@types/react-dom': '^18.3.1',
        autoprefixer: '^10.4.20',
        eslint: '^8.57.1',
        'eslint-config-next': '14.2.35',
        postcss: '^8.4.47',
        tailwindcss: '^3.4.14',
        typescript: '^5.6.3',
        vitest: '^2.1.4',
      },
    },
    null,
    2
  ),

  'tsconfig.json': JSON.stringify(
    {
      compilerOptions: {
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: false,
        skipLibCheck: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitOverride: true,
        noFallthroughCasesInSwitch: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules', '.next', 'dist', 'coverage', 'gerar-zip-frotawise.mjs'],
    },
    null,
    2
  ),

  'next.config.mjs': `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
`,

  '.eslintrc.json': JSON.stringify(
    {
      extends: ['next/core-web-vitals', 'next/typescript'],
      rules: {
        'react/no-danger': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    null,
    2
  ),

  '.gitignore': `
/node_modules
/.pnp
.pnp.js
/.next/
/out/
/build
/dist
*.tsbuildinfo
next-env.d.ts
/coverage
/playwright-report/
/test-results/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
Thumbs.db
*.zip
`,

  '.env.example': `
# ============================================================================
# FROTAWISE FRONTEND (SNAPSHOT 3.5.0) — VARIÁVEIS DE AMBIENTE
# Copie para .env.local em desenvolvimento. NUNCA commite .env.local no Git.
# ============================================================================
NEXT_PUBLIC_APP_MODE=API
NEXT_PUBLIC_BFF_BASE_PATH=/api
BACKEND_API_URL=http://127.0.0.1:8000/v1
BACKEND_TIMEOUT_MS=15000
`,

  'vitest.config.ts': `
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`,

  'playwright.config.ts': `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`,

  '.github/workflows/ci.yml': `
name: FrotaWise Frontend CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality-gate:
    name: Lint, Type-Check, Tests, Audit & Build
    runs-on: ubuntu-latest
    env:
      NODE_ENV: test
      NEXT_PUBLIC_APP_MODE: API
      NEXT_PUBLIC_BFF_BASE_PATH: /api
      BACKEND_API_URL: https://staging-internal.frotawise.local/v1
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 24 LTS
        uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          cache: 'npm'

      - name: Install dependencies cleanly (npm ci)
        run: npm ci

      - name: Security Audit (Dependencies)
        run: npm run audit:ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript Type-Check
        run: npm run type-check

      - name: Run Unit & Domain Tests
        run: npm run test

      - name: Run Production Build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_APP_MODE: API
          NEXT_PUBLIC_BFF_BASE_PATH: /api
          BACKEND_API_URL: https://staging-internal.frotawise.local/v1
        run: npm run build
`,

  'src/config/env.ts': `
export type AppMode = 'DEMO' | 'TEST' | 'API';

export interface ClientEnvConfig {
  readonly appMode: AppMode;
  readonly bffBasePath: string;
  readonly nodeEnv: 'development' | 'production' | 'test';
}

export interface ServerEnvConfig extends ClientEnvConfig {
  readonly backendApiUrl: string | null;
  readonly backendTimeoutMs: number;
}

const VALID_APP_MODES: ReadonlySet<string> = new Set(['DEMO', 'TEST', 'API']);

const FORBIDDEN_PUBLIC_SECRET_PATTERNS = [
  /^NEXT_PUBLIC_.*(SECRET|PRIVATE|PASSWORD|TOKEN|KEY|DATABASE|JWT)/i,
];

export function assertNoPublicSecrets(
  envRecord: Record<string, string | undefined> = process.env
): void {
  for (const [key, value] of Object.entries(envRecord)) {
    if (!value) continue;
    for (const pattern of FORBIDDEN_PUBLIC_SECRET_PATTERNS) {
      if (pattern.test(key)) {
        throw new Error(
          '[FrotaWise Security] Variável pública proibida detectada: "' +
            key +
            '". Nenhuma credencial, chave ou token pode iniciar com NEXT_PUBLIC_.'
        );
      }
    }
  }
}

export function resolveAppMode(
  envRecord: Record<string, string | undefined> = process.env
): AppMode {
  const nodeEnv = (envRecord.NODE_ENV ?? 'development') as
    | 'development'
    | 'production'
    | 'test';
  const rawMode = envRecord.NEXT_PUBLIC_APP_MODE?.trim().toUpperCase();

  if (!rawMode) {
    if (nodeEnv === 'test') return 'TEST';
    return 'API';
  }

  if (!VALID_APP_MODES.has(rawMode)) {
    throw new Error(
      '[FrotaWise Config] NEXT_PUBLIC_APP_MODE inválido: "' +
        rawMode +
        '". Valores aceitos: DEMO, TEST ou API.'
    );
  }

  if (
    nodeEnv === 'production' &&
    rawMode === 'DEMO' &&
    envRecord.ALLOW_EXPLICIT_DEMO_IN_PROD !== 'true'
  ) {
    throw new Error(
      '[FrotaWise Security] Modo DEMO não é permitido em build de produção sem habilitação explícita.'
    );
  }

  return rawMode as AppMode;
}

export function getClientEnv(
  envRecord: Record<string, string | undefined> = process.env
): ClientEnvConfig {
  assertNoPublicSecrets(envRecord);

  const nodeEnv = (envRecord.NODE_ENV ?? 'development') as
    | 'development'
    | 'production'
    | 'test';
  const appMode = resolveAppMode(envRecord);
  const bffBasePath = (envRecord.NEXT_PUBLIC_BFF_BASE_PATH ?? '/api').trim();

  if (!bffBasePath.startsWith('/')) {
    throw new Error(
      '[FrotaWise Security] NEXT_PUBLIC_BFF_BASE_PATH deve ser um caminho relativo same-origin (ex.: "/api"). Recebido: "' +
        bffBasePath +
        '".'
    );
  }

  return Object.freeze({
    appMode,
    bffBasePath,
    nodeEnv,
  });
}

export function getServerEnv(
  envRecord: Record<string, string | undefined> = process.env
): ServerEnvConfig {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[FrotaWise Security] getServerEnv() não pode ser executado no navegador.'
    );
  }

  const clientEnv = getClientEnv(envRecord);
  const rawBackendUrl = envRecord.BACKEND_API_URL?.trim() ?? '';

  if (clientEnv.appMode === 'API') {
    if (!rawBackendUrl) {
      throw new Error(
        '[FrotaWise Config] Variável obrigatória BACKEND_API_URL está ausente no modo API. O fallback para URL remota padrão está desativado por segurança.'
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawBackendUrl);
    } catch {
      throw new Error(
        '[FrotaWise Config] BACKEND_API_URL não é uma URL válida: "' +
          rawBackendUrl +
          '".'
      );
    }

    if (
      clientEnv.nodeEnv === 'production' &&
      parsedUrl.protocol !== 'https:' &&
      parsedUrl.hostname !== 'localhost' &&
      parsedUrl.hostname !== '127.0.0.1'
    ) {
      throw new Error(
        '[FrotaWise Security] BACKEND_API_URL em produção externa exige protocolo HTTPS.'
      );
    }
  }

  const rawTimeout = Number(envRecord.BACKEND_TIMEOUT_MS ?? 15000);
  const backendTimeoutMs =
    Number.isFinite(rawTimeout) && rawTimeout >= 1000 ? rawTimeout : 15000;

  return Object.freeze({
    ...clientEnv,
    backendApiUrl: rawBackendUrl || null,
    backendTimeoutMs,
  });
}
`,

  'src/config/constants.ts': `
export const APP_VERSION = '3.5.0' as const;
export const SCHEMA_VERSION = 1 as const;
export const SYSTEM_EXPORT_NAME = 'FrotaWise Enterprise Offline' as const;

export const STORAGE_KEYS = Object.freeze({
  COMPANY: 'ecofrota_v3_company',
  VEHICLES: 'ecofrota_v3_vehicles',
  TIRES: 'ecofrota_v3_tires',
  MAINTENANCES: 'ecofrota_v3_maintenances',
  FINES: 'ecofrota_v3_fines',
  FUELINGS: 'ecofrota_v3_fuelings',
  THEME: 'frotawise_ui_theme',
});

export function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatKm(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '0 km';
  }
  return (
    new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(value) + ' km'
  );
}

export function formatNumberPtBr(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
`,

  'src/assets/brand.ts': `
export const LOGO_FROTAWISE = '/icon.png';
`,

  'src/lib/http/client.ts': `
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { getClientEnv } from '@/config/env';

export interface SafeHttpErrorLog {
  readonly status: number | null;
  readonly method: string | undefined;
  readonly url: string | undefined;
  readonly code: string | undefined;
}

export function toSafeHttpErrorLog(error: AxiosError): SafeHttpErrorLog {
  return {
    status: error.response?.status ?? null,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    code: error.code,
  };
}

export function createHttpClient(): AxiosInstance {
  const { bffBasePath } = getClientEnv();

  const instance = axios.create({
    baseURL: bffBasePath,
    timeout: 15000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, application/problem+json',
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  return instance;
}

export const httpClient = createHttpClient();
`,

  'src/services/api.ts': `
import { httpClient } from '@/lib/http/client';

export {
  APP_VERSION,
  SCHEMA_VERSION,
  SYSTEM_EXPORT_NAME,
  STORAGE_KEYS,
  formatCurrencyBRL,
  formatKm,
  formatNumberPtBr,
} from '@/config/constants';

export { LOGO_FROTAWISE } from '@/assets/brand';
export {
  httpClient as api,
  createHttpClient,
  toSafeHttpErrorLog,
} from '@/lib/http/client';

export default httpClient;
`,

  'src/hooks/useEstoquePneus.ts': `
import { useMemo } from 'react';
import type { Pneu, ClassificacaoPneu } from '@/types/frotawise';
import { useFrotaWiseStore } from '@/hooks/useFrotaWiseStore';

/**
 * @deprecated Hook legado do Snapshot 3.5.0 mantido com adaptador tipado
 * para evitar quebra de importações. Use diretamente os seletores de pneus.
 */
export function useEstoquePneus() {
  const { tires, vehicles } = useFrotaWiseStore();

  const pneusNormalizados = useMemo(() => {
    const placaPorVeiculoId = new Map<string, string>(
      vehicles.map((v) => [v.id, v.placa])
    );

    return tires.map((pneu: Pneu) => ({
      ...pneu,
      numeroFogo: pneu.fogo,
      status: pneu.classificacao as ClassificacaoPneu,
      veiculoPlaca: pneu.veiculoAtualId
        ? placaPorVeiculoId.get(pneu.veiculoAtualId) ?? null
        : null,
    }));
  }, [tires, vehicles]);

  const pneusEmEstoque = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Estocar'),
    [pneusNormalizados]
  );

  const pneusRodando = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Rodando'),
    [pneusNormalizados]
  );

  const pneusEmReforma = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Recapar'),
    [pneusNormalizados]
  );

  const pneusSucata = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Sucatear'),
    [pneusNormalizados]
  );

  return {
    pneus: pneusNormalizados,
    pneusEmEstoque,
    pneusRodando,
    pneusEmReforma,
    pneusSucata,
  };
}
`,

  // ==========================================================================
  // ISSUE FE-02 — INVENTÁRIO DE TELAS, CONTRATOS E MIGRAÇÃO DE TIPOS
  // ==========================================================================
  'src/types/frotawise.d.ts': `
export type StatusVeiculo = 'Ativo' | 'Manutencao' | 'Inativo';

export type ClassificacaoPneu = 'Rodando' | 'Estocar' | 'Recapar' | 'Sucatear';

export type TipoOperacaoPneu =
  | 'Mount'
  | 'Estocar'
  | 'Recapar'
  | 'Sucatear'
  | 'AddKm';

export type TipoCombustivel = 'Diesel' | 'Gasolina' | 'Arla';

export type TipoManutencao = 'Preventiva' | 'Corretiva' | 'Preditiva';

export type StatusMulta = 'Pendente' | 'Paga' | 'Recorrida' | 'Cancelada';

export type PapelUsuario = 'ADMIN' | 'OPERADOR' | 'DIRETOR';

export interface RegraModeloPneu {
  id: string;
  marca: string;
  medida: string;
  km1: number;
  km2: number;
  km3: number;
  kmSucata: number;
}

export interface RegrasGeraisPneu {
  sulcoMinimoMm: number;
  maxRecapagens: number;
  alertaProximidadeKm: number;
}

export interface RegraManutencaoPreventiva {
  id: string;
  modelo: string;
  categoria: string;
  peca: string;
  km: number;
}

export interface EmpresaConfig {
  nomeEmpresa: string;
  cnpj: string;
  logoUrl: string;
  regrasModelos: RegraModeloPneu[];
  regrasPneus: RegrasGeraisPneu;
  regrasManutencao: RegraManutencaoPreventiva[];
}

export interface HistoricoPneu {
  id?: string;
  veiculoId: string;
  placa?: string;
  posicao: string;
  dataMontagem: string;
  dataRetirada?: string | null;
  kmInstalacao?: number;
  kmRetirada?: number | null;
  kmRodado: number;
  motivo?: string;
  autorId?: string;
}

export interface ReformaPneu {
  id?: string;
  ciclo: number;
  dataEnvio: string;
  dataRetorno?: string | null;
  fornecedor: string;
  tipoBanda: string;
  valor: number;
  kmNoEnvio: number;
  concluida: boolean;
}

export interface Pneu {
  id: string;
  fogo: string;
  marca: string;
  medida: string;
  sulcoMm: number;
  recapagens: number;
  kmTotal: number;
  classificacao: ClassificacaoPneu;
  veiculoAtualId: string;
  posicaoAtual: string;
  localEstoque: string;
  tipoBanda?: string;
  historicoVeiculos: HistoricoPneu[];
  reformas?: ReformaPneu[];
}

export interface Veiculo {
  id: string;
  placa: string;
  uf: string;
  modelo: string;
  categoria: string;
  eixos: number;
  kmAtual: number;
  kmBase?: number | null;
  status: StatusVeiculo;
}

export interface Manutencao {
  id: string;
  osNumero: string;
  veiculoId: string;
  tipo: TipoManutencao;
  categoria?: string;
  peca?: string;
  km?: number;
  descricao: string;
  fornecedor: string;
  data: string;
  valor: number;
}

export interface Multa {
  id: string;
  ait: string;
  veiculoId: string;
  motivo: string;
  identificado?: boolean;
  motorista: string;
  status: StatusMulta;
  data: string;
  pontos: number;
  valorOriginal?: number;
  valorNIC?: number;
  valor: number;
}

export interface Abastecimento {
  id: string;
  veiculoId: string;
  tipo: TipoCombustivel;
  data: string;
  litros: number;
  valorUnit: number;
  valorTotal: number;
  km: number;
  fornecedor: string;
}

export interface KmAtualLancado {
  km: number;
  data: string;
  origem: 'manutencao' | 'abastecimento' | 'operacao' | 'kmBase';
}

export type StatusAlertaPreventiva = 'sem' | 'vencida' | 'proxima' | 'ok';

export interface AlertaPreventivaItem {
  v: Veiculo;
  r: RegraManutencaoPreventiva;
  ultimo: Manutencao | null;
  proximo: number;
  restante: number;
  atual: KmAtualLancado;
  status: StatusAlertaPreventiva;
}

export interface AlertaRemold {
  tire: Pneu;
  tipo: 'recapar' | 'sucatear' | 'atencao';
  localLabel: string;
  instrucao: string;
  motivo: string;
}
`,

  'src/types/domain.ts': `
import type {
  ClassificacaoPneu,
  PapelUsuario,
  StatusAlertaPreventiva,
  StatusMulta,
  StatusVeiculo,
  TipoCombustivel,
  TipoManutencao,
} from './frotawise';

export interface UserCapabilities {
  canManageVehicles: boolean;
  canManageTires: boolean;
  canManageMalha: boolean;
  canManagePreventiveRules: boolean;
  canManageFuelings: boolean;
  canManageMaintenances: boolean;
  canManageFines: boolean;
  canImportData: boolean;
  canExportData: boolean;
}

export interface AuthenticatedUserDTO {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  tenantId: string;
  nomeEmpresa: string;
  capabilities: UserCapabilities;
}

export interface PneuApiDTO {
  id: string;
  fogo: string;
  marca: string;
  medida: string;
  sulcoMm: number;
  recapagens: number;
  kmTotal: number;
  classificacao: ClassificacaoPneu;
  veiculoAtualId: string | null;
  posicaoAtual: string | null;
  localEstoque: string;
  tipoBanda: string | null;
  updatedAt?: string;
}

export interface VeiculoApiDTO {
  id: string;
  placa: string;
  uf: string;
  modelo: string;
  categoria: string;
  eixos: number;
  kmAtual: number;
  kmBase: number | null;
  status: StatusVeiculo;
  ultimoHodometro?: {
    km: number;
    data: string;
    origem: 'manutencao' | 'abastecimento' | 'operacao' | 'kmBase';
  } | null;
  updatedAt?: string;
}

export interface AbastecimentoApiDTO {
  id: string;
  veiculoId: string;
  tipo: TipoCombustivel;
  data: string;
  litros: number;
  valorUnit: string;
  valorTotal: string;
  km: number;
  fornecedor: string;
  mediaKmLitroCalculada?: number | null;
  updatedAt?: string;
}

export interface AlertaPreventivaApiDTO {
  veiculoId: string;
  regraId: string;
  ultimaManutencaoId: string | null;
  ultimaManutencaoKm: number | null;
  ultimaManutencaoData: string | null;
  kmAtual: number;
  kmAtualData: string;
  kmAtualOrigem: 'manutencao' | 'abastecimento' | 'operacao' | 'kmBase';
  proximoLimiteKm: number;
  restanteKm: number;
  status: StatusAlertaPreventiva;
}

export interface ManutencaoApiDTO {
  id: string;
  osNumero: string;
  veiculoId: string;
  tipo: TipoManutencao;
  categoria: string | null;
  peca: string | null;
  km: number | null;
  descricao: string;
  fornecedor: string;
  data: string;
  valor: string;
  updatedAt?: string;
}

export interface MultaApiDTO {
  id: string;
  ait: string;
  veiculoId: string;
  motivo: string;
  identificado: boolean;
  motorista: string;
  status: StatusMulta;
  data: string;
  pontos: number;
  valorOriginal: string | null;
  valorNIC: string | null;
  valor: string;
  updatedAt?: string;
}

export interface DashboardResumoApiDTO {
  pneus: {
    total: number;
    rodando: number;
    estoque: number;
    recapagem: number;
    sucata: number;
  };
  financeiro: {
    custoManutencoesPeriodo: string;
    custoMultasPeriodo: string;
    custoCombustivelPeriodo: string;
  };
  fuelStats: {
    totalLitrosCombustivel: number;
    totalLitrosArla: number;
    gastoTotalCombustivel: string;
    gastoTotalArla: string;
    totalLancamentos: number;
    mediaKmLitroFrota: number | null;
    veiculosComAmostraValida: number;
  };
}
`,

  'src/lib/mappers/index.ts': `
import type {
  Abastecimento,
  Manutencao,
  Multa,
  Pneu,
  Veiculo,
} from '@/types/frotawise';
import type {
  AbastecimentoApiDTO,
  ManutencaoApiDTO,
  MultaApiDTO,
  PneuApiDTO,
  VeiculoApiDTO,
} from '@/types/domain';

const ISO_DATE_REGEX = /^\\d{4}-\\d{2}-\\d{2}$/;

export function assertValidIsoDate(dateStr: string, fieldName = 'data'): string {
  const normalized = dateStr.slice(0, 10);
  if (!ISO_DATE_REGEX.test(normalized)) {
    throw new Error(
      '[Contract Violation] Campo "' +
        fieldName +
        '" deve estar em formato ISO YYYY-MM-DD. Recebido: "' +
        dateStr +
        '".'
    );
  }
  return normalized;
}

export function parseDecimalToNumber(
  decimalValue: string | number,
  fieldName: string
): number {
  const parsed =
    typeof decimalValue === 'number' ? decimalValue : Number(decimalValue);
  if (!Number.isFinite(parsed)) {
    throw new Error(
      '[Contract Violation] Valor monetário/decimal inválido no campo "' +
        fieldName +
        '": "' +
        String(decimalValue) +
        '".'
    );
  }
  return parsed;
}

export function toDecimalString(value: number, scale = 2): string {
  if (!Number.isFinite(value)) {
    throw new Error('[Mapper] Número inválido para conversão Decimal: ' + String(value));
  }
  return value.toFixed(scale);
}

export function mapPneuDtoToViewModel(dto: PneuApiDTO): Pneu {
  return {
    id: dto.id,
    fogo: dto.fogo,
    marca: dto.marca,
    medida: dto.medida,
    sulcoMm: dto.sulcoMm,
    recapagens: dto.recapagens,
    kmTotal: dto.kmTotal,
    classificacao: dto.classificacao,
    veiculoAtualId: dto.veiculoAtualId ?? '',
    posicaoAtual: dto.posicaoAtual ?? '',
    localEstoque: dto.localEstoque,
    tipoBanda: dto.tipoBanda ?? undefined,
    historicoVeiculos: [],
    reformas: [],
  };
}

export function mapPneuViewModelToDto(pneu: Pneu): PneuApiDTO {
  return {
    id: pneu.id,
    fogo: pneu.fogo,
    marca: pneu.marca,
    medida: pneu.medida,
    sulcoMm: pneu.sulcoMm,
    recapagens: pneu.recapagens,
    kmTotal: pneu.kmTotal,
    classificacao: pneu.classificacao,
    veiculoAtualId: pneu.veiculoAtualId.trim() !== '' ? pneu.veiculoAtualId : null,
    posicaoAtual: pneu.posicaoAtual.trim() !== '' ? pneu.posicaoAtual : null,
    localEstoque: pneu.localEstoque,
    tipoBanda: pneu.tipoBanda?.trim() ? pneu.tipoBanda : null,
  };
}

export function mapVeiculoDtoToViewModel(dto: VeiculoApiDTO): Veiculo {
  return {
    id: dto.id,
    placa: dto.placa,
    uf: dto.uf,
    modelo: dto.modelo,
    categoria: dto.categoria,
    eixos: dto.eixos,
    kmAtual: dto.kmAtual,
    kmBase: dto.kmBase ?? null,
    status: dto.status,
  };
}

export function mapAbastecimentoDtoToViewModel(
  dto: AbastecimentoApiDTO
): Abastecimento {
  if (!['Diesel', 'Gasolina', 'Arla'].includes(dto.tipo)) {
    throw new Error('[Contract Violation] TipoCombustivel desconhecido: ' + dto.tipo);
  }
  return {
    id: dto.id,
    veiculoId: dto.veiculoId,
    tipo: dto.tipo,
    data: assertValidIsoDate(dto.data, 'abastecimento.data'),
    litros: dto.litros,
    valorUnit: parseDecimalToNumber(dto.valorUnit, 'abastecimento.valorUnit'),
    valorTotal: parseDecimalToNumber(dto.valorTotal, 'abastecimento.valorTotal'),
    km: dto.km,
    fornecedor: dto.fornecedor,
  };
}

export function mapManutencaoDtoToViewModel(dto: ManutencaoApiDTO): Manutencao {
  return {
    id: dto.id,
    osNumero: dto.osNumero,
    veiculoId: dto.veiculoId,
    tipo: dto.tipo,
    categoria: dto.categoria ?? undefined,
    peca: dto.peca ?? undefined,
    km: dto.km ?? undefined,
    descricao: dto.descricao,
    fornecedor: dto.fornecedor,
    data: assertValidIsoDate(dto.data, 'manutencao.data'),
    valor: parseDecimalToNumber(dto.valor, 'manutencao.valor'),
  };
}

export function mapMultaDtoToViewModel(dto: MultaApiDTO): Multa {
  return {
    id: dto.id,
    ait: dto.ait,
    veiculoId: dto.veiculoId,
    motivo: dto.motivo,
    identificado: dto.identificado,
    motorista: dto.motorista,
    status: dto.status,
    data: assertValidIsoDate(dto.data, 'multa.data'),
    pontos: dto.pontos,
    valorOriginal:
      dto.valorOriginal !== null
        ? parseDecimalToNumber(dto.valorOriginal, 'multa.valorOriginal')
        : undefined,
    valorNIC:
      dto.valorNIC !== null
        ? parseDecimalToNumber(dto.valorNIC, 'multa.valorNIC')
        : undefined,
    valor: parseDecimalToNumber(dto.valor, 'multa.valor'),
  };
}
`,

  'docs/contracts/openapi.yaml': `
openapi: 3.1.0
info:
  title: FrotaWise Enterprise API — Contrato Alinhado ao Snapshot FE 3.5.0
  version: 3.5.0-draft.1
  description: >
    Especificacao de contrato compartilhado entre Frontend Next.js (BFF) e Backend FastAPI.
    Rotas marcadas com [PROPOSTO] exigem adendo ao Backend v3.1 antes da migration BE-02.
paths:
  /v1/auth/login:
    post:
      summary: Autenticacao individual de operador/gestor
      responses:
        '200':
          description: Sessao criada com sucesso
        '401':
          description: Credenciais invalidas
        '403':
          description: Bloqueado por RBAC ou IP
  /v1/auth/logout:
    post:
      summary: Revogacao idempotente da sessao atual
      responses:
        '200':
          description: Sessao encerrada
  /v1/auth/me:
    get:
      summary: Retorna identidade, tenant e capabilities do usuario autenticado
      responses:
        '200':
          description: Identidade verificada
        '401':
          description: Sessao expirada ou revogada
  /v1/veiculos:
    get:
      summary: Lista veiculos do tenant autenticado
      responses:
        '200':
          description: Lista de VeiculoApiDTO
    post:
      summary: Cadastra veiculo (2 a 6 eixos homologados)
      responses:
        '201':
          description: Veiculo criado
  /v1/pneus:
    get:
      summary: Lista pneus do tenant autenticado
      responses:
        '200':
          description: Lista de PneuApiDTO
  /v1/abastecimentos:
    get:
      summary: "[PROPOSTO] Lista lancamentos de Diesel, Gasolina e Arla"
      responses:
        '200':
          description: Lista de AbastecimentoApiDTO
    post:
      summary: "[PROPOSTO] Registra abastecimento transacional com Idempotency-Key"
      responses:
        '201':
          description: Abastecimento persistido e hodometro reconciliado no servidor
  /v1/empresa/regras-manutencao:
    get:
      summary: "[PROPOSTO] Lista regras de manutencao preventiva por modelo/categoria/peca/km"
      responses:
        '200':
          description: Lista de RegraManutencaoPreventiva
    post:
      summary: "[PROPOSTO] Cria regra preventiva validando unicidade por tenant"
      responses:
        '201':
          description: Regra criada
        '409':
          description: Regra duplicada
  /v1/dashboard/resumo:
    get:
      summary: "[PROPOSTO ADENDO fuelStats] Resumo agregado por tenant"
      responses:
        '200':
          description: DashboardResumoApiDTO
  /v1/dashboard/preventivas:
    get:
      summary: "[PROPOSTO] Lista alertas de preventiva (sem, vencida, proxima, ok)"
      responses:
        '200':
          description: Lista de AlertaPreventivaApiDTO
`,

  'docs/traceability.md': `
# Matriz de Rastreabilidade — Snapshot 3.5.0 (Issue FE-02)

| Tela / Rota | Componente / Hook | Servico Frontend | DTO / Schema | Endpoint FastAPI | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| /login | useAuth.ts | /api/auth/* (BFF) | AuthenticatedUserDTO | /v1/auth/login, /v1/auth/me | Pronto |
| /abastecimento | abastecimento/page.tsx | abastecimentosService.ts | AbastecimentoApiDTO | /v1/abastecimentos | PROPOSTO |
| /malha-pneus | malha-pneus/page.tsx | malhaService.ts / regrasPreventivasService.ts | RegraModeloPneu / RegraManutencaoPreventiva | /v1/empresa/malha / /v1/empresa/regras-manutencao | PROPOSTO (Preventivas) |
| /veiculos | veiculos/page.tsx | veiculosService.ts | VeiculoApiDTO | /v1/veiculos | Pronto |
| /pneus | pneus/page.tsx, RetiradaPneuModal.tsx | pneusService.ts | PneuApiDTO | /v1/pneus/* | Pronto |
| /custos-multas | custos-multas/page.tsx | financeiroService.ts | ManutencaoApiDTO, MultaApiDTO | /v1/manutencoes, /v1/multas | Pronto |
| / (Dashboard) | (dashboard)/page.tsx | dashboardService.ts | DashboardResumoApiDTO | /v1/dashboard/resumo | PROPOSTO (fuelStats) |
`,

  // ==========================================================================
  // ISSUE FE-03 — AUTENTICAÇÃO INDIVIDUAL, SESSÃO SEGURA E PROTEÇÃO DE ROTAS
  // ==========================================================================
  'src/lib/server/auth.ts': `
import { cookies, headers } from 'next/headers';
import crypto from 'node:crypto';
import { getServerEnv } from '@/config/env';

export const SESSION_COOKIE_NAME = 'fw_session';
export const CSRF_COOKIE_NAME = 'fw_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function getCookieSecurityOptions() {
  const { nodeEnv } = getServerEnv();
  const isProd = nodeEnv === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCsrfForMutation(request: Request): {
  valid: boolean;
  reason?: string;
} {
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  const headerStore = headers();
  const origin = headerStore.get('origin');
  const host = headerStore.get('host');

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return {
          valid: false,
          reason: 'Origin header não corresponde ao host da aplicação.',
        };
      }
    } catch {
      return { valid: false, reason: 'Origin header malformado.' };
    }
  }

  const cookieStore = cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const csrfHeader = headerStore.get(CSRF_HEADER_NAME);

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return {
      valid: false,
      reason: 'Token anti-CSRF ausente ou inválido para operação mutante.',
    };
  }

  return { valid: true };
}
`,

  'src/app/api/auth/login/route.ts': `
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/config/env';
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  generateCsrfToken,
  getCookieSecurityOptions,
} from '@/lib/server/auth';

export async function POST(request: Request) {
  const env = getServerEnv();

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Payload inválido',
        status: 400,
        detail: 'Corpo da requisição JSON inválido.',
        code: 'INVALID_JSON',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const email = body.email?.trim() ?? '';
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Credenciais obrigatórias',
        status: 422,
        detail: 'Informe e-mail corporativo e senha para autenticar.',
        code: 'MISSING_CREDENTIALS',
      },
      { status: 422, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (env.appMode === 'API') {
    try {
      const backendResponse = await fetch(env.backendApiUrl + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, application/problem+json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
        signal: AbortSignal.timeout(env.backendTimeoutMs),
      });

      if (!backendResponse.ok) {
        const errorBody = await backendResponse.json().catch(() => ({
          title: 'Falha na autenticação',
          status: backendResponse.status,
          detail:
            backendResponse.status === 401
              ? 'Credenciais inválidas.'
              : backendResponse.status === 403
                ? 'Acesso bloqueado por perfil ou restrição de rede corporativa.'
                : 'Serviço de identidade temporariamente indisponível.',
        }));
        return NextResponse.json(errorBody, {
          status: backendResponse.status,
          headers: { 'Cache-Control': 'no-store' },
        });
      }

      const data = (await backendResponse.json()) as {
        accessToken: string;
        user: Record<string, unknown>;
      };

      const csrfToken = generateCsrfToken();
      const cookieStore = cookies();
      const secOpts = getCookieSecurityOptions();

      cookieStore.set(SESSION_COOKIE_NAME, data.accessToken, {
        ...secOpts,
        httpOnly: true,
      });

      cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
        ...secOpts,
        httpOnly: false,
      });

      return NextResponse.json(
        { user: data.user, csrfToken },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    } catch {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Serviço de autenticação indisponível',
          status: 503,
          detail: 'Não foi possível conectar ao servidor de autenticação.',
          code: 'AUTH_UPSTREAM_UNAVAILABLE',
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  return NextResponse.json(
    {
      type: 'about:blank',
      title: 'Modo não suportado para login remoto',
      status: 501,
      detail: 'Configure NEXT_PUBLIC_APP_MODE=API para autenticação real.',
    },
    { status: 501, headers: { 'Cache-Control': 'no-store' } }
  );
}
`,

  'src/app/api/auth/logout/route.ts': `
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/config/env';
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/server/auth';

export async function POST() {
  const env = getServerEnv();
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (env.appMode === 'API' && sessionToken && env.backendApiUrl) {
    try {
      await fetch(env.backendApiUrl + '/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + sessionToken,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Logout permanece idempotente mesmo se a sessão já expirou no backend
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);

  return NextResponse.json(
    { loggedOut: true },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
`,

  'src/app/api/auth/me/route.ts': `
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/config/env';
import { SESSION_COOKIE_NAME } from '@/lib/server/auth';

export async function GET() {
  const env = getServerEnv();
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Não autenticado',
        status: 401,
        detail: 'Sessão ausente ou expirada.',
        code: 'UNAUTHENTICATED',
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (env.appMode === 'API') {
    try {
      const response = await fetch(env.backendApiUrl + '/auth/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + sessionToken,
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(env.backendTimeoutMs),
      });

      if (!response.ok) {
        if (response.status === 401) {
          cookieStore.delete(SESSION_COOKIE_NAME);
        }
        const errPayload = await response.json().catch(() => ({
          title: 'Sessão inválida ou revogada',
          status: response.status,
          code: response.status === 401 ? 'SESSION_REVOKED' : 'FORBIDDEN',
        }));
        return NextResponse.json(errPayload, {
          status: response.status,
          headers: { 'Cache-Control': 'no-store' },
        });
      }

      const user = await response.json();
      return NextResponse.json(
        { user },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    } catch {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Falha ao validar sessão',
          status: 503,
          detail: 'Servidor de identidade indisponível.',
          code: 'AUTH_UPSTREAM_UNAVAILABLE',
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  return NextResponse.json(
    { title: 'Modo DEMO requer adaptador explícito', status: 401 },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
}
`,

  'src/middleware.ts': `
import { NextResponse, type NextRequest } from 'next/server';
import { getClientEnv } from '@/config/env';

const PROTECTED_PREFIXES = [
  '/abastecimento',
  '/custos-multas',
  '/malha-pneus',
  '/pneus',
  '/veiculos',
];

export function middleware(request: NextRequest) {
  const { appMode } = getClientEnv();
  const { pathname } = request.nextUrl;

  if (appMode !== 'API') {
    return NextResponse.next();
  }

  const isProtected =
    pathname === '/' ||
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('fw_session')?.value;
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, private');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
}

export const config = {
  matcher: [
    '/',
    '/abastecimento/:path*',
    '/custos-multas/:path*',
    '/malha-pneus/:path*',
    '/pneus/:path*',
    '/veiculos/:path*',
  ],
};
`,

  'src/hooks/useAuth.ts': `
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
`,

  // ==========================================================================
  // ISSUE FE-04 — CLIENTE HTTP, BFF E TRATAMENTO UNIFORME DE FALHAS
  // ==========================================================================
  'src/lib/errors.ts': `
import type { AxiosError } from 'axios';

export type AppErrorKind =
  | 'BAD_REQUEST'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNAVAILABLE'
  | 'NETWORK_OR_TIMEOUT';

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
}

export class FrotaWiseApiError extends Error {
  public readonly kind: AppErrorKind;
  public readonly status: number | null;
  public readonly code: string;
  public readonly detail: string;
  public readonly requestId?: string;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(params: {
    kind: AppErrorKind;
    status: number | null;
    code: string;
    title: string;
    detail: string;
    requestId?: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(params.detail || params.title);
    this.name = 'FrotaWiseApiError';
    this.kind = params.kind;
    this.status = params.status;
    this.code = params.code;
    this.detail = params.detail;
    this.requestId = params.requestId;
    this.fieldErrors = params.fieldErrors;
  }
}

export function mapStatusToErrorKind(status: number | null): AppErrorKind {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHENTICATED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION';
    case 429:
      return 'RATE_LIMITED';
    case 503:
      return 'UNAVAILABLE';
    default:
      return status && status >= 500 ? 'SERVER_ERROR' : 'NETWORK_OR_TIMEOUT';
  }
}

export function normalizeApiError(error: unknown): FrotaWiseApiError {
  if (error instanceof FrotaWiseApiError) {
    return error;
  }

  const axiosErr = error as AxiosError<ProblemDetails>;
  const status = axiosErr?.response?.status ?? null;
  const data = axiosErr?.response?.data;
  const kind = mapStatusToErrorKind(status);

  if (status === 409) {
    return new FrotaWiseApiError({
      kind: 'CONFLICT',
      status: 409,
      code: data?.code ?? 'CONFLICT_OPERATION',
      title: data?.title ?? 'Conflito de operação concorrente',
      detail:
        data?.detail ??
        'Outro operador já alterou este registro. Atualize os dados da tela antes de tentar novamente.',
      requestId: data?.requestId,
    });
  }

  if (status === null) {
    return new FrotaWiseApiError({
      kind: 'NETWORK_OR_TIMEOUT',
      status: null,
      code: 'NETWORK_FAILURE',
      title: 'Falha de comunicação',
      detail:
        'Servidor indisponível ou sem conexão de rede. Nenhum dado foi salvo.',
    });
  }

  return new FrotaWiseApiError({
    kind,
    status,
    code: data?.code ?? 'HTTP_' + String(status),
    title: data?.title ?? 'Erro ao processar operação',
    detail:
      data?.detail ??
      'A operação não pôde ser concluída pelo servidor. Verifique os dados e tente novamente.',
    requestId: data?.requestId,
    fieldErrors: data?.fieldErrors,
  });
}
`,

  'src/app/api/[...path]/route.ts': `
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getServerEnv } from '@/config/env';
import { SESSION_COOKIE_NAME, verifyCsrfForMutation } from '@/lib/server/auth';

const ALLOWED_TOP_SEGMENTS = new Set([
  'empresa',
  'veiculos',
  'pneus',
  'manutencoes',
  'multas',
  'abastecimentos',
  'dashboard',
  'onboarding',
]);

function isAllowedProxyPath(segments: string[]): boolean {
  if (segments.length === 0) return false;
  for (const seg of segments) {
    if (
      seg === '..' ||
      seg === '.' ||
      seg.includes('\\\\') ||
      seg.toLowerCase().includes('%2e')
    ) {
      return false;
    }
  }
  return ALLOWED_TOP_SEGMENTS.has(segments[0]);
}

function stripUntrustedTenantFields(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }
  const copy = { ...(payload as Record<string, unknown>) };
  delete copy.tenant_id;
  delete copy.tenantId;
  delete copy.empresa_id;
  delete copy.empresaId;
  return copy;
}

async function handleBffProxy(
  request: Request,
  context: { params: { path: string[] } }
) {
  const env = getServerEnv();
  const segments = context.params.path ?? [];

  if (!isAllowedProxyPath(segments)) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Rota não permitida pelo BFF',
        status: 403,
        detail: 'O recurso solicitado não faz parte da lista branca do BFF.',
        code: 'BFF_ROUTE_FORBIDDEN',
      },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const csrfCheck = verifyCsrfForMutation(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Falha na validação CSRF',
        status: 403,
        detail: csrfCheck.reason ?? 'Requisição bloqueada por proteção CSRF.',
        code: 'CSRF_INVALID',
      },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Sessão expirada',
        status: 401,
        detail: 'Faça login novamente para acessar este recurso.',
        code: 'UNAUTHENTICATED',
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const incomingUrl = new URL(request.url);
  const targetUrl =
    env.backendApiUrl + '/' + segments.join('/') + incomingUrl.search;

  const incomingHeaders = headers();
  const upstreamHeaders: Record<string, string> = {
    Authorization: 'Bearer ' + sessionToken,
    Accept: 'application/json, application/problem+json',
  };

  const idempotencyKey = incomingHeaders.get('idempotency-key');
  if (idempotencyKey) {
    upstreamHeaders['Idempotency-Key'] = idempotencyKey;
  }
  const ifMatch = incomingHeaders.get('if-match');
  if (ifMatch) {
    upstreamHeaders['If-Match'] = ifMatch;
  }

  let bodyString: string | undefined;
  if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
    upstreamHeaders['Content-Type'] = 'application/json';
    const rawText = await request.text();
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        bodyString = JSON.stringify(stripUntrustedTenantFields(parsed));
      } catch {
        return NextResponse.json(
          {
            title: 'JSON malformado',
            status: 400,
            detail: 'O corpo da requisição não é um JSON válido.',
            code: 'INVALID_JSON',
          },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: bodyString,
      cache: 'no-store',
      signal: AbortSignal.timeout(env.backendTimeoutMs),
    });

    const responseText = await upstreamResponse.text();
    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type':
          upstreamResponse.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      },
    });
  } catch {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Backend indisponível',
        status: 503,
        detail:
          'O serviço operacional não respondeu a tempo. Nenhuma alteração foi persistida.',
        code: 'UPSTREAM_UNAVAILABLE',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export const GET = handleBffProxy;
export const POST = handleBffProxy;
export const PUT = handleBffProxy;
export const PATCH = handleBffProxy;
export const DELETE = handleBffProxy;
`,

  'src/components/ui/ErrorState.tsx': `
'use client';

import React from 'react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Não foi possível carregar os dados',
  message,
  code,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-slate-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-400">{title}</h3>
          <p className="mt-1 text-xs text-slate-300">{message}</p>
          {code && (
            <span className="mt-2 inline-block rounded bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-400">
              Código: {code}
            </span>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-red-600/80 hover:bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
`,

  'src/components/ui/Toast.tsx': `
'use client';

import React from 'react';

export interface ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export function Toast({ variant = 'info', message, onClose }: ToastProps) {
  const styles = {
    success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200',
    error: 'border-red-500/40 bg-red-950/90 text-red-200',
    warning: 'border-amber-500/40 bg-amber-950/90 text-amber-200',
    info: 'border-blue-500/40 bg-slate-900/90 text-slate-100',
  }[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-xs shadow-lg ' +
        styles
      }
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 font-bold opacity-75 hover:opacity-100"
          aria-label="Fechar aviso"
        >
          ×
        </button>
      )}
    </div>
  );
}
`,

  // ==========================================================================
  // ISSUE FE-05 — ESTADO REMOTO, CACHE E EXPERIÊNCIA MULTIUSUÁRIO
  // ==========================================================================
  'src/lib/queryKeys.ts': `
import { STORAGE_KEYS } from '@/config/constants';

export const queryKeys = {
  all: (tenantId: string) => ['frotawise', tenantId] as const,
  companyConfig: (tenantId: string) =>
    ['frotawise', tenantId, 'company-config'] as const,
  preventiveRules: (tenantId: string) =>
    ['frotawise', tenantId, 'preventive-rules'] as const,
  preventiveAlerts: (tenantId: string) =>
    ['frotawise', tenantId, 'preventive-alerts'] as const,
  vehicles: (tenantId: string) =>
    ['frotawise', tenantId, 'vehicles'] as const,
  tires: (tenantId: string) => ['frotawise', tenantId, 'tires'] as const,
  fuelings: (tenantId: string, filters?: Record<string, unknown>) =>
    ['frotawise', tenantId, 'fuelings', filters ?? {}] as const,
  maintenances: (tenantId: string) =>
    ['frotawise', tenantId, 'maintenances'] as const,
  fines: (tenantId: string) => ['frotawise', tenantId, 'fines'] as const,
  dashboardSummary: (tenantId: string, period?: string) =>
    ['frotawise', tenantId, 'dashboard-summary', period ?? 'current'] as const,
};

const activeControllers = new Set<AbortController>();

export function registerInFlightController(): AbortController {
  const controller = new AbortController();
  activeControllers.add(controller);
  return controller;
}

export function releaseInFlightController(controller: AbortController): void {
  activeControllers.delete(controller);
}

export function clearSessionScopedCaches(): void {
  for (const controller of activeControllers) {
    controller.abort();
  }
  activeControllers.clear();

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('ecofrota_jwt_token');
      window.localStorage.removeItem(STORAGE_KEYS.COMPANY);
      window.localStorage.removeItem(STORAGE_KEYS.VEHICLES);
      window.localStorage.removeItem(STORAGE_KEYS.TIRES);
      window.localStorage.removeItem(STORAGE_KEYS.MAINTENANCES);
      window.localStorage.removeItem(STORAGE_KEYS.FINES);
      window.localStorage.removeItem(STORAGE_KEYS.FUELINGS);
    } catch {
      // Storage indisponível
    }
  }
}
`,

  'src/providers/QueryProvider.tsx': `
'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { clearSessionScopedCaches } from '@/lib/queryKeys';

interface ServerCacheContextValue {
  revision: number;
  invalidateTenantCache: () => void;
  resetAllSessionData: () => void;
}

const ServerCacheContext = createContext<ServerCacheContextValue>({
  revision: 0,
  invalidateTenantCache: () => undefined,
  resetAllSessionData: () => undefined,
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState(0);

  const invalidateTenantCache = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  const resetAllSessionData = useCallback(() => {
    clearSessionScopedCaches();
    setRevision((prev) => prev + 1);
  }, []);

  return (
    <ServerCacheContext.Provider
      value={{ revision, invalidateTenantCache, resetAllSessionData }}
    >
      {children}
    </ServerCacheContext.Provider>
  );
}

export function useServerCache() {
  return useContext(ServerCacheContext);
}
`,

  // ==========================================================================
  // ISSUE FE-06 — CONFIGURAÇÕES DA EMPRESA, MALHA E REGRAS PREVENTIVAS
  // ==========================================================================
  'src/services/malhaService.ts': `
import type { EmpresaConfig, RegraModeloPneu } from '@/types/frotawise';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';

export const malhaService = {
  async getEmpresaConfig(): Promise<EmpresaConfig> {
    try {
      const response = await httpClient.get<EmpresaConfig>('/empresa/config');
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createRegraMalha(
    payload: Omit<RegraModeloPneu, 'id'>
  ): Promise<RegraModeloPneu> {
    if (
      payload.km1 <= 0 ||
      payload.km2 <= 0 ||
      payload.km3 <= 0 ||
      payload.kmSucata <= 0
    ) {
      throw new Error(
        'Todos os limites de quilometragem da malha devem ser maiores que zero.'
      );
    }
    try {
      const response = await httpClient.post<RegraModeloPneu>(
        '/empresa/malha',
        payload
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async removeRegraMalha(id: string): Promise<void> {
    try {
      await httpClient.delete('/empresa/malha/' + encodeURIComponent(id));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
`,

  'src/services/regrasPreventivasService.ts': `
import type { RegraManutencaoPreventiva } from '@/types/frotawise';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';

export interface CreateRegraPreventivaInput {
  modelo?: string;
  categoria: string;
  peca: string;
  km: number;
}

export function normalizePreventiveRuleKey(input: {
  modelo?: string;
  categoria: string;
  peca: string;
}): string {
  const m = (input.modelo ?? '').trim().toUpperCase();
  const c = input.categoria.trim().toUpperCase();
  const p = input.peca.trim().toUpperCase();
  return m + '::' + c + '::' + p;
}

export function validatePreventiveRuleInput(
  input: CreateRegraPreventivaInput,
  existingRules: RegraManutencaoPreventiva[] = [],
  editingId?: string
): string | null {
  if (!input.categoria?.trim()) {
    return 'A categoria do veículo é obrigatória.';
  }
  if (!input.peca?.trim()) {
    return 'A peça ou serviço preventivo é obrigatório.';
  }
  if (!Number.isFinite(input.km) || input.km <= 0) {
    return 'O intervalo de quilometragem (km) deve ser um número positivo maior que zero.';
  }

  const candidateKey = normalizePreventiveRuleKey(input);
  const duplicate = existingRules.find(
    (r) => r.id !== editingId && normalizePreventiveRuleKey(r) === candidateKey
  );
  if (duplicate) {
    return 'Já existe uma regra preventiva cadastrada para esta combinação de Modelo, Categoria e Peça.';
  }

  return null;
}

export const regrasPreventivasService = {
  async list(): Promise<RegraManutencaoPreventiva[]> {
    try {
      const response = await httpClient.get<RegraManutencaoPreventiva[]>(
        '/empresa/regras-manutencao'
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(
    input: CreateRegraPreventivaInput
  ): Promise<RegraManutencaoPreventiva> {
    const validationError = validatePreventiveRuleInput(input);
    if (validationError) {
      throw new Error(validationError);
    }
    try {
      const response = await httpClient.post<RegraManutencaoPreventiva>(
        '/empresa/regras-manutencao',
        {
          modelo: input.modelo?.trim() ?? '',
          categoria: input.categoria.trim(),
          peca: input.peca.trim(),
          km: Math.round(input.km),
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    id: string,
    input: CreateRegraPreventivaInput
  ): Promise<RegraManutencaoPreventiva> {
    const validationError = validatePreventiveRuleInput(input, [], id);
    if (validationError) {
      throw new Error(validationError);
    }
    try {
      const response = await httpClient.patch<RegraManutencaoPreventiva>(
        '/empresa/regras-manutencao/' + encodeURIComponent(id),
        {
          modelo: input.modelo?.trim() ?? '',
          categoria: input.categoria.trim(),
          peca: input.peca.trim(),
          km: Math.round(input.km),
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete(
        '/empresa/regras-manutencao/' + encodeURIComponent(id)
      );
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
`,

  // ==========================================================================
  // ISSUE FE-07 — FROTA, CHASSI E POSIÇÕES DE MONTAGEM
  // ==========================================================================
  'src/services/veiculosService.ts': `
import type {
  Abastecimento,
  AlertaPreventivaItem,
  KmAtualLancado,
  Manutencao,
  Pneu,
  RegraManutencaoPreventiva,
  Veiculo,
} from '@/types/frotawise';
import type { VeiculoApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import { mapVeiculoDtoToViewModel } from '@/lib/mappers';

export function getVehicleChassisSlots(eixos: number): string[] {
  const safeAxles = Math.min(6, Math.max(2, Math.trunc(eixos || 2)));
  const slots: string[] = ['E1-ESQ', 'E1-DIR'];

  for (let i = 2; i <= safeAxles; i++) {
    slots.push(
      'E' + i + '-EE',
      'E' + i + '-EI',
      'E' + i + '-DI',
      'E' + i + '-DE'
    );
  }

  slots.push('ESTEPE-1');
  return slots;
}

export function findOrphanedTiresOnAxleChange(
  veiculoId: string,
  novosEixos: number,
  tires: Pneu[]
): Pneu[] {
  const validSlots = new Set(getVehicleChassisSlots(novosEixos));
  return tires.filter(
    (t) =>
      t.veiculoAtualId === veiculoId &&
      Boolean(t.posicaoAtual) &&
      !validSlots.has(t.posicaoAtual)
  );
}

export function matchesPreventiveRule(
  veiculo: Veiculo,
  regra: RegraManutencaoPreventiva,
  manutencao?: Manutencao
): boolean {
  const catMatch =
    veiculo.categoria.trim().toUpperCase() ===
    regra.categoria.trim().toUpperCase();
  const modelMatch =
    !regra.modelo.trim() ||
    veiculo.modelo.trim().toUpperCase() === regra.modelo.trim().toUpperCase();

  if (!catMatch || !modelMatch) return false;
  if (!manutencao) return true;

  const pecaRegra = regra.peca.trim().toUpperCase();
  const pecaManut = (manutencao.peca ?? '').trim().toUpperCase();
  return pecaManut === pecaRegra;
}

export function computePreventiveAlertsPreview(
  vehicles: Veiculo[],
  rules: RegraManutencaoPreventiva[],
  maintenances: Manutencao[],
  avisoProximidadeKm = 500
): AlertaPreventivaItem[] {
  const items: AlertaPreventivaItem[] = [];

  for (const v of vehicles) {
    for (const r of rules) {
      if (!matchesPreventiveRule(v, r)) continue;

      const historicoCompativel = maintenances
        .filter(
          (m) => m.veiculoId === v.id && matchesPreventiveRule(v, r, m)
        )
        .sort((a, b) => (b.km ?? 0) - (a.km ?? 0));

      const ultimo = historicoCompativel[0] ?? null;
      const atual: KmAtualLancado = {
        km: v.kmAtual,
        data: new Date().toISOString().slice(0, 10),
        origem: 'operacao',
      };

      if (!ultimo || ultimo.km === undefined) {
        const marcoInicial = v.kmBase ?? 0;
        const proximo = marcoInicial + r.km;
        const restante = proximo - v.kmAtual;
        items.push({
          v,
          r,
          ultimo: null,
          proximo,
          restante,
          atual,
          status:
            restante <= 0
              ? 'vencida'
              : restante <= avisoProximidadeKm
                ? 'proxima'
                : 'sem',
        });
        continue;
      }

      const proximo = ultimo.km + r.km;
      const restante = proximo - v.kmAtual;
      const status =
        restante <= 0
          ? 'vencida'
          : restante <= avisoProximidadeKm
            ? 'proxima'
            : 'ok';

      items.push({
        v,
        r,
        ultimo,
        proximo,
        restante,
        atual,
        status,
      });
    }
  }

  return items;
}

export function computeFuelMedias(
  fuelings: Abastecimento[]
): Record<string, number | null> {
  const medias: Record<string, number | null> = {};
  const porVeiculo = new Map<string, Abastecimento[]>();

  for (const f of fuelings) {
    if (f.tipo === 'Arla') {
      medias[f.id] = null;
      continue;
    }
    const lista = porVeiculo.get(f.veiculoId) ?? [];
    lista.push(f);
    porVeiculo.set(f.veiculoId, lista);
  }

  for (const [, lista] of porVeiculo.entries()) {
    const ordenados = [...lista].sort((a, b) => a.km - b.km);
    for (let i = 0; i < ordenados.length; i++) {
      const atual = ordenados[i];
      if (i === 0 || atual.litros <= 0) {
        medias[atual.id] = null;
        continue;
      }
      const anterior = ordenados[i - 1];
      const deltaKm = atual.km - anterior.km;
      medias[atual.id] =
        deltaKm > 0 ? Number((deltaKm / atual.litros).toFixed(2)) : null;
    }
  }

  return medias;
}

export const veiculosService = {
  async list(): Promise<Veiculo[]> {
    try {
      const response = await httpClient.get<VeiculoApiDTO[]>('/veiculos');
      return response.data.map(mapVeiculoDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(payload: Omit<Veiculo, 'id'>): Promise<Veiculo> {
    if (payload.eixos < 2 || payload.eixos > 6) {
      throw new Error(
        'A configuração homologada no Snapshot 3.5.0 suporta de 2 a 6 eixos.'
      );
    }
    try {
      const response = await httpClient.post<VeiculoApiDTO>(
        '/veiculos',
        payload
      );
      return mapVeiculoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    id: string,
    payload: Partial<Omit<Veiculo, 'id'>>,
    mountedTires: Pneu[] = []
  ): Promise<Veiculo> {
    if (payload.eixos !== undefined) {
      const orfaos = findOrphanedTiresOnAxleChange(
        id,
        payload.eixos,
        mountedTires
      );
      if (orfaos.length > 0) {
        throw new Error(
          'Não é possível reduzir para ' +
            payload.eixos +
            ' eixos: há ' +
            orfaos.length +
            ' pneu(s) montado(s) em posições que deixariam de existir (' +
            orfaos.map((p) => p.posicaoAtual).join(', ') +
            '). Retire ou remaneje os pneus antes.'
        );
      }
    }

    try {
      const response = await httpClient.patch<VeiculoApiDTO>(
        '/veiculos/' + encodeURIComponent(id),
        payload
      );
      return mapVeiculoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
`,

  // ==========================================================================
  // ISSUE FE-08 — PNEUS, OPERAÇÕES, HODÔMETRO E RECAPAGEM
  // ==========================================================================
  'src/services/pneusService.ts': `
import type { Pneu } from '@/types/frotawise';
import type { PneuApiDTO, VeiculoApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import { mapPneuDtoToViewModel, mapVeiculoDtoToViewModel } from '@/lib/mappers';

export interface AlocarPneuCommand {
  pneuId: string;
  veiculoId: string;
  posicao: string;
  kmInstalacao: number;
  dataOperacao: string;
  idempotencyKey: string;
}

export interface RetirarPneuCommand {
  pneuId: string;
  kmRetirada: number;
  destino: 'Estocar' | 'Recapar' | 'Sucatear';
  localEstoque: string;
  motivo: string;
  sulcoMm?: number;
  dataOperacao: string;
  idempotencyKey: string;
}

export interface OperacaoPneuResult {
  pneu: Pneu;
  veiculoAfetado?: ReturnType<typeof mapVeiculoDtoToViewModel>;
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'fw-idem-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11);
}

export const pneusService = {
  async list(): Promise<Pneu[]> {
    try {
      const response = await httpClient.get<PneuApiDTO[]>('/pneus');
      return response.data.map(mapPneuDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async alocar(cmd: AlocarPneuCommand): Promise<OperacaoPneuResult> {
    if (!cmd.veiculoId || !cmd.posicao) {
      throw new Error(
        'Veículo e posição do chassi são obrigatórios para montagem.'
      );
    }
    if (!Number.isFinite(cmd.kmInstalacao) || cmd.kmInstalacao < 0) {
      throw new Error('Hodômetro de instalação inválido.');
    }

    try {
      const response = await httpClient.post<{
        pneu: PneuApiDTO;
        veiculo?: VeiculoApiDTO;
      }>(
        '/pneus/' + encodeURIComponent(cmd.pneuId) + '/alocar',
        {
          veiculoId: cmd.veiculoId,
          posicao: cmd.posicao,
          kmInstalacao: Math.round(cmd.kmInstalacao),
          dataOperacao: cmd.dataOperacao,
        },
        {
          headers: { 'Idempotency-Key': cmd.idempotencyKey },
        }
      );

      return {
        pneu: mapPneuDtoToViewModel(response.data.pneu),
        veiculoAfetado: response.data.veiculo
          ? mapVeiculoDtoToViewModel(response.data.veiculo)
          : undefined,
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async retirar(cmd: RetirarPneuCommand): Promise<OperacaoPneuResult> {
    if (!Number.isFinite(cmd.kmRetirada) || cmd.kmRetirada < 0) {
      throw new Error('Hodômetro de retirada inválido.');
    }

    try {
      const response = await httpClient.post<{
        pneu: PneuApiDTO;
        veiculo?: VeiculoApiDTO;
      }>(
        '/pneus/' + encodeURIComponent(cmd.pneuId) + '/retirar',
        {
          kmRetirada: Math.round(cmd.kmRetirada),
          destino: cmd.destino,
          localEstoque: cmd.localEstoque.trim(),
          motivo: cmd.motivo.trim(),
          sulcoMm: cmd.sulcoMm,
          dataOperacao: cmd.dataOperacao,
        },
        {
          headers: { 'Idempotency-Key': cmd.idempotencyKey },
        }
      );

      return {
        pneu: mapPneuDtoToViewModel(response.data.pneu),
        veiculoAfetado: response.data.veiculo
          ? mapVeiculoDtoToViewModel(response.data.veiculo)
          : undefined,
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
`,

  // ==========================================================================
  // ISSUE FE-09 — MANUTENÇÕES, MULTAS, CUSTOS E ABASTECIMENTO
  // ==========================================================================
  'src/services/abastecimentosService.ts': `
import type { Abastecimento, TipoCombustivel } from '@/types/frotawise';
import type { AbastecimentoApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import {
  assertValidIsoDate,
  mapAbastecimentoDtoToViewModel,
  toDecimalString,
} from '@/lib/mappers';

export interface CreateAbastecimentoInput {
  veiculoId: string;
  tipo: TipoCombustivel;
  data: string;
  litros: number;
  valorUnit: number;
  km: number;
  fornecedor: string;
  idempotencyKey: string;
}

export function estimateFuelingTotalPreview(
  litros: number,
  valorUnit: number
): number {
  if (!Number.isFinite(litros) || !Number.isFinite(valorUnit)) return 0;
  if (litros <= 0 || valorUnit <= 0) return 0;
  return Number((litros * valorUnit).toFixed(2));
}

export function validateAbastecimentoInput(
  input: Omit<CreateAbastecimentoInput, 'idempotencyKey'>
): string | null {
  if (!input.veiculoId?.trim()) return 'Selecione um veículo válido.';
  if (!['Diesel', 'Gasolina', 'Arla'].includes(input.tipo)) {
    return 'Tipo de combustível/fluido inválido.';
  }
  if (!Number.isFinite(input.litros) || input.litros <= 0) {
    return 'A quantidade de litros deve ser maior que zero.';
  }
  if (!Number.isFinite(input.valorUnit) || input.valorUnit <= 0) {
    return 'O valor unitário por litro deve ser maior que zero.';
  }
  if (!Number.isFinite(input.km) || input.km < 0) {
    return 'O hodômetro (km) informado é inválido.';
  }
  if (!input.fornecedor?.trim()) {
    return 'Informe o posto/fornecedor do abastecimento.';
  }
  try {
    assertValidIsoDate(input.data, 'data');
  } catch (err) {
    return (err as Error).message;
  }
  return null;
}

export const abastecimentosService = {
  async list(params?: {
    veiculoId?: string;
    tipo?: TipoCombustivel;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<Abastecimento[]> {
    try {
      const response = await httpClient.get<AbastecimentoApiDTO[]>(
        '/abastecimentos',
        { params }
      );
      return response.data.map(mapAbastecimentoDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(input: CreateAbastecimentoInput): Promise<Abastecimento> {
    const validationErr = validateAbastecimentoInput(input);
    if (validationErr) {
      throw new Error(validationErr);
    }

    try {
      const response = await httpClient.post<AbastecimentoApiDTO>(
        '/abastecimentos',
        {
          veiculoId: input.veiculoId,
          tipo: input.tipo,
          data: assertValidIsoDate(input.data),
          litros: input.litros,
          valorUnit: toDecimalString(input.valorUnit, 4),
          km: Math.round(input.km),
          fornecedor: input.fornecedor.trim(),
        },
        {
          headers: { 'Idempotency-Key': input.idempotencyKey },
        }
      );
      return mapAbastecimentoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    id: string,
    input: Omit<CreateAbastecimentoInput, 'idempotencyKey'>
  ): Promise<Abastecimento> {
    const validationErr = validateAbastecimentoInput(input);
    if (validationErr) {
      throw new Error(validationErr);
    }

    try {
      const response = await httpClient.patch<AbastecimentoApiDTO>(
        '/abastecimentos/' + encodeURIComponent(id),
        {
          veiculoId: input.veiculoId,
          tipo: input.tipo,
          data: assertValidIsoDate(input.data),
          litros: input.litros,
          valorUnit: toDecimalString(input.valorUnit, 4),
          km: Math.round(input.km),
          fornecedor: input.fornecedor.trim(),
        }
      );
      return mapAbastecimentoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete('/abastecimentos/' + encodeURIComponent(id));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
`,

  'src/services/financeiroService.ts': `
import type { Manutencao, Multa } from '@/types/frotawise';
import type { ManutencaoApiDTO, MultaApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import {
  assertValidIsoDate,
  mapManutencaoDtoToViewModel,
  mapMultaDtoToViewModel,
  toDecimalString,
} from '@/lib/mappers';

export const financeiroService = {
  async listManutencoes(): Promise<Manutencao[]> {
    try {
      const response = await httpClient.get<ManutencaoApiDTO[]>('/manutencoes');
      return response.data.map(mapManutencaoDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createManutencao(
    payload: Omit<Manutencao, 'id'>,
    idempotencyKey: string
  ): Promise<Manutencao> {
    try {
      const response = await httpClient.post<ManutencaoApiDTO>(
        '/manutencoes',
        {
          ...payload,
          categoria: payload.categoria?.trim() || null,
          peca: payload.peca?.trim() || null,
          data: assertValidIsoDate(payload.data),
          valor: toDecimalString(payload.valor, 2),
        },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return mapManutencaoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async listMultas(): Promise<Multa[]> {
    try {
      const response = await httpClient.get<MultaApiDTO[]>('/multas');
      return response.data.map(mapMultaDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createMulta(
    payload: Omit<Multa, 'id'>,
    idempotencyKey: string
  ): Promise<Multa> {
    try {
      const response = await httpClient.post<MultaApiDTO>(
        '/multas',
        {
          ait: payload.ait.trim(),
          veiculoId: payload.veiculoId,
          motivo: payload.motivo.trim(),
          identificado: Boolean(payload.identificado),
          motorista: payload.motorista.trim(),
          status: payload.status,
          data: assertValidIsoDate(payload.data),
          pontos: payload.pontos,
          valorOriginal:
            payload.valorOriginal !== undefined
              ? toDecimalString(payload.valorOriginal, 2)
              : null,
          valor: toDecimalString(payload.valor, 2),
        },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return mapMultaDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
`,

  // ==========================================================================
  // ISSUE FE-10 — DASHBOARD, ALERTAS E PERFORMANCE
  // ==========================================================================
  'src/services/dashboardService.ts': `
import type {
  DashboardResumoApiDTO,
  AlertaPreventivaApiDTO,
} from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';

export const dashboardService = {
  async getResumo(params?: {
    dataInicio?: string;
    dataFim?: string;
  }): Promise<DashboardResumoApiDTO> {
    try {
      const response = await httpClient.get<DashboardResumoApiDTO>(
        '/dashboard/resumo',
        { params }
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getAlertasPreventivas(): Promise<AlertaPreventivaApiDTO[]> {
    try {
      const response = await httpClient.get<AlertaPreventivaApiDTO[]>(
        '/dashboard/preventivas'
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
`,

  // ==========================================================================
  // ISSUE FE-11 — ONBOARDING POR ARQUIVOS E EXPORTAÇÃO CONTROLADA
  // ==========================================================================
  'src/services/onboardingService.ts': `
import {
  APP_VERSION,
  SCHEMA_VERSION,
  SYSTEM_EXPORT_NAME,
} from '@/config/constants';
import type {
  Abastecimento,
  EmpresaConfig,
  Manutencao,
  Multa,
  Pneu,
  Veiculo,
} from '@/types/frotawise';

const FORMULA_INJECTION_PREFIXES = ['=', '+', '-', '@', '\\t', '\\r'];

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (
    str.length > 0 &&
    FORMULA_INJECTION_PREFIXES.some((prefix) => str.startsWith(prefix))
  ) {
    return "'" + str;
  }
  return str;
}

export interface TenantExportSnapshot350 {
  tipoDocumento: 'EXPORTACAO_DADOS_TENANT_NAO_SUBSTITUI_BACKUP_POSTGRESQL';
  sistema: typeof SYSTEM_EXPORT_NAME;
  versao: typeof APP_VERSION;
  schema: typeof SCHEMA_VERSION;
  dataExportacao: string;
  company: EmpresaConfig;
  vehicles: Veiculo[];
  tires: Pneu[];
  maintenances: Manutencao[];
  fines: Multa[];
  fuelings: Abastecimento[];
}

export function buildTenantExportPayload(data: {
  company: EmpresaConfig;
  vehicles: Veiculo[];
  tires: Pneu[];
  maintenances: Manutencao[];
  fines: Multa[];
  fuelings: Abastecimento[];
}): TenantExportSnapshot350 {
  return {
    tipoDocumento: 'EXPORTACAO_DADOS_TENANT_NAO_SUBSTITUI_BACKUP_POSTGRESQL',
    sistema: SYSTEM_EXPORT_NAME,
    versao: APP_VERSION,
    schema: SCHEMA_VERSION,
    dataExportacao: new Date().toISOString(),
    company: data.company,
    vehicles: data.vehicles,
    tires: data.tires,
    maintenances: data.maintenances,
    fines: data.fines,
    fuelings: data.fuelings,
  };
}

export interface SnapshotValidationConflict {
  entidade: string;
  indice: number;
  campo: string;
  mensagem: string;
}

export function validateSnapshotDryRun(rawJson: unknown): {
  valido: boolean;
  versaoDetectada: string | null;
  conflitos: SnapshotValidationConflict[];
} {
  const conflitos: SnapshotValidationConflict[] = [];
  if (!rawJson || typeof rawJson !== 'object') {
    return {
      valido: false,
      versaoDetectada: null,
      conflitos: [
        {
          entidade: 'root',
          indice: 0,
          campo: 'json',
          mensagem: 'Arquivo de importação não é um objeto JSON válido.',
        },
      ],
    };
  }

  const obj = rawJson as Record<string, unknown>;
  const versaoDetectada =
    typeof obj.versao === 'string' ? obj.versao : 'legado-desconhecido';

  const vehicles = Array.isArray(obj.vehicles) ? obj.vehicles : [];
  const vehicleIds = new Set<string>();

  vehicles.forEach((v: Record<string, unknown>, idx: number) => {
    if (typeof v.id === 'string') vehicleIds.add(v.id);
    if (typeof v.eixos === 'number' && (v.eixos < 2 || v.eixos > 6)) {
      conflitos.push({
        entidade: 'vehicles',
        indice: idx,
        campo: 'eixos',
        mensagem:
          'Veículo com ' +
          String(v.eixos) +
          ' eixos fora do intervalo homologado (2..6).',
      });
    }
  });

  const fuelings = Array.isArray(obj.fuelings) ? obj.fuelings : [];
  fuelings.forEach((f: Record<string, unknown>, idx: number) => {
    if (typeof f.veiculoId !== 'string' || !vehicleIds.has(f.veiculoId)) {
      conflitos.push({
        entidade: 'fuelings',
        indice: idx,
        campo: 'veiculoId',
        mensagem: 'Abastecimento referencia veículo inexistente no lote.',
      });
    }
    if (typeof f.litros !== 'number' || f.litros <= 0) {
      conflitos.push({
        entidade: 'fuelings',
        indice: idx,
        campo: 'litros',
        mensagem: 'Litros devem ser maiores que zero.',
      });
    }
  });

  return {
    valido: conflitos.length === 0,
    versaoDetectada,
    conflitos,
  };
}
`,

  'src/components/onboarding/ValidationReport.tsx': `
'use client';

import React from 'react';
import type { SnapshotValidationConflict } from '@/services/onboardingService';

export interface ValidationReportProps {
  versaoDetectada: string | null;
  conflitos: SnapshotValidationConflict[];
}

export function ValidationReport({
  versaoDetectada,
  conflitos,
}: ValidationReportProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-semibold">
          Relatório de Pré-Validação (Dry-Run)
        </span>
        <span className="font-mono text-slate-400">
          Versão: {versaoDetectada ?? 'N/A'}
        </span>
      </div>
      {conflitos.length === 0 ? (
        <p className="mt-3 text-emerald-400">
          Nenhum conflito estrutural detectado. Pronto para submissão controlada.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-red-300">
          {conflitos.map((c, i) => (
            <li key={i}>
              [{c.entidade} #{c.indice} - {c.campo}]: {c.mensagem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,

  // ==========================================================================
  // ISSUE FE-12 — TESTES END-TO-END, HARDENING E HANDOFF PARA O BACKEND
  // ==========================================================================
  'docs/HANDOFF_BACKEND.md': `
# HANDOFF BACKEND — FrotaWise Frontend v1.2 (Snapshot 3.5.0)

## 1. Alinhamento Obrigatório Antes da Migration BE-02 (Backend v3.1)
O Snapshot Frontend 3.5.0 introduziu dois novos domínios que exigem adendo no Backend v3.1:
1. **Abastecimentos e Consumo (\`/abastecimento\`)**: Persistência de \`Diesel | Gasolina | Arla\`, litros, \`valorUnit\` (Decimal), \`valorTotal\` (Decimal calculado no servidor), \`km\` e \`fornecedor\`.
2. **Regras e Alertas de Manutenção Preventiva (\`/malha-pneus\`)**: Regras por \`(tenant_id, modelo, categoria, peca, km)\` e cálculo de alertas (\`sem | vencida | proxima | ok\`) quando \`restante <= 500 km\`.
3. **Novos campos em entidades existentes**:
   - \`Veiculo.kmBase?: number | null\` (marco inicial de implantação).
   - \`Manutencao.peca?: string | null\` (matching explícito com regra preventiva).
   - \`EmpresaConfig.regrasManutencao: RegraManutencaoPreventiva[]\`.

## 2. Matriz de Endpoints (Homologados vs. Propostos)
| Módulo | Método e Rota FastAPI | Status | Regras de Segurança e Domínio |
| :--- | :--- | :--- | :--- |
| Sessão | \`POST /v1/auth/login\`, \`POST /v1/auth/logout\`, \`GET /v1/auth/me\` | Homologado | Cookie HttpOnly no BFF; retorna \`capabilities\` RBAC. |
| Config / Malha | \`GET/PUT /v1/empresa/config\`, \`POST/DELETE /v1/empresa/malha\` | Homologado | Retorna 409 se tentar excluir regra em uso por pneus. |
| Regras Preventivas | \`GET/POST/PATCH/DELETE /v1/empresa/regras-manutencao\` | PROPOSTO | Unicidade normalizada por \`(tenant, modelo, categoria, peca)\`. |
| Veículos | \`GET/POST/PATCH /v1/veiculos\` | Homologado | Slots 2..6 eixos; bloqueia redução de eixo com pneu montado. |
| Pneus | \`GET/POST /v1/pneus\`, \`POST /v1/pneus/{id}/alocar|retirar\` | Homologado | Exige \`Idempotency-Key\`; proibido somar km duas vezes. |
| Abastecimentos | \`GET/POST/PATCH/DELETE /v1/abastecimentos\` | PROPOSTO | Exige \`Idempotency-Key\` no POST; ARLA fora da média km/l. |
| Financeiro | \`GET/POST /v1/manutencoes\`, \`GET/POST /v1/multas\` | Homologado | NIC calculada pelo backend; manutenção aceita \`peca?\`. |
| Dashboard | \`GET /v1/dashboard/resumo\`, \`GET /v1/dashboard/preventivas\` | PROPOSTO | Custos de combustível separados de manutenção. |
`,

  'src/app/error.tsx': `
'use client';

import React from 'react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full rounded-xl border border-red-500/30 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-red-400 mb-2">
          Falha ao processar operação
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          {error.message ||
            'Ocorreu um erro inesperado na comunicação com o servidor.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
`,

  'src/app/not-found.tsx': `
import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Página não encontrada (404)</h2>
        <p className="text-sm text-slate-400 mb-6">
          O recurso solicitado não existe ou você não possui permissão de visualização.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition"
        >
          Voltar ao Painel
        </Link>
      </div>
    </div>
  );
}
`,

  // ==========================================================================
  // SUÍTES DE TESTES (FE-01 A FE-12)
  // ==========================================================================
  'tests/config/env.test.ts': `
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
`,

  'tests/hygiene/imports-and-deadcode.test.ts': `
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
`,

  'tests/domain/snapshot-3.5.0-suite.test.ts': `
import { describe, it, expect } from 'vitest';
import {
  getVehicleChassisSlots,
  findOrphanedTiresOnAxleChange,
  computeFuelMedias,
  computePreventiveAlertsPreview,
} from '@/services/veiculosService';
import { validatePreventiveRuleInput } from '@/services/regrasPreventivasService';
import {
  sanitizeCsvCell,
  validateSnapshotDryRun,
} from '@/services/onboardingService';
import { mapPneuDtoToViewModel, mapPneuViewModelToDto } from '@/lib/mappers';

describe('Suíte Completa Snapshot 3.5.0 (Issues FE-02 a FE-12)', () => {
  it('FE-02: converte null <-> string vazia corretamente nos adaptadores de Pneu', () => {
    const vm = mapPneuDtoToViewModel({
      id: 'uuid-p1',
      fogo: 'F-001',
      marca: 'Michelin',
      medida: '295/80 R22.5',
      sulcoMm: 14,
      recapagens: 0,
      kmTotal: 10000,
      classificacao: 'Estocar',
      veiculoAtualId: null,
      posicaoAtual: null,
      localEstoque: 'Galpão A',
      tipoBanda: null,
    });
    expect(vm.veiculoAtualId).toBe('');
    expect(vm.posicaoAtual).toBe('');

    const backToDto = mapPneuViewModelToDto(vm);
    expect(backToDto.veiculoAtualId).toBeNull();
    expect(backToDto.posicaoAtual).toBeNull();
  });

  it('FE-06: valida regras de manutenção preventiva e bloqueia duplicidade normalizada', () => {
    const existing = [
      {
        id: 'r1',
        modelo: 'FH 540',
        categoria: 'Cavalo Mecânico',
        peca: 'Óleo Motor',
        km: 20000,
      },
    ];
    const duplicateErr = validatePreventiveRuleInput(
      {
        modelo: ' fh 540 ',
        categoria: 'cavalo mecânico',
        peca: 'ÓLEO MOTOR',
        km: 25000,
      },
      existing
    );
    expect(duplicateErr).toMatch(/Já existe uma regra preventiva/i);
  });

  it('FE-07: gera 10 slots de rodagem + ESTEPE-1 para veículo de 3 eixos e bloqueia redução com pneu montado', () => {
    const slots3Eixos = getVehicleChassisSlots(3);
    expect(slots3Eixos).toHaveLength(11);
    expect(slots3Eixos).toContain('E3-DE');
    expect(slots3Eixos).toContain('ESTEPE-1');

    const orfaos = findOrphanedTiresOnAxleChange('v1', 2, [
      {
        id: 'p1',
        fogo: '101',
        marca: 'Pirelli',
        medida: '295/80',
        sulcoMm: 10,
        recapagens: 0,
        kmTotal: 5000,
        classificacao: 'Rodando',
        veiculoAtualId: 'v1',
        posicaoAtual: 'E3-EE',
        localEstoque: '',
        historicoVeiculos: [],
      },
    ]);
    expect(orfaos).toHaveLength(1);
  });

  it('FE-09 & FE-10: calcula média km/l excluindo ARLA e alerta preventiva a <= 500 km do limite', () => {
    const medias = computeFuelMedias([
      {
        id: 'f1',
        veiculoId: 'v1',
        tipo: 'Diesel',
        data: '2026-10-01',
        litros: 200,
        valorUnit: 6,
        valorTotal: 1200,
        km: 10000,
        fornecedor: 'Posto A',
      },
      {
        id: 'f2',
        veiculoId: 'v1',
        tipo: 'Arla',
        data: '2026-10-02',
        litros: 20,
        valorUnit: 4,
        valorTotal: 80,
        km: 10200,
        fornecedor: 'Posto A',
      },
      {
        id: 'f3',
        veiculoId: 'v1',
        tipo: 'Diesel',
        data: '2026-10-05',
        litros: 250,
        valorUnit: 6,
        valorTotal: 1500,
        km: 10500,
        fornecedor: 'Posto B',
      },
    ]);

    expect(medias.f1).toBeNull();
    expect(medias.f2).toBeNull();
    expect(medias.f3).toBe(2);

    const alertas = computePreventiveAlertsPreview(
      [
        {
          id: 'v1',
          placa: 'ABC1D23',
          uf: 'SP',
          modelo: 'FH 540',
          categoria: 'Pesado',
          eixos: 3,
          kmAtual: 19600,
          kmBase: 0,
          status: 'Ativo',
        },
      ],
      [
        {
          id: 'r1',
          modelo: 'FH 540',
          categoria: 'Pesado',
          peca: 'Filtro Diesel',
          km: 10000,
        },
      ],
      [
        {
          id: 'm1',
          osNumero: 'OS-1',
          veiculoId: 'v1',
          tipo: 'Preventiva',
          categoria: 'Pesado',
          peca: 'Filtro Diesel',
          km: 10000,
          descricao: 'Troca',
          fornecedor: 'Oficina',
          data: '2026-10-01',
          valor: 500,
        },
      ]
    );

    expect(alertas).toHaveLength(1);
    expect(alertas[0].restante).toBe(400);
    expect(alertas[0].status).toBe('proxima');
  });

  it('FE-11: mitiga CSV Formula Injection e rejeita abastecimento órfão no dry-run de importação', () => {
    expect(sanitizeCsvCell('=CMD|"/C calc"!A0')).toBe("'=CMD|\"/C calc\"!A0");
    expect(sanitizeCsvCell('+SUM(A1:A10)')).toBe("'+SUM(A1:A10)");

    const report = validateSnapshotDryRun({
      versao: '3.5.0',
      vehicles: [{ id: 'v1', eixos: 3 }],
      fuelings: [{ id: 'f1', veiculoId: 'veiculo-inexistente', litros: 100 }],
    });
    expect(report.valido).toBe(false);
    expect(report.conflitos[0].campo).toBe('veiculoId');
  });
});
`,

  'tests/e2e/frotawise-3.5.0.spec.ts': `
import { test, expect } from '@playwright/test';

test.describe('FrotaWise Snapshot 3.5.0 — Segurança, Sessão e Rotas Protegidas (FE-03 / FE-12)', () => {
  test('redireciona acesso não autenticado em /abastecimento para /login sem vazar dados de tenant', async ({
    page,
  }) => {
    await page.goto('/abastecimento');
    await expect(page).toHaveURL(/\\/login/);
  });

  test('bloqueia mutação no BFF sem cookie HttpOnly e sem token CSRF', async ({
    request,
  }) => {
    const res = await request.post('/api/abastecimentos', {
      data: {
        veiculoId: 'v1',
        tipo: 'Diesel',
        data: '2026-10-28',
        litros: 100,
        valorUnit: '6.10',
        km: 50000,
        fornecedor: 'Posto Teste',
      },
    });
    expect([401, 403]).toContain(res.status());
  });
});
`,
};

console.log('====================================================================');
console.log('Aplicando atualizações das Issues FE-01 a FE-12 em: ' + PROJECT_ROOT);
console.log('====================================================================');

for (const [relPath, content] of Object.entries(FILES)) {
  writeProjectFile(relPath, content);
}

const ZIP_OUTPUT = path.join(PROJECT_ROOT, 'frotawise-frontend-3.5.0-completo.zip');
if (fs.existsSync(ZIP_OUTPUT)) {
  fs.unlinkSync(ZIP_OUTPUT);
}

console.log('\nGerando pacote ZIP completo...');
try {
  if (process.platform === 'win32') {
    const psCommand =
      'Get-ChildItem -Path "' +
      PROJECT_ROOT +
      '" -Exclude "node_modules",".next","frotawise-frontend-3.5.0-completo.zip","gerar-zip-frotawise.mjs" | Compress-Archive -DestinationPath "' +
      ZIP_OUTPUT +
      '" -Force';
    execSync('powershell -NoProfile -Command \'' + psCommand + '\'', {
      stdio: 'inherit',
    });
  } else {
    execSync(
      'zip -r "' +
        ZIP_OUTPUT +
        '" . -x "node_modules/*" ".next/*" "gerar-zip-frotawise.mjs"',
      { cwd: PROJECT_ROOT, stdio: 'inherit' }
    );
  }
  console.log('\n====================================================================');
  console.log('[CONCLUÍDO COM SUCESSO!]');
  console.log('ZIP gerado em: ' + ZIP_OUTPUT);
  console.log('Na primeira instalação, rode: npm install && npm run ci:check; depois, use npm ci');
  console.log('====================================================================');
} catch (error) {
  console.warn(
    '\n[AVISO] Todos os 44 arquivos foram atualizados na pasta com sucesso, mas houve falha ao invocar o compactador externo:',
    error.message
  );
}