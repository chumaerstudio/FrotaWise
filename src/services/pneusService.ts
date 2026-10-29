import type { Pneu } from '@/types/frotawise';
import type { PneuApiDTO, VeiculoApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import { mapPneuDtoToViewModel, mapVeiculoDtoToViewModel } from '@/lib/mappers';

export interface AlocarPneuCommand {
  pneuId: string;
  veiculoId: string;
  posicao: string;
  kmInstalacao: number;
  dataOperacao: string;
  idempotencyKey: string;
}

export interface RetirarPneuCommand {
  pneuId: string;
  kmRetirada: number;
  destino: 'Estocar' | 'Recapar' | 'Sucatear';
  localEstoque: string;
  motivo: string;
  sulcoMm?: number;
  dataOperacao: string;
  idempotencyKey: string;
}

export interface OperacaoPneuResult {
  pneu: Pneu;
  veiculoAfetado?: ReturnType<typeof mapVeiculoDtoToViewModel>;
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'fw-idem-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11);
}

export const pneusService = {
  async list(): Promise<Pneu[]> {
    try {
      const response = await httpClient.get<PneuApiDTO[]>('/pneus');
      return response.data.map(mapPneuDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async alocar(cmd: AlocarPneuCommand): Promise<OperacaoPneuResult> {
    if (!cmd.veiculoId || !cmd.posicao) {
      throw new Error(
        'Veículo e posição do chassi são obrigatórios para montagem.'
      );
    }
    if (!Number.isFinite(cmd.kmInstalacao) || cmd.kmInstalacao < 0) {
      throw new Error('Hodômetro de instalação inválido.');
    }

    try {
      const response = await httpClient.post<{
        pneu: PneuApiDTO;
        veiculo?: VeiculoApiDTO;
      }>(
        '/pneus/' + encodeURIComponent(cmd.pneuId) + '/alocar',
        {
          veiculoId: cmd.veiculoId,
          posicao: cmd.posicao,
          kmInstalacao: Math.round(cmd.kmInstalacao),
          dataOperacao: cmd.dataOperacao,
        },
        {
          headers: { 'Idempotency-Key': cmd.idempotencyKey },
        }
      );

      return {
        pneu: mapPneuDtoToViewModel(response.data.pneu),
        veiculoAfetado: response.data.veiculo
          ? mapVeiculoDtoToViewModel(response.data.veiculo)
          : undefined,
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async retirar(cmd: RetirarPneuCommand): Promise<OperacaoPneuResult> {
    if (!Number.isFinite(cmd.kmRetirada) || cmd.kmRetirada < 0) {
      throw new Error('Hodômetro de retirada inválido.');
    }

    try {
      const response = await httpClient.post<{
        pneu: PneuApiDTO;
        veiculo?: VeiculoApiDTO;
      }>(
        '/pneus/' + encodeURIComponent(cmd.pneuId) + '/retirar',
        {
          kmRetirada: Math.round(cmd.kmRetirada),
          destino: cmd.destino,
          localEstoque: cmd.localEstoque.trim(),
          motivo: cmd.motivo.trim(),
          sulcoMm: cmd.sulcoMm,
          dataOperacao: cmd.dataOperacao,
        },
        {
          headers: { 'Idempotency-Key': cmd.idempotencyKey },
        }
      );

      return {
        pneu: mapPneuDtoToViewModel(response.data.pneu),
        veiculoAfetado: response.data.veiculo
          ? mapVeiculoDtoToViewModel(response.data.veiculo)
          : undefined,
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
