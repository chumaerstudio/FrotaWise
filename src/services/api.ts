import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frotawise.com.br/v1';
const DEFAULT_TENANT = process.env.NEXT_PUBLIC_TENANT_DEFAULT || 'TRANS-LOG-BR';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de Requisição: Injeta Token JWT e Identificador Multi-Tenant da Transportadora
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@FrotaWise:jwt_token');
      const tenantId = localStorage.getItem('@FrotaWise:tenant_id') || DEFAULT_TENANT;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.headers) {
        config.headers['X-Tenant-ID'] = tenantId;
        config.headers['X-Client-Platform'] = 'FROTAWISE-WEB-ENTERPRISE';
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: Tratamento corporativo de expiração de sessão (401) e auditoria de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('@FrotaWise:jwt_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
