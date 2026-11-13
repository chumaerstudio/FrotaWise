import { describe, it, expect } from 'vitest';
import type { Abastecimento, Multa, Pneu, Veiculo, Viagem } from '@/types/frotawise';
import {
  cancelarMovimentacao,
  editarKmFinalMovimentacao,
  kmConsistente,
  kmInicialDaProximaMovimentacao,
  registrarMovimentacao,
  somaKmValidos,
  aplicarAjusteKm,
} from '@/services/pneuKmService';
import {
  applyOdometer,
  computeFuelKmDiffs,
  odometerFrom,
  vehicleLaunchKms,
} from '@/services/veiculosService';
import { sincronizarDespesaAbastecimento, validarViagem, distanciaViagem } from '@/services/viagensService';
import {
  garantirCodigosMultas,
  gerarCodigoMulta,
  nicsDaMulta,
  normPlaca,
} from '@/services/multasService';
import { getClassificacaoTone } from '@/services/statusTones';

const pneu = (over: Partial<Pneu> = {}): Pneu => ({
  id: 'p1', fogo: '1', marca: 'X', medida: '295/80', sulcoMm: 10, recapagens: 0, kmTotal: 10000,
  classificacao: 'Rodando', veiculoAtualId: 'v1', posicaoAtual: 'E1-DIR', localEstoque: '',
  historicoVeiculos: [{ id: 'h0', placa: 'AAA', modelo: 'M', kmRodados: 10000, data: '2026-01-01', obs: '' }],
  tipoBanda: '', reformas: [], ...over,
});
const mov = (id: string, kmFinal: number | null, tipo: any = 'AddKm') => ({
  movId: id, tipo, data: '2026-02-01', kmFinal, placa: 'AAA', modelo: 'M', obs: '',
});

describe('KM individual do pneu', () => {
  it('KM inicial = último KM do pneu; KM final − inicial é somado', () => {
    const t = pneu();
    expect(kmInicialDaProximaMovimentacao(t)).toBe(10000);
    const r = registrarMovimentacao(t, mov('m1', 15000));
    expect(r.erro).toBeUndefined();
    expect(r.tire.kmTotal).toBe(15000);
    expect(r.kmMovimentacao).toBe(5000);
    expect(kmInicialDaProximaMovimentacao(r.tire)).toBe(15000);
  });

  it('várias movimentações acumulam e batem com a soma do histórico', () => {
    let t = pneu();
    t = registrarMovimentacao(t, mov('m1', 15000)).tire;
    t = registrarMovimentacao(t, mov('m2', 18000, 'Mount')).tire;
    t = registrarMovimentacao(t, mov('m3', 18000, 'Estocar')).tire; // sem KM
    expect(t.kmTotal).toBe(18000);
    expect(somaKmValidos(t)).toBe(18000);
    expect(kmConsistente(t)).toBe(true);
  });

  it('KM final menor que o inicial é recusado', () => {
    const r = registrarMovimentacao(pneu(), mov('m1', 9000));
    expect(r.erro).toBeTruthy();
    expect(r.tire.kmTotal).toBe(10000);
  });

  it('o KM é preservado ao trocar de veículo (histórico acompanha o pneu)', () => {
    let t = registrarMovimentacao(pneu(), mov('m1', 12000, 'Estocar')).tire;
    t = { ...t, veiculoAtualId: 'v2', posicaoAtual: 'E1-ESQ' };
    t = registrarMovimentacao(t, { ...mov('m2', 14000, 'Mount'), placa: 'BBB', veiculoId: 'v2' }).tire;
    expect(t.kmTotal).toBe(14000);
    expect(kmConsistente(t)).toBe(true);
  });

  it('estepe recebe KM pela movimentação como qualquer posição', () => {
    const est = pneu({ posicaoAtual: 'ESTEPE-1' });
    const r = registrarMovimentacao(est, mov('m1', 11000));
    expect(r.tire.kmTotal).toBe(11000);
  });

  it('novo envio com o mesmo movId não duplica KM', () => {
    const t1 = registrarMovimentacao(pneu(), mov('m1', 15000)).tire;
    const r2 = registrarMovimentacao(t1, mov('m1', 15000));
    expect(r2.duplicada).toBe(true);
    expect(r2.tire.kmTotal).toBe(15000);
  });

  it('editar a última movimentação ajusta por diferença (sem duplicar)', () => {
    const t1 = registrarMovimentacao(pneu(), mov('m1', 15000)).tire;
    const e = editarKmFinalMovimentacao(t1, 'm1', 14000);
    expect(e.tire.kmTotal).toBe(14000);
    expect(kmConsistente(e.tire)).toBe(true);
    const again = editarKmFinalMovimentacao(e.tire, 'm1', 14000);
    expect(again.tire.kmTotal).toBe(14000);
  });

  it('só a última movimentação pode ser editada/cancelada', () => {
    let t = registrarMovimentacao(pneu(), mov('m1', 12000)).tire;
    t = registrarMovimentacao(t, mov('m2', 13000)).tire;
    expect(editarKmFinalMovimentacao(t, 'm1', 12500).erro).toBeTruthy();
    expect(cancelarMovimentacao(t, 'm1', '2026-03-01').erro).toBeTruthy();
  });

  it('cancelar estorna o KM e mantém o registro como cancelado', () => {
    let t = registrarMovimentacao(pneu(), mov('m1', 15000)).tire;
    t = cancelarMovimentacao(t, 'm1', '2026-03-01').tire;
    expect(t.kmTotal).toBe(10000);
    expect(t.historicoVeiculos.find((h) => h.id === 'm1')?.cancelada).toBe(true);
    expect(kmConsistente(t)).toBe(true);
    // próxima movimentação volta a partir de 10.000
    expect(kmInicialDaProximaMovimentacao(t)).toBe(10000);
  });

  it('ajuste manual do KM entra no histórico e mantém a soma consistente', () => {
    const t = aplicarAjusteKm(pneu(), 9000, 'aj1', '2026-03-01');
    expect(t.kmTotal).toBe(9000);
    expect(kmConsistente(t)).toBe(true);
  });
});

