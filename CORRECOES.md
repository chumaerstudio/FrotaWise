# FrotaWise — atualização de correções e compatibilidade Node.js 24

## O que foi corrigido

- Restauradas as coleções iniciais de veículos, manutenções, multas, empresa e pneus usadas pelo contexto principal.
- Adicionada normalização do `localStorage`: valores nulos, JSON inválido ou dados com o tipo errado passam a usar o estado inicial, em vez de quebrar a renderização.
- Corrigido o contrato de `getVehicleChassisSlots`, que agora retorna o mapa de eixos e estepe esperado pela tela de pneus.
- Mantida a média de consumo de combustível como valor numérico para o contrato dos serviços e adicionado um cálculo separado dos detalhes usados nos painéis.
- Restauradas exportações de compatibilidade utilizadas por telas e componentes existentes.
- Corrigidas incompatibilidades de tipos e uma expressão com erro de sintaxe em um teste.
- Definido `target: ES2020` no TypeScript para compatibilidade com iteração de `Map` e `Set`.
- Atualizado `engines.node` para aceitar Node.js 24 (`>=20.11.0 <25.0.0`) e ajustado o workflow de CI para Node 24.x.

## Primeira instalação no Node.js 24

O `package-lock.json` que veio do snapshot anterior não está sincronizado com `package.json`. Por isso, **não execute `npm ci` como primeiro comando**: ele falha por definição quando o lockfile está desatualizado. Rode `npm install` uma vez para sincronizar o lockfile; depois disso, `npm ci` poderá ser usado normalmente.

```powershell
node -v
npm -v
npm install --no-audit --no-fund
npm run type-check
npm test
npm run build
npm run dev
```

Requisitos declarados: Node.js `>=20.11.0 <25.0.0` e npm `>=10.0.0`. Node.js `v24.22.1` e npm `11.19.1` satisfazem essa faixa.

**Nota de validação:** o código e os arquivos de configuração foram revisados estaticamente. Não foi possível gerar um novo lockfile no ambiente de preparação, pois o acesso à registry do npm falhou por DNS/rede. Execute `npm install --no-audit --no-fund` no seu computador, com conexão à internet, antes de usar `npm ci` ou publicar a atualização.

**Atenção:** `gerar-zip-frotawise.mjs` é um gerador de snapshot que grava arquivos a partir de conteúdo embutido. Ele foi atualizado para não reverter a faixa de Node nem a versão usada no CI, mas não precisa ser executado para usar o projeto.
