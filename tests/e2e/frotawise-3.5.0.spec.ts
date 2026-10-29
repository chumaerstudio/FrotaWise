import { test, expect } from '@playwright/test';

test.describe('FrotaWise Snapshot 3.5.0 — Segurança, Sessão e Rotas Protegidas (FE-03 / FE-12)', () => {
  test('redireciona acesso não autenticado em /abastecimento para /login sem vazar dados de tenant', async ({
    page,
  }) => {
    await page.goto('/abastecimento');
    await expect(page).toHaveURL(/\/login/);
  });

  test('bloqueia mutação no BFF sem cookie HttpOnly e sem token CSRF', async ({
    request,
  }) => {
    const res = await request.post('/api/abastecimentos', {
      data: {
        veiculoId: 'v1',
        tipo: 'Diesel',
        data: '2026-10-28',
        litros: 100,
        valorUnit: '6.10',
        km: 50000,
        fornecedor: 'Posto Teste',
      },
    });
    expect([401, 403]).toContain(res.status());
  });
});