describe('KM do veículo (leitura absoluta, nunca soma)', () => {
  const veh = { id: 'v1', placa: 'AAA', modelo: 'M', kmAtual: 1000, kmBase: 0 } as unknown as Veiculo;
  it('usa a maior leitura entre abastecimento, manutenção, viagem e movimentação de pneu', () => {
    const fuel = [{ id: 'a', veiculoId: 'v1', km: 1200 }] as unknown as Abastecimento[];
    const trips = [{ id: 't', veiculoId: 'v1', kmInicial: 1200, kmFinal: 1500 }] as unknown as Viagem[];
    const t = pneu({
      historicoVeiculos: [{ id: 'x', placa: 'AAA', modelo: 'M', veiculoId: 'v1', kmVeiculo: 1700, kmRodados: 0, data: '', obs: '' }],
    });
    const kms = vehicleLaunchKms('v1', fuel, [], trips, [t]);
    expect(odometerFrom(veh, kms)).toBe(1700);
  });
  it('movimentação cancelada não conta para o hodômetro', () => {
    const t = pneu({
      historicoVeiculos: [{ id: 'x', placa: 'AAA', modelo: 'M', veiculoId: 'v1', kmVeiculo: 9999, cancelada: true, kmRodados: 0, data: '', obs: '' }],
    });
    expect(vehicleLaunchKms('v1', [], [], [], [t])).toEqual([]);
  });
  it('atualizar o hodômetro do veículo NÃO repassa KM aos pneus', () => {
    const t = pneu();
    const r = applyOdometer([veh], [t], 'v1', 5000, 'x', '2026-01-01');
    expect(r.vehs[0].kmAtual).toBe(5000);
    expect(r.tirs[0].kmTotal).toBe(10000);
  });
});

describe('Média de Km entre abastecimentos', () => {
  const f = (id: string, veiculoId: string, data: string, km: number, tipo = 'Diesel') =>
    ({ id, veiculoId, data, km, tipo, litros: 100, valorUnit: 5, valorTotal: 500, fornecedor: '' } as unknown as Abastecimento);
  it('diferença para o abastecimento anterior do mesmo veículo', () => {
    const r = computeFuelKmDiffs([f('a', 'v1', '2026-01-01', 50000), f('b', 'v1', '2026-01-10', 50450)]);
    expect(r.a.diff).toBeNull();
    expect(r.b.diff).toBe(450);
  });
  it('não compara veículos diferentes', () => {
    const r = computeFuelKmDiffs([f('a', 'v1', '2026-01-01', 50000), f('b', 'v2', '2026-01-10', 90000)]);
    expect(r.b.diff).toBeNull();
  });
  it('KM menor que o anterior não gera média negativa', () => {
    const r = computeFuelKmDiffs([f('a', 'v1', '2026-01-01', 50000), f('b', 'v1', '2026-01-10', 49000)]);
    expect(r.b.diff).toBeNull();
    expect(r.b.divergente).toBe(true);
  });
  it('usa a ordem por data, independente da ordem da lista', () => {
    const r = computeFuelKmDiffs([f('b', 'v1', '2026-01-10', 50450), f('a', 'v1', '2026-01-01', 50000)]);
    expect(r.b.diff).toBe(450);
  });
  it('Arla fica fora da sequência', () => {
    const r = computeFuelKmDiffs([
      f('a', 'v1', '2026-01-01', 50000),
      f('x', 'v1', '2026-01-05', 50200, 'Arla'),
      f('b', 'v1', '2026-01-10', 50450),
    ]);
    expect(r.x.diff).toBeNull();
    expect(r.b.diff).toBe(450);
  });
});

