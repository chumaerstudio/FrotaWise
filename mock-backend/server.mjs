// Mock do backend de identidade do FrotaWise — SOMENTE PARA DESENVOLVIMENTO.
// Implementa POST /v1/auth/login, POST /v1/auth/logout e GET /v1/auth/me
// (contrato em docs/contracts/openapi.yaml), sem banco de dados.
//
// Uso:   npm run mock:api
// Login: MOCK_EMAIL / MOCK_PASSWORD (defaults abaixo; sobrescreva via variáveis de ambiente)
import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.MOCK_PORT ?? 8000);
const MOCK_EMAIL = (process.env.MOCK_EMAIL ?? 'gestao@ecofrota.com.br').toLowerCase();
const MOCK_PASSWORD = process.env.MOCK_PASSWORD ?? 'frotawise123';

const user = {
  id: 'usr-mock-001',
  nome: 'Gestor Demo',
  email: MOCK_EMAIL,
  papel: 'ADMIN',
  tenantId: 'tenant-mock-001',
  nomeEmpresa: 'EcoFrota (mock)',
  capabilities: {
    canManageVehicles: true,
    canManageTires: true,
    canManageMalha: true,
    canManagePreventiveRules: true,
    canManageFuelings: true,
    canManageMaintenances: true,
    canManageFines: true,
    canImportData: true,
    canExportData: true,
  },
};

const sessions = new Set();

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

const readJson = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve(null);
      }
    });
  });

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

const bearer = (req) => (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');

http
  .createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'POST' && pathname === '/v1/auth/login') {
      const body = await readJson(req);
      if (!body) return send(res, 400, { title: 'JSON inválido', status: 400 });

      const emailOk = safeEqual(String(body.email ?? '').trim().toLowerCase(), MOCK_EMAIL);
      const passOk = safeEqual(body.password ?? '', MOCK_PASSWORD);
      if (!emailOk || !passOk) {
        return send(res, 401, {
          title: 'Falha na autenticação',
          status: 401,
          detail: 'Credenciais inválidas.',
        });
      }

      const accessToken = crypto.randomBytes(32).toString('hex');
      sessions.add(accessToken);
      return send(res, 200, { accessToken, user });
    }

    if (req.method === 'GET' && pathname === '/v1/auth/me') {
      if (!sessions.has(bearer(req))) {
        return send(res, 401, { title: 'Sessão inválida', status: 401, code: 'UNAUTHENTICATED' });
      }
      return send(res, 200, user);
    }

    if (req.method === 'POST' && pathname === '/v1/auth/logout') {
      sessions.delete(bearer(req));
      return send(res, 200, { loggedOut: true });
    }

    return send(res, 404, { title: 'Rota não implementada no mock', status: 404, path: pathname });
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log(`[mock-backend] http://127.0.0.1:${PORT}/v1`);
    console.log(`[mock-backend] login: ${MOCK_EMAIL} / ${MOCK_PASSWORD}`);
  });
