import { describe, expect, it } from 'vitest';
import { normalizeStoredValue } from '@/lib/storage';
import { INITIAL_COMPANY, INITIAL_TIRES, getTireRecapStyle, getTireRecapLegend, getTireLimits } from '@/services/pneusService';
import {
  INITIAL_FINES,
  INITIAL_MAINTENANCES,
  INITIAL_VEHICLES,
  computeFuelMedias,
  computeFuelMediaDetails,
} from '@/services/veiculosService';
import type { Abastecimento } from '@/types/frotawise';

describe('Regressão de inicialização e compatibilidade do FrotaWise', () => {
  it('restaura listas iniciais quando o armazenamento contém um valor inválido', () => {
    const initial = [{ id: 'v1' }];
    expect(normalizeStoredValue(undefined, initial)).toEqual(initial);
    expect(normalizeStoredValue(null, initial)).toEqual(initial);
    expect(normalizeStoredValue({ id: 'v1' }, initial)).toEqual(initial);
  });

  it('filtra entradas nulas de listas persistidas sem descartar os registros válidos', () => {
    expect(normalizeStoredValue([{ id: 'v1' }, null, undefined], [])).toEqual([{ id: 'v1' }]);
  });

  it('expõe as coleções padrão exigidas pelo contexto e cálculos de pneus', () => {
    expect(INITIAL_VEHICLES.length).toBeGreaterThan(0);
    expect(INITIAL_MAINTENANCES).toBeInstanceOf(Array);
    expect(INITIAL_FINES).toBeInstanceOf(Array);
    expect(INITIAL_TIRES.length).toBeGreaterThan(0);
    expect(getTireLimits(INITIAL_TIRES[0], INITIAL_COMPANY).kmRecapar).toBeGreaterThan(0);
  });

  it('calcula média de combustível no formato esperado pelos painéis', () => {
    const fuelings: Abastecimento[] = [
      { id: 'a1', veiculoId: 'v1', tipo: 'Diesel', data: '2026-10-01', litros: 100, valorUnit: 6, valorTotal: 600, km: 1000, fornecedor: 'A' },
      { id: 'a2', veiculoId: 'v1', tipo: 'Diesel', data: '2026-10-02', litros: 50, valorUnit: 6, valorTotal: 300, km: 1500, fornecedor: 'A' },
    ];
    expect(computeFuelMedias(fuelings).a2).toBe(10);
    expect(computeFuelMediaDetails(fuelings).a2).toMatchObject({ media: 10, dist: 500, litros: 50, kmAnterior: 1000 });
  });
});

it('mantém a cor e o rótulo do mesmo ciclo no chassi e na legenda', () => {
  const cycles = [0, 1, 2, 3, 4, 5];
  const tires = cycles.map(recapagens => ({ ...INITIAL_TIRES[0], recapagens, kmTotal: 80000 }));
  const legend = getTireRecapLegend(tires);
  expect(legend).toEqual(cycles.map(getTireRecapStyle));
  expect(new Set(legend.map(entry => entry.c)).size).toBe(cycles.length);
  expect(legend.map(entry => entry.label)).toEqual(['Novo', ...cycles.slice(1).map(n => `${n}ª recapagem`)]);
});
