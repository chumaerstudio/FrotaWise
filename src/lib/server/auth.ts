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
