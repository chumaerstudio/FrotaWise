#!/usr/bin/env node
/** Teste read-only de ponta a ponta da Vercel/BFF/Render/Supabase.
 *  Não transmite credenciais ao console e não cria registros.
 *  Uso: FRONTEND_URL=https://... E2E_EMAIL=... E2E_PASSWORD=... node scripts/live-smoke.mjs
 */
const base = process.env.FRONTEND_URL?.replace(/\/$/, '');
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
if (!base || !email || !password || !/^https:\/\//.test(base)) {
  console.error('Configure FRONTEND_URL=https://..., E2E_EMAIL e E2E_PASSWORD com uma conta de testes.');
  process.exit(2);
}
let passed = 0, failed = 0;
async function expectGet(endpoint, cookies) {
 const response = await fetch(`${base}/api${endpoint}`, {headers:{cookie:cookies}, redirect:'manual'});
 if (!response.ok) {failed++;console.error(`FALHA GET ${endpoint}: HTTP ${response.status}`);return null;}
 const ct = response.headers.get('content-type') || '';
 if (/json/.test(ct)) {
   const data = await response.json(); passed++; console.log(`OK GET ${endpoint}`);return data;
 }
 passed++;console.log(`OK GET ${endpoint} [binário]`);return true;
}
try {
 const login = await fetch(`${base}/api/auth/login`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 if (!login.ok) throw Error(`Login retornou HTTP ${login.status}`);
 const data = await login.json();
 if (!data.user?.id || !data.user?.tenantId || !data.user?.capabilities) throw Error('Contrato login incompatível');
 const setCookies = login.headers.getSetCookie();
 const auth = setCookies.find(s => s.startsWith('fw_session='))?.split(';')[0];
 const csrf = setCookies.find(s => s.startsWith('fw_csrf='))?.split(';')[0];
 if (!auth || !csrf) throw Error('Cookies HttpOnly/CSRF ausentes');
 const cookieHeader = `${auth}; ${csrf}`;
 const csrfToken = decodeURIComponent(csrf.slice('fw_csrf='.length));
 passed++;console.log('OK login, sessão HttpOnly e CSRF');
 const me = await expectGet('/auth/me',cookieHeader);
 if (me?.user?.tenantId !== data.user.tenantId) throw Error('Tenant mudou após login');
 const bootstrap = await expectGet('/bootstrap',cookieHeader);
 if (!bootstrap?.company || !Array.isArray(bootstrap.vehicles) || !Array.isArray(bootstrap.tires)) throw Error('Bootstrap inválido');
 const endpoints = [
  '/dashboard/resumo','/empresa/config','/veiculos','/pneus','/manutencoes','/multas',
  '/abastecimentos','/malha','/preventivas/regras','/onboarding/modelo-planilha',
 ];
 if (data.user.papel === 'ADMIN')endpoints.push('/usuarios','/onboarding/exportar-backup');
 for (const e of endpoints)await expectGet(e,cookieHeader);
 const logout = await fetch(`${base}/api/auth/logout`,{method:'POST',headers:{cookie:cookieHeader,'x-csrf-token':csrfToken,'Content-Type':'application/json'},body:'{}'});
 if (logout.ok){passed++;console.log('OK logout');}else{failed++;console.error(`FALHA logout: HTTP ${logout.status}`);}
 const revoked = await fetch(`${base}/api/auth/me`,{headers:{cookie:cookieHeader}});
 if (revoked.status === 401) {passed++;console.log('OK revogação de token');}
 else {failed++;console.error(`FALHA revogação: HTTP ${revoked.status}`);}
} catch(e) {failed++;console.error('FALHA E2E:',e.message);}
console.log(`\nE2E leitura: ${passed} sucesso(s), ${failed} falha(s)`);
process.exit(failed?1:0);
