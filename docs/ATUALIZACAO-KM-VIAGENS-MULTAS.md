# Atualização — KM, pneus, abastecimento × viagens, manutenções e multas (NIC)

Versão do sistema mantida em 3.9.0 (um teste de higiene exige esse valor).

## O que mudou

### Pneus (`pneuKmService.ts`, `GlobalModals.tsx`, `pneus/page.tsx`)
- **KM da movimentação = KM final − KM inicial.** O KM inicial é preenchido sozinho com o último KM rodado do pneu (`kmTotal`) e aparece somente leitura.
- O KM acumulado do pneu só muda por movimentações individuais gravadas no histórico do pneu (Troca/Mount, Estocar, Recapar, Sucatear, Lançar KM), em qualquer posição — **inclusive estepe**.
- **Estepe:** o repasse automático do hodômetro do veículo aos pneus (que pulava o `ESTEPE-1`) foi removido; o KM do pneu agora vem só da movimentação.
- Cada movimentação tem `id` (chave de idempotência): reenviar a mesma movimentação não soma KM de novo.
- **Editar / cancelar:** só a **última** movimentação válida do pneu, pelo Histórico. Editar ajusta por diferença; cancelar estorna o KM e mantém o registro marcado como cancelado.
- Edição manual do KM acumulado no cadastro do pneu vira um lançamento `Ajuste` no histórico (a soma continua batendo).
- Campo opcional **KM do veículo (hodômetro)** na movimentação: é uma leitura absoluta que atualiza o veículo (só para cima) e nunca é somada ao pneu.
- **Cores de status:** fonte única em `statusTones.ts` (Rodando=verde, Estocar=azul, Recapar=âmbar, Sucatear=vermelho; multas e veículos também). O modal de histórico passou a ler o pneu atual do estado, não um instantâneo antigo.

### KM do veículo (`veiculosService.ts`)
- Hodômetro = maior leitura entre cadastro, abastecimentos, manutenções, viagens (KM inicial/final) e movimentações de pneu com KM do veículo. Leituras nunca são somadas. Multas não entram.

### Manutenções
- "Pneus / Recapagem" saiu das opções de **novos** lançamentos (e a criação é bloqueada também no código). Registros históricos continuam listados e editáveis (a opção reaparece só ao editar um deles).
- Filtro por placa (aceita trecho, com ou sem hífen).

### Abastecimento
- Vínculo **opcional** com viagem. Sem viagem salva normalmente.
- Com viagem: gera a despesa de abastecimento na viagem (id determinístico por abastecimento → sem duplicar). Editar atualiza o valor; trocar de viagem move; excluir ou remover o vínculo apaga só a despesa gerada. Despesas manuais nunca são tocadas.
- **Referência de KM** trocada de manutenção para viagens: com viagem, o KM precisa estar entre o KM inicial e o final dela; sem viagem, vale o KM final/inicial das viagens do veículo em outras datas e o hodômetro atual. As demais validações (sequência de abastecimentos por data) ficaram como estavam.
- Filtro por mês com resumo do período (litros, gasto, km/l, Média de Km).
- **Média de Km** = KM do abastecimento − KM do abastecimento anterior do mesmo veículo. Primeiro abastecimento → "—". KM menor que o anterior → "—" com aviso "KM divergente" (nunca negativo).

### Multas
- Filtro por placa.
- Cada lançamento recebe um **ID único gerado pelo sistema** (`MUL-AAAA-0001`), exibido na lista e nos Detalhes. Multas antigas recebem ID automaticamente na leitura, sem alterar outros dados.
- **NIC como lançamento próprio** vinculado à multa original por `multaOrigemId`. Busca da original por ID, AIT, placa ou infração. Os Detalhes mostram as NICs da original (e a original na NIC). Multa original com NIC vinculada **não pode ser excluída**.
- O mecanismo antigo de "motorista não identificado" (NIC calculada no mesmo registro) foi mantido.

### Viagens (módulo novo, mínimo)
O projeto enviado **não tinha módulo de Viagens**. Foi criado o mínimo necessário para sustentar a integração: nº, veículo, data, origem/destino, KM inicial/final, itens e valores, despesas (manuais + de abastecimento). Os dados ficam no armazenamento local (modo DEMO), junto dos demais módulos, e entram no backup JSON.

## Arquivos
Modificados: `abastecimento/page.tsx`, `custos-multas/page.tsx`, `layout.tsx`, `malha-pneus/page.tsx`, `(dashboard)/page.tsx`, `pneus/page.tsx`, `GlobalModals.tsx`, `ui/index.tsx` (+`PlateFilter`), `config/constants.ts`, `useFrotaWiseStore.tsx`, `veiculosService.ts`, `types/frotawise.d.ts`.
Novos: `viagens/page.tsx`, `pneuKmService.ts`, `viagensService.ts`, `multasService.ts`, `statusTones.ts`, `tests/domain/quilometragem-integracao.test.ts`.

## Banco de dados / migrações
Este repositório é só o frontend: no modo DEMO os dados ficam no `localStorage` e a normalização é feita na leitura (campos novos ausentes viram valores padrão; nada é apagado). **Não há banco nem migrações neste projeto.** Para o modo API, o backend precisa de:

| Tabela | Alteração |
|---|---|
| `pneus_historico` | `tipo`, `km_inicial`, `km_final`, `km_veiculo` (nullable), `cancelada`, `cancelada_em` |
| `abastecimentos` | `viagem_id` (nullable, FK) |
| `viagens` | tabela nova (nº único, veículo, data, KM inicial/final, origem, destino, obs) |
| `viagem_itens`, `viagem_despesas` | tabelas novas; despesa com `origem` ('manual'/'abastecimento') e `abastecimento_id` **único** |
| `multas` | `codigo` (único, gerado no servidor), `tipo_lancamento` ('MULTA'/'NIC'), `multa_origem_id` (FK nullable) |

