import type { EmpresaConfig, RegraModeloPneu } from '@/types/frotawise';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';

export const malhaService = {
  async getEmpresaConfig(): Promise<EmpresaConfig> {
    try {
      const response = await httpClient.get<EmpresaConfig>('/empresa/config');
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createRegraMalha(
    payload: Omit<RegraModeloPneu, 'id'>
  ): Promise<RegraModeloPneu> {
    if (
      payload.km1 <= 0 ||
      payload.km2 <= 0 ||
      payload.km3 <= 0 ||
      payload.kmSucata <= 0
    ) {
      throw new Error(
        'Todos os limites de quilometragem da malha devem ser maiores que zero.'
      );
    }
    try {
      const response = await httpClient.post<RegraModeloPneu>(
        '/malha',
        payload
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async removeRegraMalha(id: string): Promise<void> {
    try {
      await httpClient.delete('/malha/' + encodeURIComponent(id));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