describe('Abastecimento ↔ viagem', () => {
  const trip = (id: string, numero: number): Viagem => ({
    id, numero, veiculoId: 'v1', data: '2026-01-01', kmInicial: 100, kmFinal: 400, itens: [],
    despesas: [{ id: 'man', descricao: 'Pedágio', valor: 30, data: '2026-01-01', origem: 'manual' }],
  });
  const fuel = (over: Partial<Abastecimento> = {}) =>
    ({ id: 'ab1', veiculoId: 'v1', tipo: 'Diesel', data: '2026-01-02', litros: 100, valorUnit: 5, valorTotal: 500, km: 200, fornecedor: 'Posto', viagemId: 'vg150', ...over } as unknown as Abastecimento);

  it('gera a despesa da viagem e preserva as manuais', () => {
    const r = sincronizarDespesaAbastecimento([trip('vg150', 150)], fuel());
    expect(r[0].despesas).toHaveLength(2);
    expect(r[0].despesas.find((d) => d.origem === 'abastecimento')?.valor).toBe(500);
  });
  it('salvar de novo/editar não duplica; atualiza o valor', () => {
    let r = sincronizarDespesaAbastecimento([trip('vg150', 150)], fuel());
    r = sincronizarDespesaAbastecimento(r, fuel());
    r = sincronizarDespesaAbastecimento(r, fuel({ valorTotal: 650 }));
    const ab = r[0].despesas.filter((d) => d.origem === 'abastecimento');
    expect(ab).toHaveLength(1);
    expect(ab[0].valor).toBe(650);
  });
  it('trocar de viagem move a despesa; sem viagem remove', () => {
    let r = sincronizarDespesaAbastecimento([trip('vg150', 150), trip('vg151', 151)], fuel());
    r = sincronizarDespesaAbastecimento(r, fuel({ viagemId: 'vg151' }));
    expect(r[0].despesas.some((d) => d.origem === 'abastecimento')).toBe(false);
    expect(r[1].despesas.some((d) => d.origem === 'abastecimento')).toBe(true);
    r = sincronizarDespesaAbastecimento(r, fuel({ viagemId: null }));
    expect(r.every((t) => t.despesas.length === 1)).toBe(true);
  });
  it('excluir o abastecimento remove só a despesa gerada', () => {
    let r = sincronizarDespesaAbastecimento([trip('vg150', 150)], fuel());
    r = sincronizarDespesaAbastecimento(r, null, 'ab1');
    expect(r[0].despesas.map((d) => d.id)).toEqual(['man']);
  });
  it('validações da viagem', () => {
    const base = { numero: 1, veiculoId: 'v1', data: '2026-01-01', kmInicial: 100, kmFinal: 50 };
    expect(validarViagem(base, [])).toMatch(/KM final/);
    expect(validarViagem({ ...base, kmFinal: 300 }, [trip('x', 1)])).toMatch(/Já existe/);
    expect(validarViagem({ ...base, kmFinal: 300 }, [])).toBe('');
    expect(distanciaViagem({ kmInicial: 100, kmFinal: 400 })).toBe(300);
  });
});

