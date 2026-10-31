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
