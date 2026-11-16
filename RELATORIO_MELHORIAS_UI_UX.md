# FrotaWise — Relatório de melhorias de UI/UX

**Data:** 15/11/2026  
**Projeto de origem:** FrotaWise Frontend 3.9.0  
**Escopo:** experiência visual e interação do frontend. Nenhum backend, migração ou contrato de API foi alterado.

## O que foi implementado

### Feedback e confiabilidade

- Botão compartilhado (`Btn`) com spinner, indicador acessível de ocupação, bloqueio de repetição em callbacks assíncronos que retornam Promise e texto apropriado durante a operação.
- Ações de formulário compartilhadas (`FormActions`) vinculadas ao estado real das mutações da aplicação; o botão de salvar permanece indisponível até a conclusão da requisição.
- Contagem de mutações simultâneas no estado global, preservando o mecanismo preexistente de bloqueio por método/rota e o tratamento de idempotência.
- Notificações globais unificadas em um componente com modalidades sucesso, erro, atenção e informação; ícones, entrada e saída suaves, duração ampliada para erro, deduplicação, fechamento manual e anúncio acessível.
- Respostas HTTP transformadas em mensagens compreensíveis; detalhes técnicos de infraestrutura não são mostrados ao cliente. Validações de negócio úteis são preservadas.
- Skeleton de indicadores e lista no carregamento inicial, sem confundir falta de dados com consulta em andamento. Atualizações posteriores mostram um indicador discreto e preservam as informações já exibidas.
- Erro de carregamento com ação **Tentar novamente** e manutenção segura do estado anterior quando uma atualização falha.

### Navegação, responsividade e acessibilidade

- Menu lateral em dispositivos menores transformado em painel móvel retrátil, com fundo clicável, fechamento pela tecla Esc, foco inicial, retorno de foco, navegação por teclado e bloqueio da rolagem de fundo.
- Barra superior adaptada a larguras estreitas: título e identificação da empresa legíveis, atalhos acessíveis com rolagem localizada, sem alargar toda a página.
- Formulários em modais adaptados a uma coluna em telas estreitas; altura limitada à área útil, rolagem interna, ações de confirmação mais acessíveis e tratamento de foco pelo teclado.
- Tabelas mantidas integralmente, com rolagem horizontal localizada — inclusive no bloco de avisos financeiros — e sem ocultar ações de edição/exclusão.
- Estados de foco mais claros, transições discretas e suporte a `prefers-reduced-motion`.
- Melhor orientação para seleção de pneus por toque ou teclado, sem alterar a geometria do chassi ou o cálculo de quilometragem.

### Ajustes por módulo

| Área | Ajustes |
| --- | --- |
| Login | Botão com spinner e texto “Entrando…” enquanto a autenticação está em andamento |
| Dashboard e navegação | Menu móvel, carregamento inicial, indicador de atualização, erro recuperável e textos sem nomes de infraestrutura |
| Veículos | Edição e exclusão com indicador de processamento, confirmação de exclusão e botão “Salvar alterações” |
| Pneus e movimentações | Formulários de cadastro, edição e operações passam a mostrar o estado global de gravação; orientação de seleção por toque e teclado |
| Abastecimentos, manutenções, multas e NIC | Formulários e ações compartilhadas com feedback; mensagens de restrição de edição orientadas ao negócio |
| Viagens | Gravação compartilhada e exclusão com estado assíncrono; confirmações mais naturais |
| Financeiro e custos fixos | Estado de salvamento de conta; confirmação de baixas/estornos, exclusões com spinner e rolagem localizada das tabelas |
| Usuários | Spinner em criação/alteração de senha, notificações de sucesso/erro, skeleton, estado vazio e opção de tentar novamente |
| Configurações e malha | Botões de gravação com feedback, aviso de importação em andamento, mensagens de validação não técnicas |

### Arquivos modificados

- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/veiculos/page.tsx`
- `src/app/(dashboard)/pneus/page.tsx`
- `src/app/(dashboard)/viagens/page.tsx`
- `src/app/(dashboard)/financeiro/page.tsx`
- `src/app/(dashboard)/custos-multas/page.tsx`
- `src/app/(dashboard)/usuarios/page.tsx`
- `src/app/(dashboard)/malha-pneus/page.tsx`
- `src/app/error.tsx`
- `src/app/globals.css`
- `src/components/forms/GlobalModals.tsx`
- `src/components/ui/index.tsx`
- `src/components/ui/Toast.tsx`
- `src/hooks/useFrotaWiseStore.tsx`
- `src/lib/errors.ts`
- `src/services/operacional39Service.ts`

**Adicionados:** `tests/ui/friendly-error.test.ts` (4 verificações de tratamento de erros) e este relatório.

**Dependências:** nenhuma adicionada ou atualizada como parte deste trabalho.

## Testes e resultados

| Verificação | Resultado |
| --- | --- |
| `npm ci` | Concluído |
| `npm run type-check` | Aprovado |
| `npm run test` | 68 testes aprovados, 8 arquivos de testes |
| `npm run lint` | Sem erros; avisos preexistentes sobre `<img>`, alguns `any` e dependências de hooks |
| `npm run build` | Build de produção aprovado |

### Limitações e pendências de validação

- **Teste visual automatizado indisponível neste ambiente:** o navegador Chromium local foi impedido de abrir por uma restrição de execução (`socket() failed: Operation not permitted`). Não foi possível afirmar visualmente que todas as larguras de 360/390/768/1024/1280 px estão perfeitas.
- **Integração ponta a ponta não testada contra o backend real:** não foram criados ou excluídos registros em produção. Login, logout, permissões ADMIN/DIRETOR/OPERADOR, gravação de pneus, abastecimentos, multas, viagens e financeiro precisam de uma rodada de QA em homologação com dados de teste.
- **Acessibilidade:** foco e movimento reduzido receberam melhorias, mas não foi realizada auditoria completa por leitores de tela.
- **Projeção do chassi:** a lógica de posicionamento foi preservada. É necessário conferir o gesto de seleção em aparelhos reais com toque.

O resultado está pronto para revisão e testes em homologação; os critérios que dependem de verificação manual **não foram declarados como concluídos**.

## Como instalar e executar localmente

Requisitos: Node.js `>=20.11` e `<25`, npm `>=10`.

```bash
npm ci
npm run type-check
npm run test
npm run lint
npm run dev
```

O ambiente de produção usa modo `API`. Crie seu `.env.local` a partir do modelo `.env.example` e configure localmente as variáveis necessárias, **sem compartilhar credenciais**. A aplicação exige `BACKEND_API_URL` no servidor quando usada no modo API; o frontend usa rotas relativas para comunicar-se com o backend.

Para validar o pacote de distribuição:

```bash
npm run build
npm run start
```

## Publicação no Vercel

1. Faça o deploy primeiro em um ambiente de pré-produção, conectado ao backend e a uma empresa de testes.
2. Configure no projeto Vercel as variáveis de ambiente exigidas pelo seu ambiente, principalmente `NEXT_PUBLIC_APP_MODE=API` e `BACKEND_API_URL`. Nunca utilize variáveis `NEXT_PUBLIC_` para segredos.
3. Execute `npm ci`, testes e build; faça uma inspeção das páginas em desktop e celular.
4. Valide salvamento com retorno real, bloqueio de duplo clique, toasts de erro/sucesso, sessão expirada, permissões e atualização dos dados após recarregar.
5. Somente após validação, promova o mesmo commit para produção. Nenhum deploy ou push foi executado durante este trabalho.

## Conteúdo do ZIP

Frontend completo com fontes, assets, configurações, testes e documentação, **sem** `.env`, `.env.local`, histórico `.git`, `node_modules`, `.next`, caches de build ou credenciais.
