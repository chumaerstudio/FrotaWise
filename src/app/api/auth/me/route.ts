import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { mapUserFromBackend } from '@/lib/server/user';
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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

<<<<<<< HEAD
      const user = mapUserFromBackend(await response.json());
=======
      const user = await response.json();
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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