describe('Multas e NIC', () => {
  const m = (over: Partial<Multa>): Multa =>
    ({ id: 'f', ait: 'A', veiculoId: 'v1', motivo: 'x', identificado: true, motorista: '', status: 'Pendente', data: '2026-03-01', pontos: 4, valor: 100, ...over } as Multa);
  it('gera IDs únicos e sequenciais', () => {
    const a = m({ id: '1', codigo: gerarCodigoMulta([], '2026-03-01') });
    const b = gerarCodigoMulta([a], '2026-04-01');
    expect(a.codigo).toBe('MUL-2026-0001');
    expect(b).toBe('MUL-2026-0002');
  });
  it('multas antigas recebem código sem repetir os existentes', () => {
    const r = garantirCodigosMultas([m({ id: '1', codigo: 'MUL-2026-0001' }), m({ id: '2' }), m({ id: '3' })]);
    expect(new Set(r.map((x) => x.codigo)).size).toBe(3);
    expect(r[0].codigo).toBe('MUL-2026-0001');
  });
  it('NIC fica vinculada à original por id, e são registros independentes', () => {
    const orig = m({ id: 'o', codigo: 'MUL-2026-0001' });
    const nic = m({ id: 'n', codigo: 'MUL-2026-0002', tipoLancamento: 'NIC', multaOrigemId: 'o', valor: 200 });
    expect(nicsDaMulta([orig, nic], 'o')).toHaveLength(1);
    expect(orig.valor).toBe(100);
    expect(nic.valor).toBe(200);
  });
  it('multas não participam do KM do veículo', () => {
    expect(vehicleLaunchKms('v1', [], [], [], [])).toEqual([]);
  });
  it('busca de placa ignora hífen e caixa', () => {
    expect(normPlaca('OPG-2469')).toBe(normPlaca('opg2469'));
  });
});

describe('Cores de status', () => {
  it('mapeamento único e consistente', () => {
    expect(getClassificacaoTone('Rodando')).toBe('teal');
    expect(getClassificacaoTone('Estocar')).toBe('blue');
    expect(getClassificacaoTone('Recapar')).toBe('amber');
    expect(getClassificacaoTone('Sucatear')).toBe('red');
  });
});
<<<<<<< HEAD
=======

// ===== Chassi (Bitruck), Custo Fixo e Financeiro =====
import { getVehicleChassisSlots, migrarPosicoesLegadasBitruck, singleAxleCount } from '@/services/veiculosService';
import { competenciasDoCusto, totalMensalVigente, vencimentoDaCompetencia, validarCustoFixo } from '@/services/custosFixosService';
import { buildPayables } from '@/services/financeiroLocal';
import { getChassisAsset } from '@/services/chassisAssets';
import type { CustoFixo } from '@/types/frotawise';

describe('Chassi do Bitruck (4 eixos)', () => {
  it('2 eixos dianteiros simples e 2 traseiros duplos', () => {
    const l = getVehicleChassisSlots(4);
    expect(l.axles.map((a) => a.single)).toEqual([true, true, false, false]);
    expect(l.axles[1].leftSlots).toHaveLength(1);
    expect(l.axles[1].rightSlots).toHaveLength(1);
    expect(l.axles[2].leftSlots).toHaveLength(2);
    expect(l.axles[3].rightSlots).toHaveLength(2);
    const total = l.axles.reduce((a, x) => a + x.leftSlots.length + x.rightSlots.length, 0);
    expect(total).toBe(12);
  });
  it('as demais configurações continuam: só o 1º eixo é simples', () => {
    expect(getVehicleChassisSlots(2).axles.map((a) => a.single)).toEqual([true, false]);
    expect(getVehicleChassisSlots(3).axles.map((a) => a.single)).toEqual([true, false, false]);
    expect(singleAxleCount(3)).toBe(1);
    expect(singleAxleCount(4)).toBe(2);
  });
  it('cada configuração tem imagem com um centro por eixo', () => {
    for (const n of [2, 3, 4, 5, 6]) expect(getChassisAsset(n).axles).toHaveLength(n);
  });
  it('migra dados antigos: externos reposicionam, internos do 2º eixo vão ao estoque', () => {
    const veh = [{ id: 'b', eixos: 4 }, { id: 'o', eixos: 3 }] as unknown as Veiculo[];
    const t = (id: string, v: string, pos: string) => pneu({ id, veiculoAtualId: v, posicaoAtual: pos });
    const r = migrarPosicoesLegadasBitruck(veh, [t('1', 'b', 'E2-EE'), t('2', 'b', 'E2-DE'), t('3', 'b', 'E2-EI'), t('4', 'b', 'E3-EE'), t('5', 'o', 'E2-EE')]);
    expect(r.tires.map((x) => x.posicaoAtual)).toEqual(['E2-ESQ', 'E2-DIR', '', 'E3-EE', 'E2-EE']);
    expect(r.tires[2].classificacao).toBe('Estocar');
    expect(r.tires[2].kmTotal).toBe(10000);
  });
  it('sem nada a migrar, devolve a mesma lista (sem reescrever)', () => {
    const veh = [{ id: 'b', eixos: 4 }] as unknown as Veiculo[];
    const tires = [pneu({ veiculoAtualId: 'b', posicaoAtual: 'E3-EE' })];
    expect(migrarPosicoesLegadasBitruck(veh, tires).tires === tires).toBe(true);
  });
});

