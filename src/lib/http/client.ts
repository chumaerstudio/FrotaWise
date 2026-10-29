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
