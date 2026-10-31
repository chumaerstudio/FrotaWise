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
<<<<<<< HEAD
        '/malha',
=======
        '/empresa/malha',
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
        payload
      );
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async removeRegraMalha(id: string): Promise<void> {
    try {
<<<<<<< HEAD
      await httpClient.delete('/malha/' + encodeURIComponent(id));
=======
      await httpClient.delete('/empresa/malha/' + encodeURIComponent(id));
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
