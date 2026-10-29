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
      const response = await httpClient.get<AlertaPreventivaApiDTO[]>(
        '/dashboard/preventivas'
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
