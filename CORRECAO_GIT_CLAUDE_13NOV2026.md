# FrotaWise 3.9.0 — Consolidação das versões, 13/11/2026

## Resultado da comparação
Os arquivos do projeto nos ZIPs `FrotaWiseAtualGithub.zip` e `SISTEMAFinalClaude.zip` eram idênticos (104 arquivos comparáveis, excluindo `.git` e `.env.local`). Os dois incluíam marcadores de conflitos de merge em seis arquivos.

## Alterações realizadas
- Removidos todos os marcadores de conflito de Git dos seis arquivos.
- Mantido o módulo novo de custos fixos por veículo (incluindo dados, estado, interface e testes).
- Mantidas verificações de ID nulo na edição/cancelamento de movimentações de pneus.
- Preservada a visualização realista do chassi e suas imagens em `public/chassi/` (2 a 6 eixos).
- Mantida a autenticação pela API/BFF, sem alterar os endpoints do Render/Supabase.
- Arquivos `.git`, `.env.local`, `node_modules` e arquivos temporários excluídos do pacote.

## Atenção às diferenças entre as capturas
A prévia do Claude mostra o modo de demonstração com registros locais de exemplo. A captura da Vercel está autenticada na empresa real de teste B e consulta o Supabase; os dados não serão iguais. O chassi desenhado diferente pode indicar que a Vercel está exibindo o último deploy bem-sucedido após uma falha na atualização. Confirme o commit em Vercel > Deployments após publicar o pacote corrigido.

## Limitações reais
O novo módulo de custos fixos por veículo funciona no modo DEMO/offline, mas o FastAPI atual não possui rotas para custos fixos; no modo API o próprio frontend sinaliza a indisponibilidade. Viagens/financeiro também possuem armazenamento local em partes; não considere esses dados persistidos no Supabase sem extensão do backend.

## Validações nesta análise
- 68 arquivos .ts/.tsx analisados pelo parser TypeScript sem erro de sintaxe.
- 191 imports internos conferidos quanto à existência dos arquivos.
- 8 testes de lógica executados com sucesso: competência, vencimento, validação e total de custos fixos; integração cálculo financeiro; arquivos de chassi e layout Bitruck; pacote sem segredos locais.
- Nenhum marcador de merge permanece no código e testes.
- **Build Next.js, TypeScript semântico, lint e execução Vercel NÃO realizados com sucesso neste ambiente**: o npm não conseguiu concluir a instalação das dependências por limitação de rede. Execute `npm ci && npm run ci:check` no computador antes do push.

## Caminho seguro para subir
1. Faça backup do repositório local e das alterações não commitadas.
2. Em uma pasta NOVA, clone o repositório GitHub. Não copie pastas `.git` entre máquinas.
3. Extraia o conteúdo da pasta `FrotaWise/` deste ZIP na raiz do clone, substituindo os arquivos do projeto.
4. Verifique que `package.json`, `src/` e `public/` estejam na mesma raiz. NÃO deve existir `FrotaWise/FrotaWise/src`.
5. Confirme no `.gitignore` que `.env.local` não será versionado. Crie `.env.local` apenas para testes locais, usando os quatro valores configurados na Vercel.
6. Execute no PowerShell:

    npm ci
    npm run type-check
    npm run lint
    npm run test
    npm run test:contracts
    npm run build

7. Se **TODOS** passarem, execute:

    git status
    git add -A
    git diff --cached --check
    git commit -m "Resolve conflitos e consolida frontend FrotaWise 3.9.0"
    git push origin main

8. Na Vercel verifique variáveis de ambiente (Production):

    NEXT_PUBLIC_APP_MODE=API
    NEXT_PUBLIC_BFF_BASE_PATH=/api
    BACKEND_API_URL=https://frotawise-api.onrender.com/v1
    BACKEND_TIMEOUT_MS=30000

9. Verifique o **commit SHA do novo deploy** e seu status Ready. Se falhar, abra os logs, pois o domínio de produção continua apontando para o deployment anterior.
10. Para testar o chassi realista carregue a URL `/chassi/chassi-3-eixos.webp` na mesma origem e confira que a imagem existe. Entre com Empresa A para os pneus de teste já criados, ou cadastre novos pneus na Empresa B; a prévia do Claude usava dados locais fictícios.

Este pacote é para homologação e não foi validado como pronto para clientes reais.
