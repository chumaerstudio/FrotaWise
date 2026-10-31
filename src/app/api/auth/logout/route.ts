import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/config/env';
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME, verifyCsrfForMutation } from '@/lib/server/auth';

export async function POST(request: Request) {
  if (!verifyCsrfForMutation(request).valid) return NextResponse.json({detail:'Token CSRF inválido'}, {status:403});
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
