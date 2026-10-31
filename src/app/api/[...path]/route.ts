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
<<<<<<< HEAD
  'bootstrap',
  'onboarding',
  'preventivas',
  'malha',
  'usuarios',
  'exportar-backup',
  'modelo-planilha',
  'importar-planilha',
=======
  'onboarding',
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
]);

function isAllowedProxyPath(segments: string[]): boolean {
  if (segments.length === 0) return false;
  for (const seg of segments) {
    if (
      seg === '..' ||
      seg === '.' ||
      seg.includes('\\') ||
      seg.toLowerCase().includes('%2e')
    ) {
      return false;
    }
  }
<<<<<<< HEAD
  if (segments[0] === 'auth') return segments.length === 2 && segments[1] === 'change-password';
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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

<<<<<<< HEAD
  let bodyString: BodyInit | undefined;
  if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.startsWith('multipart/form-data')) {
      // A propriedade empresaId nunca vem de upload; o servidor deduz o tenant do JWT.
      const form = await request.formData();
      bodyString = form;
    } else {
      upstreamHeaders['Content-Type'] = 'application/json';
      const rawText = await request.text();
=======
  let bodyString: string | undefined;
  if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
    upstreamHeaders['Content-Type'] = 'application/json';
    const rawText = await request.text();
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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
<<<<<<< HEAD
    }
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: bodyString,
      cache: 'no-store',
      signal: AbortSignal.timeout(env.backendTimeoutMs),
    });

<<<<<<< HEAD
    // 204/205 não admitem body, mesmo string vazia.
    const responseBody = upstreamResponse.status === 204 || upstreamResponse.status === 205
      ? null : await upstreamResponse.arrayBuffer();
    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') ?? 'application/json',
        'Content-Disposition': upstreamResponse.headers.get('content-disposition') ?? 'inline',
=======
    const responseText = await upstreamResponse.text();
    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type':
          upstreamResponse.headers.get('content-type') ?? 'application/json',
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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
<<<<<<< HEAD
          'O serviço operacional não respondeu a tempo. Consulte o estado atual antes de tentar reenviar a operação, para evitar duplicação.',
=======
          'O serviço operacional não respondeu a tempo. Nenhuma alteração foi persistida.',
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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
