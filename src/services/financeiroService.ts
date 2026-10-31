import type { Manutencao, Multa } from '@/types/frotawise';
import type { ManutencaoApiDTO, MultaApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import {
  assertValidIsoDate,
  mapManutencaoDtoToViewModel,
  mapMultaDtoToViewModel,
  toDecimalString,
} from '@/lib/mappers';

export const financeiroService = {
  async listManutencoes(): Promise<Manutencao[]> {
    try {
      const response = await httpClient.get<ManutencaoApiDTO[]>('/manutencoes');
      return response.data.map(mapManutencaoDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createManutencao(
    payload: Omit<Manutencao, 'id'>,
    idempotencyKey: string
  ): Promise<Manutencao> {
    try {
      const response = await httpClient.post<ManutencaoApiDTO>(
        '/manutencoes',
        {
          ...payload,
          categoria: payload.categoria?.trim() || null,
          peca: payload.peca?.trim() || null,
          data: assertValidIsoDate(payload.data),
          valor: toDecimalString(payload.valor, 2),
        },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return mapManutencaoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async listMultas(): Promise<Multa[]> {
    try {
      const response = await httpClient.get<MultaApiDTO[]>('/multas');
      return response.data.map(mapMultaDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createMulta(
    payload: Omit<Multa, 'id'>,
    idempotencyKey: string
  ): Promise<Multa> {
    try {
      const response = await httpClient.post<MultaApiDTO>(
        '/multas',
        {
          ait: payload.ait.trim(),
          veiculoId: payload.veiculoId,
          motivo: payload.motivo.trim(),
          identificado: Boolean(payload.identificado),
          motorista: payload.motorista.trim(),
          status: payload.status,
          data: assertValidIsoDate(payload.data),
          pontos: payload.pontos,
<<<<<<< HEAD
          valorOriginal: toDecimalString(payload.valorOriginal ?? payload.valor, 2),
=======
          valorOriginal:
            payload.valorOriginal !== undefined
              ? toDecimalString(payload.valorOriginal, 2)
              : null,
          valor: toDecimalString(payload.valor, 2),
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
        },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return mapMultaDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
