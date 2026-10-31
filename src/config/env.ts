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
