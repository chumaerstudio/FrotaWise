# FrotaWise — Recuperação dos conflitos de merge

## Diagnóstico

O arquivo RAR enviado apresentava **17 arquivos com marcas de conflito do Git** (`<<<<<<< HEAD`, `=======`, `>>>>>>> ...`). Essas marcas quebravam a sintaxe de TypeScript, TSX e até `.env.example` e impediam `npm run build`.

Cada seção `HEAD` dos 17 arquivos foi comparada com o ZIP de integração do FrotaWise 3.5.0 que já tinha sido preparado: as versões coincidiam **exatamente**. Restauramos esses 17 arquivos preservando o lado `HEAD`, que mantém as rotas corretas do backend FastAPI (`/preventivas/regras`, `/malha`, `/bootstrap` etc.) e o BFF de autenticação. Também restauramos duas pequenas alterações acidentais (espaço extra no import de `src/lib/http/client.ts` e typo no README).

## Verificações efetuadas neste ambiente

- **17/17 arquivos** restaurados e sem nenhum marcador de conflito restante.
- **55 arquivos TypeScript/TSX** analisados pelo parser TypeScript global: **nenhum erro de sintaxe**.
- **8 testes de contrato** executados com `node --test tests/integration/contract-live.test.cjs`: **8 passaram**.
- `package.json` e `package-lock.json` parseados como JSON válido.
- Scripts `.mjs` principais testados com `node --check`: sem erros de sintaxe.
- Todos os arquivos de código, desconsiderando somente finais de linha Windows, agora coincidem com a versão integrada de referência.

**Limitação importante:** o `npm ci` não pôde instalar todas as dependências neste ambiente porque o registro do npm não estava acessível (EAI_AGAIN / pacote sem cache). Por isso NÃO foi possível executar `npm run build`, `npm run type-check` ou os testes que precisam de dependências. Tampouco validamos o deploy real ou a integração autenticada com o Render. Nenhuma aprovação completa de produção é alegada.

## O que fazer no computador do seu amigo (PowerShell)

1. Faça backup da pasta atual antes de substituir os arquivos.
2. Se usar este **ZIP completo**, extraia para uma **nova pasta**, sem copiar `.git` antigo, e use o conteúdo da subpasta `FrotaWise` como projeto corrigido.
3. Se quiser manter a pasta atual e o histórico Git existente, extraia o **ZIP patch** na raiz do projeto, preservando os caminhos `src/...`; só serão sobrescritos os 17 arquivos em conflito, dois arquivos auxiliares corrigidos e este relatório.
4. Rode:

```powershell
npm install
npm run type-check
npm run build
npm run test:contracts
```

Se `npm run build` falhar, copie **a primeira mensagem de erro completa do terminal**. Não tente consertar escolhendo indiscriminadamente `Accept All Incoming` no VS Code.

Antes de subir para o GitHub, confira:

```powershell
git grep -n -e '<<<<<<<' -e '>>>>>>>'
git status
git add -A
git commit -m "Corrige conflitos do merge do frontend"
git push
```

O comando `git grep` não deve encontrar conflitos. O arquivo `.env.local` e segredos não devem ser enviados.

## Observações

- O arquivo `.env.example` aponta para `https://frotawise-api.onrender.com/v1`; o ambiente de Vercel também deve ter `BACKEND_API_URL` definido.
- Este reparo corrige o merge quebrado; não representa uma homologação funcional de todas as telas e rotas.
- Não use `npm audit fix --force` sem revisar as atualizações de dependências.
