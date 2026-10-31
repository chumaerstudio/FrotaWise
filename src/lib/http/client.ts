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

  instance.interceptors.request.use((config) => {
    // O cookie CSRF é legível pelo navegador, o JWT não.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) config.headers.set('Content-Type', undefined);
    if (typeof document !== 'undefined' && !['get', 'head', 'options'].includes((config.method || 'get').toLowerCase())) {
      const csrf = document.cookie.split('; ').find((x) => x.startsWith('fw_csrf='))?.split('=')[1];
      if (csrf) config.headers.set('x-csrf-token', decodeURIComponent(csrf));
    }
    return config;
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
