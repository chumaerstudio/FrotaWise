# Atualização baseada no arquivo TSX — 05/11/2026

## Resultado da integração

O arquivo `reference/ecofrota_sistema_de_gestao_logistica_1.tsx` foi incorporado ao projeto como cópia integral da versão enviada. A comparação confirmou que o projeto Next.js já estava na versão **3.9.0**, igual à versão declarada no TSX, e que as funcionalidades centrais do componente monolítico já estavam distribuídas na estrutura modular do FrotaWise.

Por isso, o componente monolítico não foi colocado por cima da aplicação Next.js: isso duplicaria a navegação e substituiria os fluxos de autenticação/API por uma implementação baseada diretamente em `localStorage`. A aplicação modular existente foi preservada, inclusive os recursos adicionais de usuários e operação em modo API.

## Mapa das funções do TSX na aplicação modular

| Área / função | Implementação no projeto |
|---|---|
| Estado global, persistência local, dados da frota, regras e alertas | `src/hooks/useFrotaWiseStore.tsx` |
| Cálculo de limites de pneus, recapagens e estilos de classificação | `src/services/pneusService.ts` |
| Layout de eixos/posições, médias de consumo, validação e sincronização do hodômetro | `src/services/veiculosService.ts` |
| Regras e avisos de manutenção preventiva | `src/services/regrasPreventivasService.ts` e `src/app/(dashboard)/malha-pneus/page.tsx` |
| Cadastro/edição de veículos, pneus, abastecimentos, manutenções e multas | `src/components/forms/GlobalModals.tsx` |
| Multa NIC e cálculo do valor adicional | `src/components/forms/GlobalModals.tsx` e `src/services/api.ts` |
| Contas a pagar, parcelas, vencimentos, baixas e estornos | `src/services/financeiroLocal.ts` e `src/app/(dashboard)/financeiro/page.tsx` |
| Painel, indicadores, gráficos e alertas | `src/app/(dashboard)/page.tsx` e `src/components/charts/` |
| Frota, pneus, abastecimento e despesas | `src/app/(dashboard)/veiculos/page.tsx`, `pneus/page.tsx`, `abastecimento/page.tsx` e `custos-multas/page.tsx` |
| Configurações, regras, backup e restauração | `src/app/(dashboard)/malha-pneus/page.tsx` |
| Navegação, tema e estrutura responsiva | `src/app/(dashboard)/layout.tsx` e `src/app/globals.css` |

## Funcionalidades conferidas no TSX

- Gestão da frota e visualização de veículos.
- Gestão de pneus, estoque, montagem no chassi, movimentação, recapagem, sucateamento e histórico.
- Regras de alertas por marca/modelo/medida e limites gerais de quilometragem.
- Manutenção preventiva por categoria e serviço, com avisos de vencimento/próxima revisão.
- Lançamentos de abastecimento, cálculo de km/l e validação cronológica do hodômetro.
- Sincronização do hodômetro do veículo com a quilometragem dos pneus montados.
- Manutenções e multas, incluindo identificação do condutor e cálculo NIC.
- Financeiro integrado, contas avulsas, parcelamento, vencimentos, baixas e reversão de baixa.
- Exportação/restauração de backup e opção de desfazer a última restauração no modo local.

## Observação operacional

O arquivo em `reference/` é uma referência integral e não é importado em runtime. A aplicação em execução continua usando os módulos listados acima, preservando autenticação, permissões, serviços e integração com API. Em modo API, as operações continuam sujeitas aos endpoints e às regras do backend.
