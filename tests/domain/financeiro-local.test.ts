import { describe, expect, it } from 'vitest';
import {
  addMonthsISO,
  buildPayables,
  daysBetween,
  splitInstallments,
} from '@/services/financeiroLocal';
import type {
  Abastecimento,
  ContaPagar,
  Manutencao,
  Multa,
  PagamentoPlano,
  Pneu,
  Veiculo,
} from '@/types/frotawise';

describe('Financeiro local — atualização 3.9.0', () => {
  it('divide parcelas em centavos sem perder o valor total', () => {
    const parcelas = splitInstallments(100, 3);
    expect(parcelas).toEqual([33.33, 33.33, 33.34]);
    expect(parcelas.reduce((total, valor) => total + valor, 0)).toBe(100);
  });

  it('calcula meses e dias sem ultrapassar o último dia do mês', () => {
    expect(addMonthsISO('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsISO('2028-01-31', 1)).toBe('2028-02-29');
    expect(daysBetween('2026-11-01', '2026-11-04')).toBe(3);
  });

  it('reúne lançamentos integrados, exclui os desmarcados e distribui contas parceladas', () => {
    const vehicles: Veiculo[] = [{
      id: 'v1', placa: 'ABC-1234', uf: 'MG', modelo: 'Caminhão Teste',
      categoria: 'Cavalo', eixos: 3, kmAtual: 10000, status: 'Operando',
    }];
    const fuelings: Abastecimento[] = [{
      id: 'ab1', veiculoId: 'v1', tipo: 'Diesel', data: '2026-11-01',
      litros: 100, valorUnit: 6, valorTotal: 600, km: 10000, fornecedor: 'Posto',
    }];
    const maintenances: Manutencao[] = [
      {
        id: 'm1', osNumero: 'OS-1', veiculoId: 'v1', tipo: 'Preventiva',
        descricao: 'Revisão', fornecedor: 'Oficina', data: '2026-11-02', valor: 300,
        integrarFinanceiro: true,
      },
      {
        id: 'm2', osNumero: 'OS-2', veiculoId: 'v1', tipo: 'Corretiva',
        descricao: 'Serviço não integrado', fornecedor: 'Oficina', data: '2026-11-02', valor: 900,
        integrarFinanceiro: false,
      },
    ];
    const fines: Multa[] = [{
      id: 'f1', ait: 'AIT-1', veiculoId: 'v1', motivo: 'Multa', motorista: 'Motorista',
      status: 'Paga', data: '2026-11-03', pontos: 4, valor: 100,
    }];
    const tires: Pneu[] = [{
      id: 'p1', fogo: '101', marca: 'Marca', medida: '295/80 R22.5', sulcoMm: 10,
      recapagens: 1, kmTotal: 50000, classificacao: 'Estocar', veiculoAtualId: '',
      posicaoAtual: '', localEstoque: 'A-01', historicoVeiculos: [],
      reformas: [{ id: 'r1', ciclo: 1, data: '2026-11-03', fornecedor: 'Recapadora', tipoBanda: 'Misto', valor: 200 }],
    }];
    const contas: ContaPagar[] = [{
      id: 'c1', tipo: 'Outros', veiculoId: '', descricao: 'Seguro', fornecedor: 'Seguradora',
      valor: 900, data: '2026-11-04',
    }];
    const pagamentos: PagamentoPlano[] = [{
      id: 'pg1', origem: 'conta', origemId: 'c1', forma: 'parcelado', parcelas: 3,
      vencimento: '2026-11-10', pagas: { '0': '2026-11-10' },
    }];

    const items = buildPayables({ fuelings, maintenances, fines, tires, vehicles, pagamentos, contas });
    expect(items.map((item) => item.origem)).toEqual([
      'abastecimento', 'manutencao', 'multa', 'pneu', 'conta', 'conta', 'conta',
    ]);
    expect(items.some((item) => item.origemId === 'm2')).toBe(false);
    expect(items.filter((item) => item.origem === 'conta')).toHaveLength(3);
    expect(items.find((item) => item.origem === 'conta' && item.idx === 0)?.pagoEm).toBe('2026-11-10');
    expect(items.find((item) => item.origem === 'multa')?.pagoEm).toBe('2026-11-03');
  });
});
