import { NextResponse } from 'next/server';
import { mapUserFromBackend } from '@/lib/server/user';
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
        usuario: {id: string; nome: string; email: string; role: string};
        empresa: {id: string; nomeEmpresa: string};
      };
      if (!data.accessToken || !data.usuario?.id || !data.empresa?.id) {
        return NextResponse.json({detail: 'Contrato de autenticação inválido'}, {status: 502});
      }
      const user = mapUserFromBackend({ ...data.usuario, empresaId: data.empresa.id, nomeEmpresa: data.empresa.nomeEmpresa });

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
        { user, csrfToken },
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
