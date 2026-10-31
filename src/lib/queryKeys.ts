import { STORAGE_KEYS } from '@/config/constants';

export const queryKeys = {
  all: (tenantId: string) => ['frotawise', tenantId] as const,
  companyConfig: (tenantId: string) =>
    ['frotawise', tenantId, 'company-config'] as const,
  preventiveRules: (tenantId: string) =>
    ['frotawise', tenantId, 'preventive-rules'] as const,
  preventiveAlerts: (tenantId: string) =>
    ['frotawise', tenantId, 'preventive-alerts'] as const,
  vehicles: (tenantId: string) =>
    ['frotawise', tenantId, 'vehicles'] as const,
  tires: (tenantId: string) => ['frotawise', tenantId, 'tires'] as const,
  fuelings: (tenantId: string, filters?: Record<string, unknown>) =>
    ['frotawise', tenantId, 'fuelings', filters ?? {}] as const,
  maintenances: (tenantId: string) =>
    ['frotawise', tenantId, 'maintenances'] as const,
  fines: (tenantId: string) => ['frotawise', tenantId, 'fines'] as const,
  dashboardSummary: (tenantId: string, period?: string) =>
    ['frotawise', tenantId, 'dashboard-summary', period ?? 'current'] as const,
};

const activeControllers = new Set<AbortController>();

export function registerInFlightController(): AbortController {
  const controller = new AbortController();
  activeControllers.add(controller);
  return controller;
}

export function releaseInFlightController(controller: AbortController): void {
  activeControllers.delete(controller);
}

export function clearSessionScopedCaches(): void {
  for (const controller of activeControllers) {
    controller.abort();
  }
  activeControllers.clear();

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('ecofrota_jwt_token');
      window.localStorage.removeItem(STORAGE_KEYS.COMPANY);
      window.localStorage.removeItem(STORAGE_KEYS.VEHICLES);
      window.localStorage.removeItem(STORAGE_KEYS.TIRES);
      window.localStorage.removeItem(STORAGE_KEYS.MAINTENANCES);
      window.localStorage.removeItem(STORAGE_KEYS.FINES);
      window.localStorage.removeItem(STORAGE_KEYS.FUELINGS);
    } catch {
      // Storage indisponível
    }
  }
}
