import type {
  DashboardResumoApiDTO,
  AlertaPreventivaApiDTO,
} from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';

export const dashboardService = {
  async getResumo(params?: {
    dataInicio?: string;
    dataFim?: string;
  }): Promise<DashboardResumoApiDTO> {
    try {
      const response = await httpClient.get<DashboardResumoApiDTO>(
        '/dashboard/resumo',
        { params }
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getAlertasPreventivas(): Promise<AlertaPreventivaApiDTO[]> {
    try {
      const response = await httpClient.get<{preventiveList: import('@/types/frotawise').AlertaPreventivaItem[]}>(
        '/bootstrap'
      );
      return response.data.preventiveList.map(x => ({
        veiculoId: x.v.id, regraId: x.r.id, ultimaManutencaoId: x.ultimo?.id || null,
        ultimaManutencaoKm: x.ultimo?.km ?? null, ultimaManutencaoData: x.ultimo?.data || null,
        kmAtual: x.atual.km, kmAtualData: x.atual.data || '',
        kmAtualOrigem: 'kmBase' as const,
        proximoLimiteKm: x.proximo ?? 0, restanteKm: x.restante ?? 0, status: x.status,
      }));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
