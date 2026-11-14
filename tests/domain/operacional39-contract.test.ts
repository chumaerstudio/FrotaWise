import { describe, expect, it } from 'vitest';
import {
  accountPayload, costPayload, mapAccounts, mapCosts, mapPlans,
  mapTrips, planPayload, tripPayload,
} from '@/services/operacional39Service';

describe('Contrato API 3.9 / rotas integradas', () => {
  it('normaliza decimais e associa o abastecimento à viagem sem duplicar gastos', () => {
    const trips = mapTrips([{
      id: 'trip-uuid', numero: 14, veiculoId: 'veh-uuid', data: '2026-11-13',
      kmInicial: 100, kmFinal: 200, origem: 'BH', destino: 'SP', obs: '',
      itens: [{ id: 'item-uuid', descricao: 'Frete', valor: '310.45' }],
      despesas: [
        { id: 'manual-uuid', descricao: 'Pedágio', valor: '22.10', data: '2026-11-13', origem: 'manual' },
        { id: 'fuel-uuid', descricao: 'Diesel', valor: '99.99', data: '2026-11-13', origem: 'abastecimento', abastecimentoId: 'ab-uuid' },
      ],
    }]);
    expect(trips[0].itens[0].valor).toBe(310.45);
    expect(trips[0].despesas[1].abastecimentoId).toBe('ab-uuid');
    const payload = tripPayload(trips[0]);
    expect(payload.itens).toEqual([{ descricao: 'Frete', valor: '310.45' }]);
    expect(payload.despesas).toEqual([{ descricao: 'Pedágio', data: '2026-11-13', valor: '22.10', origem: 'manual' }]);
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('empresaId');
  });

  it('normaliza custos e pagamentos sem aceitar o tenant do cliente', () => {
    const c = mapCosts([{ id: 'c1', veiculoId: 'v1', categoria: 'Seguro', descricao: 'Seguro', valorMensal: '210.30', diaVencimento: 10, inicio: '2026-11', fim: null, ativo: true, empresaId: 'FORGED' }])[0];
    expect(c.valorMensal).toBe(210.3);
    expect(costPayload(c)).not.toHaveProperty('empresaId');
    expect(costPayload(c).valorMensal).toBe('210.30');
    const [plan] = mapPlans([{ id: 'pg1', origem: 'custoFixo', origemId: 'c1:2026-11', forma: 'avista', parcelas: 1, vencimento: '2026-11-10', pagas: { '0': '2026-11-10' } }]);
    expect(plan.pagas['0']).toBe('2026-11-10');
    expect(planPayload(plan)).not.toHaveProperty('id');
  });

  it('normaliza contas e envia veículo opcional como null', () => {
    const [account] = mapAccounts([{ id: 'c1', veiculoId: null, tipo: 'Outros', descricao: 'Tarifa', fornecedor: '', valor: '15.00', data: '2026-11-13' }]);
    expect(account.valor).toBe(15);
    expect(accountPayload(account).veiculoId).toBeNull();
    expect(accountPayload(account).valor).toBe('15.00');
  });

  it('rejeita respostas inesperadas em vez de exibir dados inventados', () => {
    expect(() => mapTrips({ items: [] })).toThrow();
    expect(() => mapAccounts([{ id: 1, valor: 'NaN' }])).toThrow();
  });
});
