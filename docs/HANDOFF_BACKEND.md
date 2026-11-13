# HANDOFF BACKEND — FrotaWise Frontend v1.2 (Snapshot 3.5.0)

## 1. Alinhamento Obrigatório Antes da Migration BE-02 (Backend v3.1)
O Snapshot Frontend 3.5.0 introduziu dois novos domínios que exigem adendo no Backend v3.1:
1. **Abastecimentos e Consumo (`/abastecimento`)**: Persistência de `Diesel | Gasolina | Arla`, litros, `valorUnit` (Decimal), `valorTotal` (Decimal calculado no servidor), `km` e `fornecedor`.
2. **Regras e Alertas de Manutenção Preventiva (`/malha-pneus`)**: Regras por `(tenant_id, modelo, categoria, peca, km)` e cálculo de alertas (`sem | vencida | proxima | ok`) quando `restante <= 500 km`.
3. **Novos campos em entidades existentes**:
   - `Veiculo.kmBase?: number | null` (marco inicial de implantação).
   - `Manutencao.peca?: string | null` (matching explícito com regra preventiva).
   - `EmpresaConfig.regrasManutencao: RegraManutencaoPreventiva[]`.

## 2. Matriz de Endpoints (Homologados vs. Propostos)
| Módulo | Método e Rota FastAPI | Status | Regras de Segurança e Domínio |
| :--- | :--- | :--- | :--- |
| Sessão | `POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/auth/me` | Homologado | Cookie HttpOnly no BFF; retorna `capabilities` RBAC. |
| Config / Malha | `GET/PUT /v1/empresa/config`, `POST/DELETE /v1/empresa/malha` | Homologado | Retorna 409 se tentar excluir regra em uso por pneus. |
| Regras Preventivas | `GET/POST/PATCH/DELETE /v1/empresa/regras-manutencao` | PROPOSTO | Unicidade normalizada por `(tenant, modelo, categoria, peca)`. |
| Veículos | `GET/POST/PATCH /v1/veiculos` | Homologado | Slots 2..6 eixos; bloqueia redução de eixo com pneu montado. |
| Pneus | `GET/POST /v1/pneus`, `POST /v1/pneus/{id}/alocar|retirar` | Homologado | Exige `Idempotency-Key`; proibido somar km duas vezes. |
| Abastecimentos | `GET/POST/PATCH/DELETE /v1/abastecimentos` | PROPOSTO | Exige `Idempotency-Key` no POST; ARLA fora da média km/l. |
| Financeiro | `GET/POST /v1/manutencoes`, `GET/POST /v1/multas` | Homologado | NIC calculada pelo backend; manutenção aceita `peca?`. |
| Dashboard | `GET /v1/dashboard/resumo`, `GET /v1/dashboard/preventivas` | PROPOSTO | Custos de combustível separados de manutenção. |

---

## Adendo — KM, viagens, NIC (ver `docs/ATUALIZACAO-KM-VIAGENS-MULTAS.md`)

Campos/tabelas que o backend precisa suportar para liberar no modo API: `pneus_historico` (`tipo`, `km_inicial`, `km_final`, `km_veiculo`, `cancelada`), `abastecimentos.viagem_id` (opcional), tabelas de viagens/itens/despesas (despesa de abastecimento com `abastecimento_id` único) e `multas` (`codigo` único gerado no servidor, `tipo_lancamento`, `multa_origem_id`). Regra de KM do pneu: `kmRodados = km_final - km_inicial`, com `km_inicial` = último KM do pneu; o hodômetro do veículo não é somado aos pneus.
<<<<<<< HEAD
=======

Adendo 2: `custos_fixos` (veiculo_id, categoria, descricao, valor_mensal, dia_vencimento, inicio, fim, ativo) com competências mensais no financeiro (origem `custoFixo`, id `custoId:AAAA-MM`); posições do Bitruck (4 eixos): `E1-ESQ/DIR` e `E2-ESQ/DIR` (simples), `E3/E4-EE/EI/DI/DE` (duplos).
>>>>>>> 94e87f8 (Novas atualizações)