Backfill sugerido: `codigo` das multas existentes por ordem de data; `tipo_lancamento='MULTA'`.

No modo API a tela mantém o comportamento anterior (não envia campos novos): Viagens exibe aviso de indisponibilidade, o seletor de viagem e o vínculo de NIC ficam ocultos. A movimentação de pneu continua enviando `kmRodados`, agora calculado como KM final − KM inicial.

## Decisões a confirmar
1. O hodômetro do veículo **não** é mais repassado aos pneus montados (era a regra antiga). Pneus só acumulam KM por movimentação.
2. Arla fica fora da sequência da Média de Km (igual à média km/l).
3. Editar/cancelar movimentação de pneu: só a última; o cancelamento estorna o KM mas **não** desfaz a posição/local do pneu.
4. Os dois anexos de imagem citados no pedido não vieram junto; a lógica foi seguida pelo texto.
<<<<<<< HEAD
=======

---

# Atualização 2 — chassi realista, Custo Fixo por Veículo e Bitruck

## Chassi realista com pneus coloridos
- A tela **Pneus e estoque → Movimentação no chassi** passou a usar a imagem do chassi em vista superior (frente à esquerda). Os pneus são desenhados por cima e usam a cor do status: **Novo, 1ª, 2ª, 3ª e Mais Recapagens** (mesma legenda e mesmas cores de antes, via `getTireRecapStyle`). Arrastar, soltar, selecionar e vagas continuam iguais; o estepe fica atrás do chassi.
- Como a foto é de um caminhão de 2 eixos, as imagens para **2 a 6 eixos** foram geradas a partir dela (pneus pretos removidos, eixos prolongados, trechos de trilho/cardã repetidos). Ficam em `public/chassi/chassi-N-eixos.webp`; o mapa de posições dos eixos está em `src/services/chassisAssets.ts` e o desenho em `src/components/chassis/ChassisView.tsx`.
- Com 3 ou mais eixos o chassi ocupa a largura toda e o estoque desce para baixo dele.

## Bitruck (4 eixos)
- Os **2 eixos dianteiros têm 1 pneu por lado** e os **2 traseiros são duplos** (12 posições + estepe). Antes, só o 1º eixo era simples.
- Posições novas dos eixos simples: `E1-ESQ/E1-DIR` e `E2-ESQ/E2-DIR`.
- **Dados antigos:** ao abrir o sistema, pneus do 2º eixo em `E2-EE/E2-DE` passam para `E2-ESQ/E2-DIR`. Pneus em `E2-EI/E2-DI` (que não existem mais) voltam ao **estoque**, com KM e histórico preservados, e um aviso é mostrado.
- A regra vale para qualquer veículo com 4 eixos. Demais quantidades de eixos não mudaram.

## Custo Fixo por Veículo
- Nova aba em **Manutenções e multas**, ao lado de Manutenções e Multas, com botão **Custo fixo**.
- Campos: veículo, categoria (Seguro, IPVA/Licenciamento, Rastreamento, Financiamento/Consórcio, Salário/Encargos, Outros), descrição, valor mensal, dia do vencimento, mês de início, mês final (opcional) e ativo.
- **Sincronização com o Financeiro (`buildPayables`):** cada mês vira um pagamento do tipo **Custo Fixo**, com vencimento no dia escolhido (dia 31 cai no último dia dos meses curtos). Aparecem do mês de início até o mês seguinte ao atual (ou até o mês final) e passam a surgir mês a mês sozinhos. A baixa de cada mês é feita no Financeiro; a aba mostra a situação do mês atual (Pago, A vencer, Vencido).
- Editar valor, dia ou vigência atualiza todos os meses no Financeiro. Custo inativo deixa de gerar meses futuros e mantém o histórico. Excluir remove o custo e todos os seus meses (inclusive pagos); a tela avisa e sugere informar o mês final para manter o histórico.
- Os dados ficam no armazenamento local (modo DEMO) e entram no backup. No modo API a aba mostra aviso de indisponibilidade.

## Arquivos (atualização 2)
Novos: `components/chassis/ChassisView.tsx`, `components/custos/CustoFixoModal.tsx`, `services/chassisAssets.ts`, `services/custosFixosService.ts`, `public/chassi/*.webp`.
Modificados: `pneus/page.tsx`, `custos-multas/page.tsx`, `financeiro/page.tsx`, `malha-pneus/page.tsx`, `ui/index.tsx` (`TireChip` variante chassi), `globals.css`, `useFrotaWiseStore.tsx`, `veiculosService.ts`, `financeiroLocal.ts`, `config/constants.ts`, `types/frotawise.d.ts`, testes em `tests/domain/quilometragem-integracao.test.ts`.

## Backend (modo API)
Tabela `custos_fixos` (veiculo_id, categoria, descricao, valor_mensal, dia_vencimento, inicio, fim, ativo) e geração das competências no financeiro com origem `custoFixo` (id da competência `custoId:AAAA-MM`). Layout do Bitruck: aplicar a mesma regra de posições (`E1/E2-ESQ|DIR`) no cadastro de posições.

## Observação sobre os testes
O teste `FE-07` de `tests/domain/snapshot-3.5.0-suite.test.ts` já falhava antes desta atualização (espera um formato antigo de `getVehicleChassisSlots`); não foi alterado.
>>>>>>> 94e87f8 (Novas atualizações)
