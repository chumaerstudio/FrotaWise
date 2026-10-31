# FrotaWise Web — Enterprise Fleet & Tire Managements

Arquitetura Front-End corporativa de alta escalabilidade construída com **Next.js 14 (App Router)**, **TypeScript (Strict Mode)** e **Tailwind CSS**, projetada para transportadoras e operadores logísticos de grande porte.

## Requisitos e instalação

O projeto aceita Node.js `>=20.11.0 <25.0.0`, incluindo Node.js 24.x, e npm `>=10`. Na primeira instalação desta atualização, execute `npm install` para sincronizar o `package-lock.json` incluído no snapshot. Em instalações futuras, após salvar o lockfile sincronizado no projeto, `npm ci` pode ser usado para uma instalação limpa.

```powershell
node -v
npm -v
npm install --no-audit --no-fund
npm run dev
```

`npm ci` não atualiza o lockfile; ele falha quando as dependências declaradas e o lockfile estão fora de sincronia.

## Estrutura da Arquitetura

```text
frotawise-web/
├── src/
│   ├── app/                        # Rotas e Páginas (Next.js App Router)
│   │   ├── (auth)/                 # Grupo de rotas públicas
│   │   │   └── login/
│   │   │       └── page.tsx        # Tela de Login corporativo do FrotaWise
│   │   │
│   │   ├── (dashboard)/            # Grupo protegido (exige estar logado)
│   │   │   ├── layout.tsx          # Menu lateral fixo + Topo com nome da Transportadora
│   │   │   ├── page.tsx            # Painel Principal (Gráfico de pizza + Alertas de Remold)
│   │   │   ├── pneus/
│   │   │   │   └── page.tsx        # Estoque de pneus, alocação em veículo e botão Remoldar
│   │   │   ├── malha-pneus/
│   │   │   │   └── page.tsx        # Cadastro de marcas, aros e limites de KM por etapa
│   │   │   ├── veiculos/
│   │   │   │   └── page.tsx        # Cadastro da frota e visualização de pneus no caminhão
│   │   │   └── custos-multas/
│   │   │       └── page.tsx        # Aba de multas e histórico de reparos por KM
│   │
│   ├── components/                 # Componentes visuais reutilizáveis
│   │   ├── ui/                     # Botões, Modais, Tabelas, Inputs, Badges de Alerta
│   │   ├── charts/                 # Gráfico circular (Novos vs. Remold vs. Sucata)
│   │   └── forms/                  # Formulários (Ex: Modal de Retirada de Pneu do Veículo)
│   │
│   ├── services/                   # Comunicação com o Back-end (Onde o Mock vira Real)
│   │   ├── api.ts                  # Configuração do Axios/Fetch injetando o Token JWT
│   │   ├── pneusService.ts         # Funções: listarPneus(), alocarPneu(), enviarParaRemold()
│   │   └── veiculosService.ts      # Funções: listarVeiculos(), registrarManutencao()
│   │
│   ├── types/                      # Interfaces TypeScript (espelho dos schemas do Back-end)
│   │   └── frotawise.d.ts          # Tipos: Pneu, Veiculo, AlertaRemold, Multa
│   │
│   └── hooks/                      # Lógica de estado da tela (ex: useAuth, useEstoquePneus)
```

## Diferenciais para Empresas de Grande Porte (Enterprise-Grade)

1. **Multi-Tenant & RBAC Ready**: Cabeçalhos HTTP customizados (`X-Tenant-ID`) e interceptadores JWT configurados em `src/services/api.ts`.
2. **Tipagem Estrita (Zero `any`)**: Contratos de domínio centralizados em `src/types/frotawise.d.ts`, garantindo paridade com microsserviços do Back-end.
3. **Fallback Inteligente (Mock -> Produção)**: Camada de serviço preparada para operar com API real ou dados simulados resilientes para homologação.
4. **Cálculo de CPK (Custo por Quilômetro) e Ciclo de Vida**: Controle de 1ª Vida, 1º Remold, 2º Remold, Sucata e alertas preditivos baseados em sulco (mm) e odômetro.

## Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Executar ambiente de desenvolvimento
npm run dev

# 3. Validar tipagem TypeScript
npm run type-check
```

## Login em desenvolvimento (sem banco de dados)

O frontend não valida credenciais: quem autentica é o backend em `BACKEND_API_URL`.
Enquanto o backend real não existe, use o mock incluído:

```bash
cp .env.example .env.local     # NEXT_PUBLIC_APP_MODE=API, BACKEND_API_URL=http://127.0.0.1:8000/v1
npm run mock:api               # terminal 1 — sobe o mock em :8000
npm run dev                    # terminal 2
```

Credenciais padrão do mock: `gestao@ecofrota.com.br` / `frotawise123`
(sobrescreva com `MOCK_EMAIL` e `MOCK_PASSWORD`). Não use o mock em produção.

Alternativa sem login: `NEXT_PUBLIC_APP_MODE=DEMO` no `.env.local` (bloqueado em build de produção).
