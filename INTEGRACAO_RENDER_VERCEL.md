# FrotaWise 3.5.0 — integração real (homologação)

**Destino:** FastAPI em `https://frotawise-api.onrender.com/v1`, PostgreSQL Supabase; Next.js hospedado na Vercel. O frontend é um BFF same-origin, não fala diretamente com o PostgreSQL.

## Publicação

1. Envie **a pasta `FrotaWise-main`** deste ZIP ao repositório GitHub privado do frontend, mantendo `package.json` na raiz do repositório.
2. Na Vercel importe o repositório como **Next.js**, root directory `./`.
3. Configure `NEXT_PUBLIC_APP_MODE=API`, `NEXT_PUBLIC_BFF_BASE_PATH=/api`, `BACKEND_API_URL=https://frotawise-api.onrender.com/v1`, `BACKEND_TIMEOUT_MS=30000`.
4. Faça deploy e acesse `/login`. Entre com uma conta de testes criada no Supabase via script de provisionamento; não use dados reais de clientes ainda.
5. Depois de publicar, execute `npm run test:live` definindo `FRONTEND_URL`, `E2E_EMAIL`, `E2E_PASSWORD` para uma conta de testes. Esse teste lê os endpoints e exercita login/logout sem gravar dados operacionais.

**Nunca colocar** `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET_KEY`, senhas ou tokens em `NEXT_PUBLIC_*` ou no repositório.

## Integração feita

- **Autenticação:** BFF POST `/api/auth/login`, GET `/api/auth/me`, POST `/api/auth/logout`; sessão JWT fica em cookie `HttpOnly`; CSRF via cookie separado e cabeçalho em operações de escrita. Mapeia `usuario` + `empresa` reais da API para o modelo de usuário da interface.
- **Leitura central:** GET `/api/bootstrap` carrega empresa, veículos, pneus e históricos, manutenções, multas, abastecimentos, alertas de pneus e preventivas; em modo API nenhum registro DEMO é carregado ou salvo no `localStorage`.
- **Veículos:** POST/PATCH/DELETE e leitura; na página de veículos foi adicionada edição/exclusão real. Atualização administrativa não altera KM automaticamente.
- **Pneus:** POST/PATCH/DELETE, POST `/operacao` (montar, retirar para estoque, enviar para recapagem, sucatear, adicionar KM) com chave idempotente, POST `/concluir-recapagem`, incluindo sincronização por recarga de bootstrap.
- **Custos:** POST/PATCH/DELETE manutenções, abastecimentos e multas; as edições respeitam **campos imutáveis** da API. Para multas, o backend só permite PATCH de status. Cada POST de custos usa `Idempotency-Key` aleatória e proteção de duplo clique.
- **Configuração:** PUT `/empresa/config`; gestão da malha POST/PUT/DELETE `/malha`; preventivas POST/PUT/DELETE `/preventivas/regras`.
- **Contas:** página `/usuarios` para ADMIN com criação, perfis, ativar/desativar, reset de senha; mudança da própria senha pelo endpoint `/auth/change-password`.
- **Onboarding:** download de modelo XLSX, upload CSV/XLSX no servidor, exportação JSON do tenant pelo backend. Restauração JSON direta foi desativada em modo API para impedir falsa gravação local.
- **Permissões:** RBAC do backend é autoridade final; a UI pode exibir botões que o backend corretamente rejeita com `403` para papéis sem acesso.

## Resultado da validação executada neste ambiente

- Backend: `pytest -q tests/test_business.py tests/test_contracts.py` — **18 passed** (teste sem banco vivo).
- Contratos do frontend: `node --test tests/integration/contract-live.test.cjs` — **8 passed**, verificando **47 métodos** referenciados contra o OpenAPI exportado do FastAPI, mapeamento de usuário, segurança BFF e ausência de fallback DEMO em modo API.
- TypeScript/TSX: **50 arquivos analisados, zero erros sintáticos** pelo parser do TypeScript.
- Validação Pydantic offline: **13 exemplos de payloads validados** contra os schemas do backend (sem gravar dados).
- **Não realizados:** `npm run type-check`, `npm run lint`, `npm run build` e Playwright: `npm ci` não pôde concluir, pois faltam pacotes no cache e há limitação de rede no ambiente de execução. O arquivo de CI do GitHub está configurado para rodá-los em ambiente com acesso ao npm.
- **Não realizados:** login real e gravações autenticadas no Render/Supabase desta instância. Não temos as credenciais do usuário, e seria inadequado inventar testes. `npm run test:live` permite executar o smoke test de leitura depois da publicação na Vercel.

## Limitações reais / pendências para produção

- Ainda é homologação, **não operação para clientes reais**. Há pendências no backend de rate limit de login, rotação de credenciais expostas anteriormente, proxy confiável, backup operacional, observabilidade, testes de concorrência e RLS abrangente.
- Correção de hodômetro retroativo e mudança de veículo/data em lançamentos financeiros exigem procedimento administrativo, não edição direta: o frontend agora não finge conseguir essas alterações.
- O multiplicador NIC no backend é provisório e deve receber validação jurídica antes de cobranças reais.
- Logout revoga sessão única; o `test:live` desloga a conta de teste ao terminar.
- Se uma alteração retornar erro ou timeout, recarregue os dados antes de reenviar para evitar duplicações: não assuma que a gravação foi revertida.
- Não reenvie o antigo ZIP inicial nem misture arquivos de versões diferentes; este projeto substitui a integração inicial.
