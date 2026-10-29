import { describe, it, expect } from 'vitest';
import {
  getVehicleChassisSlots,
  findOrphanedTiresOnAxleChange,
  computeFuelMedias,
  computePreventiveAlertsPreview,
} from '@/services/veiculosService';
import { validatePreventiveRuleInput } from '@/services/regrasPreventivasService';
import {
  sanitizeCsvCell,
  validateSnapshotDryRun,
} from '@/services/onboardingService';
import { mapPneuDtoToViewModel, mapPneuViewModelToDto } from '@/lib/mappers';

describe('Suíte Completa Snapshot 3.5.0 (Issues FE-02 a FE-12)', () => {
  it('FE-02: converte null <-> string vazia corretamente nos adaptadores de Pneu', () => {
    const vm = mapPneuDtoToViewModel({
      id: 'uuid-p1',
      fogo: 'F-001',
      marca: 'Michelin',
      medida: '295/80 R22.5',
      sulcoMm: 14,
      recapagens: 0,
      kmTotal: 10000,
      classificacao: 'Estocar',
      veiculoAtualId: null,
      posicaoAtual: null,
      localEstoque: 'Galpão A',
      tipoBanda: null,
    });
    expect(vm.veiculoAtualId).toBe('');
    expect(vm.posicaoAtual).toBe('');

    const backToDto = mapPneuViewModelToDto(vm);
    expect(backToDto.veiculoAtualId).toBeNull();
    expect(backToDto.posicaoAtual).toBeNull();
  });

  it('FE-06: valida regras de manutenção preventiva e bloqueia duplicidade normalizada', () => {
    const existing = [
      {
        id: 'r1',
        modelo: 'FH 540',
        categoria: 'Cavalo Mecânico',
        peca: 'Óleo Motor',
        km: 20000,
      },
    ];
    const duplicateErr = validatePreventiveRuleInput(
      {
        modelo: ' fh 540 ',
        categoria: 'cavalo mecânico',
        peca: 'ÓLEO MOTOR',
        km: 25000,
      },
      existing
    );
    expect(duplicateErr).toMatch(/Já existe uma regra preventiva/i);
  });

  it('FE-07: gera 10 slots de rodagem + ESTEPE-1 para veículo de 3 eixos e bloqueia redução com pneu montado', () => {
    const slots3Eixos = getVehicleChassisSlots(3);
    expect(slots3Eixos).toHaveLength(11);
    expect(slots3Eixos).toContain('E3-DE');
    expect(slots3Eixos).toContain('ESTEPE-1');

    const orfaos = findOrphanedTiresOnAxleChange('v1', 2, [
      {
        id: 'p1',
        fogo: '101',
        marca: 'Pirelli',
        medida: '295/80',
        sulcoMm: 10,
        recapagens: 0,
        kmTotal: 5000,
        classificacao: 'Rodando',
        veiculoAtualId: 'v1',
        posicaoAtual: 'E3-EE',
        localEstoque: '',
        historicoVeiculos: [],
      },
    ]);
    expect(orfaos).toHaveLength(1);
  });

  it('FE-09 & FE-10: calcula média km/l excluindo ARLA e alerta preventiva a <= 500 km do limite', () => {
    const medias = computeFuelMedias([
      {
        id: 'f1',
        veiculoId: 'v1',
        tipo: 'Diesel',
        data: '2026-10-01',
        litros: 200,
        valorUnit: 6,
        valorTotal: 1200,
        km: 10000,
        fornecedor: 'Posto A',
      },
      {
        id: 'f2',
        veiculoId: 'v1',
        tipo: 'Arla',
        data: '2026-10-02',
        litros: 20,
        valorUnit: 4,
        valorTotal: 80,
        km: 10200,
        fornecedor: 'Posto A',
      },
      {
        id: 'f3',
        veiculoId: 'v1',
        tipo: 'Diesel',
        data: '2026-10-05',
        litros: 250,
        valorUnit: 6,
        valorTotal: 1500,
        km: 10500,
        fornecedor: 'Posto B',
      },
    ]);

    expect(medias.f1).toBeNull();
    expect(medias.f2).toBeNull();
    expect(medias.f3).toBe(2);

    const alertas = computePreventiveAlertsPreview(
      [
        {
          id: 'v1',
          placa: 'ABC1D23',
          uf: 'SP',
          modelo: 'FH 540',
          categoria: 'Pesado',
          eixos: 3,
          kmAtual: 19600,
          kmBase: 0,
          status: 'Ativo',
        },
      ],
      [
        {
          id: 'r1',
          modelo: 'FH 540',
          categoria: 'Pesado',
          peca: 'Filtro Diesel',
          km: 10000,
        },
      ],
      [
        {
          id: 'm1',
          osNumero: 'OS-1',
          veiculoId: 'v1',
          tipo: 'Preventiva',
          categoria: 'Pesado',
          peca: 'Filtro Diesel',
          km: 10000,
          descricao: 'Troca',
          fornecedor: 'Oficina',
          data: '2026-10-01',
          valor: 500,
        },
      ]
    );

    expect(alertas).toHaveLength(1);
    expect(alertas[0].restante).toBe(400);
    expect(alertas[0].status).toBe('proxima');
  });

  it('FE-11: mitiga CSV Formula Injection e rejeita abastecimento órfão no dry-run de importação', () => {
    expect(sanitizeCsvCell('=CMD|"/C calc"!A0')).toBe(`'=CMD|"/C calc"!A0`);
    expect(sanitizeCsvCell('+SUM(A1:A10)')).toBe("'+SUM(A1:A10)");

    const report = validateSnapshotDryRun({
      versao: '3.5.0',
      vehicles: [{ id: 'v1', eixos: 3 }],
      fuelings: [{ id: 'f1', veiculoId: 'veiculo-inexistente', litros: 100 }],
    });
    expect(report.valido).toBe(false);
    expect(report.conflitos[0].campo).toBe('veiculoId');
  });
});
