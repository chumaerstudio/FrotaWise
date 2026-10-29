import type { Abastecimento, TipoCombustivel } from '@/types/frotawise';
import type { AbastecimentoApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import {
  assertValidIsoDate,
  mapAbastecimentoDtoToViewModel,
  toDecimalString,
} from '@/lib/mappers';

export interface CreateAbastecimentoInput {
  veiculoId: string;
  tipo: TipoCombustivel;
  data: string;
  litros: number;
  valorUnit: number;
  km: number;
  fornecedor: string;
  idempotencyKey: string;
}

export function estimateFuelingTotalPreview(
  litros: number,
  valorUnit: number
): number {
  if (!Number.isFinite(litros) || !Number.isFinite(valorUnit)) return 0;
  if (litros <= 0 || valorUnit <= 0) return 0;
  return Number((litros * valorUnit).toFixed(2));
}

export function validateAbastecimentoInput(
  input: Omit<CreateAbastecimentoInput, 'idempotencyKey'>
): string | null {
  if (!input.veiculoId?.trim()) return 'Selecione um veículo válido.';
  if (!['Diesel', 'Gasolina', 'Arla'].includes(input.tipo)) {
    return 'Tipo de combustível/fluido inválido.';
  }
  if (!Number.isFinite(input.litros) || input.litros <= 0) {
    return 'A quantidade de litros deve ser maior que zero.';
  }
  if (!Number.isFinite(input.valorUnit) || input.valorUnit <= 0) {
    return 'O valor unitário por litro deve ser maior que zero.';
  }
  if (!Number.isFinite(input.km) || input.km < 0) {
    return 'O hodômetro (km) informado é inválido.';
  }
  if (!input.fornecedor?.trim()) {
    return 'Informe o posto/fornecedor do abastecimento.';
  }
  try {
    assertValidIsoDate(input.data, 'data');
  } catch (err) {
    return (err as Error).message;
  }
  return null;
}

export const abastecimentosService = {
  async list(params?: {
    veiculoId?: string;
    tipo?: TipoCombustivel;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<Abastecimento[]> {
    try {
      const response = await httpClient.get<AbastecimentoApiDTO[]>(
        '/abastecimentos',
        { params }
      );
      return response.data.map(mapAbastecimentoDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(input: CreateAbastecimentoInput): Promise<Abastecimento> {
    const validationErr = validateAbastecimentoInput(input);
    if (validationErr) {
      throw new Error(validationErr);
    }

    try {
      const response = await httpClient.post<AbastecimentoApiDTO>(
        '/abastecimentos',
        {
          veiculoId: input.veiculoId,
          tipo: input.tipo,
          data: assertValidIsoDate(input.data),
          litros: input.litros,
          valorUnit: toDecimalString(input.valorUnit, 4),
          km: Math.round(input.km),
          fornecedor: input.fornecedor.trim(),
        },
        {
          headers: { 'Idempotency-Key': input.idempotencyKey },
        }
      );
      return mapAbastecimentoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    id: string,
    input: Omit<CreateAbastecimentoInput, 'idempotencyKey'>
  ): Promise<Abastecimento> {
    const validationErr = validateAbastecimentoInput(input);
    if (validationErr) {
      throw new Error(validationErr);
    }

    try {
      const response = await httpClient.patch<AbastecimentoApiDTO>(
        '/abastecimentos/' + encodeURIComponent(id),
        {
          veiculoId: input.veiculoId,
          tipo: input.tipo,
          data: assertValidIsoDate(input.data),
          litros: input.litros,
          valorUnit: toDecimalString(input.valorUnit, 4),
          km: Math.round(input.km),
          fornecedor: input.fornecedor.trim(),
        }
      );
      return mapAbastecimentoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete('/abastecimentos/' + encodeURIComponent(id));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
