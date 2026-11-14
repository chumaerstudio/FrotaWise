# Integração FrotaWise 3.9 — frontend -> Render

Fonte: snapshot consolidado FrotaWise 3.9.0 de 13/11/2026 e backend 3.9.0 enviado no mesmo dia.

## Mudanças

- BFF Next.js aceita `viagens`, `custos-fixos` e `financeiro` sem expor o JWT HttpOnly.
- Em `NEXT_PUBLIC_APP_MODE=API`, o Zustand carrega bootstrap + 4 listas via GET. Se uma falhar, a interface mostra o erro, sem fallback DEMO.
- Viagens: POST, PATCH e DELETE, com campos camelCase e IDs gerados pelo servidor. Despesas automáticas de combustível não são enviadas como despesas manuais.
- Custos fixos: POST, PUT e DELETE, com autorização e pagamentos preservados pelo backend.
- Financeiro: conta e plano enviados separadamente; se o plano falhar após criar a conta, o formulário mantém o ID para corrigir sem nova conta.
- Baixa e estorno: PUT em `/financeiro/pagamentos`; estorno permanece restrito a ADMIN no servidor.
- Abastecimentos: `viagemId` enviado em criação/edição. O backend cuida da despesa vinculada.
- Multas NIC: seleção da multa de origem e vínculo enviados ao servidor.
- Limpeza de estado ao trocar de sessão e descarte de respostas de sessões anteriores.

## Aplicação

Na raiz do frontend, com Git limpo:

```powershell
git apply --check "$env:USERPROFILE\Downloads\FrotaWise_Frontend_3.9_Integracao.patch"
git apply "$env:USERPROFILE\Downloads\FrotaWise_Frontend_3.9_Integracao.patch"
git diff --check
npm ci
npm run type-check
npm run test
npm run build
```

Atenção: o patch foi criado sobre o snapshot consolidado de 13/11/2026; `git apply --check` detecta diferenças com a sua versão local.

## Configuração

No `.env.local` do frontend use (não versionar):

```dotenv
NEXT_PUBLIC_APP_MODE=API
NEXT_PUBLIC_BFF_BASE_PATH=/api
BACKEND_API_URL=https://frotawise-api.onrender.com/v1
BACKEND_TIMEOUT_MS=30000
```

Para desenvolvimento em local, `npm run dev`. Para produção, configurar essas mesmas variáveis no Vercel e refazer deploy. Variáveis `NEXT_PUBLIC_` são lidas durante build.

## Roteiro de homologação (em empresa de testes)

1. Entrar com ADMIN de uma empresa de testes e recarregar o navegador.
2. Criar uma viagem, recarregar e comprovar que reapareceu com UUID do servidor; editar e recarregar novamente.
3. Criar um abastecimento vinculado à viagem, validar despesa automática e verificar que não duplica no Financeiro.
4. Criar um custo fixo, conferir competências no Financeiro, editar e conferir persistência.
5. Criar conta a pagar parcelada; dar baixa em uma parcela, recarregar e ver a baixa persistida; testar estorno com ADMIN.
6. Criar NIC vinculada a uma multa original do mesmo veículo; testar rejeição de acesso de outra empresa.
7. Login com segunda empresa: viagens e custos da primeira não devem aparecer, nem ao usar IDs antigos.
8. LOGIN com OPERADOR e DIRETOR: verificar RBAC do backend, inclusive estornos e exclusões.
9. Testar rede offline: operação deve mostrar erro e não fingir persistência.

## Limitações conhecidas / itens de melhoria

- O pagamento de conta exige duas chamadas sequenciais ao backend (conta + plano). O frontend guarda o ID se a segunda falhar, mas ainda falta transação atômica em endpoint único para garantia plena.
- `GET /financeiro/resumo` não é consumido por este painel; totais são calculados das obrigações carregadas. Não devem ser apresentados como fluxo de caixa contábil.
- Ao dar baixa no plano financeiro de uma multa, a coluna de status da multa não muda automaticamente. São dois registros diferentes no backend.
- O backend restringe exclusão de viagem com abastecimentos vinculados e exclusão de custos/contas pagos.
- O frontend continua sujeito a conflitos com alterações posteriores ao snapshot. Não faça deploy sem `npm run type-check`, `npm run test` e `npm run build` no repositório atual.
- **Não garanta que qualquer erro restante seja do backend**: BFF, contrato, deploy, rede e UX também podem falhar.
