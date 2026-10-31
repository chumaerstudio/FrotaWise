import type { RegraManutencaoPreventiva } from '@/types/frotawise';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';

export interface CreateRegraPreventivaInput {
  modelo?: string;
  categoria: string;
  peca: string;
  km: number;
}

export function normalizePreventiveRuleKey(input: {
  modelo?: string;
  categoria: string;
  peca: string;
}): string {
  const m = (input.modelo ?? '').trim().toUpperCase();
  const c = input.categoria.trim().toUpperCase();
  const p = input.peca.trim().toUpperCase();
  return m + '::' + c + '::' + p;
}

export function validatePreventiveRuleInput(
  input: CreateRegraPreventivaInput,
  existingRules: RegraManutencaoPreventiva[] = [],
  editingId?: string
): string | null {
  if (!input.categoria?.trim()) {
    return 'A categoria do veículo é obrigatória.';
  }
  if (!input.peca?.trim()) {
    return 'A peça ou serviço preventivo é obrigatório.';
  }
  if (!Number.isFinite(input.km) || input.km <= 0) {
    return 'O intervalo de quilometragem (km) deve ser um número positivo maior que zero.';
  }

  const candidateKey = normalizePreventiveRuleKey(input);
  const duplicate = existingRules.find(
    (r) => r.id !== editingId && normalizePreventiveRuleKey(r) === candidateKey
  );
  if (duplicate) {
    return 'Já existe uma regra preventiva cadastrada para esta combinação de Modelo, Categoria e Peça.';
  }

  return null;
}

export const regrasPreventivasService = {
  async list(): Promise<RegraManutencaoPreventiva[]> {
    try {
      const response = await httpClient.get<RegraManutencaoPreventiva[]>(
        '/preventivas/regras'
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(
    input: CreateRegraPreventivaInput
  ): Promise<RegraManutencaoPreventiva> {
    const validationError = validatePreventiveRuleInput(input);
    if (validationError) {
      throw new Error(validationError);
    }
    try {
      const response = await httpClient.post<RegraManutencaoPreventiva>(
        '/preventivas/regras',
        {
          modelo: input.modelo?.trim() ?? '',
          categoria: input.categoria.trim(),
          peca: input.peca.trim(),
          km: Math.round(input.km),
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    id: string,
    input: CreateRegraPreventivaInput
  ): Promise<RegraManutencaoPreventiva> {
    const validationError = validatePreventiveRuleInput(input, [], id);
    if (validationError) {
      throw new Error(validationError);
    }
    try {
      const response = await httpClient.put<RegraManutencaoPreventiva>(
        '/preventivas/regras/' + encodeURIComponent(id),
        {
          modelo: input.modelo?.trim() ?? '',
          categoria: input.categoria.trim(),
          peca: input.peca.trim(),
          km: Math.round(input.km),
        }
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete(
        '/preventivas/regras/' + encodeURIComponent(id)
      );
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