describe('Custo fixo por veículo ↔ Financeiro', () => {
  const custo = (over: Partial<CustoFixo> = {}): CustoFixo => ({
    id: 'c1', veiculoId: 'v1', categoria: 'Seguro', descricao: 'Seguro', valorMensal: 1000,
    diaVencimento: 31, inicio: '2026-09', fim: null, ativo: true, ...over,
  });
  it('gera uma competência por mês até o mês seguinte ao atual', () => {
    expect(competenciasDoCusto(custo(), '2026-11-12')).toEqual(['2026-09', '2026-10', '2026-11', '2026-12']);
  });
  it('respeita o mês final e custo inativo não gera meses futuros', () => {
    expect(competenciasDoCusto(custo({ fim: '2026-10' }), '2026-11-12')).toEqual(['2026-09', '2026-10']);
    expect(competenciasDoCusto(custo({ ativo: false }), '2026-11-12')).toEqual(['2026-09', '2026-10', '2026-11']);
  });
  it('vencimento no dia 31 cai no último dia de meses curtos', () => {
    expect(vencimentoDaCompetencia('2026-11', 31)).toBe('2026-11-30');
    expect(vencimentoDaCompetencia('2028-02', 31)).toBe('2028-02-29');
  });
  it('cada competência vira um pagamento do tipo Custo Fixo, com baixa independente', () => {
    const base = { fuelings: [], maintenances: [], fines: [], tires: [], vehicles: [{ id: 'v1', placa: 'AAA-0001' }] as any, contas: [] };
    const sem = buildPayables({ ...base, pagamentos: [], custosFixos: [custo()], hoje: '2026-11-12' });
    expect(sem).toHaveLength(4);
    expect(sem.every((i) => i.tipo === 'Custo Fixo' && i.valor === 1000)).toBe(true);
    expect(sem[1].vencimento).toBe('2026-10-31');
    const pago = buildPayables({
      ...base, custosFixos: [custo()], hoje: '2026-11-12',
      pagamentos: [{ id: 'p', origem: 'custoFixo', origemId: 'c1:2026-10', forma: 'avista', parcelas: 1, vencimento: '2026-10-31', pagas: { 0: '2026-10-30' } }],
    });
    expect(pago.filter((i) => i.pagoEm).map((i) => i.origemId)).toEqual(['c1:2026-10']);
  });
  it('alterar o valor reflete em todos os meses; sem custos nada muda', () => {
    const base = { fuelings: [], maintenances: [], fines: [], tires: [], vehicles: [], pagamentos: [], contas: [] };
    const r = buildPayables({ ...base, custosFixos: [custo({ valorMensal: 1234.5 })], hoje: '2026-11-12' });
    expect(r.every((i) => i.valor === 1234.5)).toBe(true);
    expect(buildPayables({ ...base, hoje: '2026-11-12' })).toHaveLength(0);
  });
  it('total mensal vigente por veículo e validações', () => {
    const cs = [custo(), custo({ id: 'c2', veiculoId: 'v2', valorMensal: 500 }), custo({ id: 'c3', fim: '2026-10', valorMensal: 99 })];
    expect(totalMensalVigente(cs, '2026-11')).toBe(1500);
    expect(totalMensalVigente(cs, '2026-11', 'v2')).toBe(500);
    expect(validarCustoFixo({ veiculoId: '', descricao: 'x', valorMensal: 1, diaVencimento: 5, inicio: '2026-01', fim: null })).toMatch(/veículo/i);
    expect(validarCustoFixo({ veiculoId: 'v', descricao: 'x', valorMensal: 0, diaVencimento: 5, inicio: '2026-01', fim: null })).toMatch(/valor/i);
    expect(validarCustoFixo({ veiculoId: 'v', descricao: 'x', valorMensal: 1, diaVencimento: 5, inicio: '2026-05', fim: '2026-01' })).toMatch(/final/i);
    expect(validarCustoFixo({ veiculoId: 'v', descricao: 'x', valorMensal: 1, diaVencimento: 5, inicio: '2026-01', fim: null })).toBe('');
  });
});
>>>>>>> 94e87f8 (Novas atualizações)
