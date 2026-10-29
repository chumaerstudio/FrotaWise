# Matriz de Rastreabilidade — Snapshot 3.5.0 (Issue FE-02)

| Tela / Rota | Componente / Hook | Servico Frontend | DTO / Schema | Endpoint FastAPI | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| /login | useAuth.ts | /api/auth/* (BFF) | AuthenticatedUserDTO | /v1/auth/login, /v1/auth/me | Pronto |
| /abastecimento | abastecimento/page.tsx | abastecimentosService.ts | AbastecimentoApiDTO | /v1/abastecimentos | PROPOSTO |
| /malha-pneus | malha-pneus/page.tsx | malhaService.ts / regrasPreventivasService.ts | RegraModeloPneu / RegraManutencaoPreventiva | /v1/empresa/malha / /v1/empresa/regras-manutencao | PROPOSTO (Preventivas) |
| /veiculos | veiculos/page.tsx | veiculosService.ts | VeiculoApiDTO | /v1/veiculos | Pronto |
| /pneus | pneus/page.tsx, RetiradaPneuModal.tsx | pneusService.ts | PneuApiDTO | /v1/pneus/* | Pronto |
| /custos-multas | custos-multas/page.tsx | financeiroService.ts | ManutencaoApiDTO, MultaApiDTO | /v1/manutencoes, /v1/multas | Pronto |
| / (Dashboard) | (dashboard)/page.tsx | dashboardService.ts | DashboardResumoApiDTO | /v1/dashboard/resumo | PROPOSTO (fuelStats) |
