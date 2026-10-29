export const APP_VERSION = '3.5.0' as const;
export const SCHEMA_VERSION = 1 as const;
export const SYSTEM_EXPORT_NAME = 'FrotaWise Enterprise Offline' as const;

export const STORAGE_KEYS = Object.freeze({
  COMPANY: 'ecofrota_v3_company',
  VEHICLES: 'ecofrota_v3_vehicles',
  TIRES: 'ecofrota_v3_tires',
  MAINTENANCES: 'ecofrota_v3_maintenances',
  FINES: 'ecofrota_v3_fines',
  FUELINGS: 'ecofrota_v3_fuelings',
  THEME: 'frotawise_ui_theme',
});

export function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatKm(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '0 km';
  }
  return (
    new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(value) + ' km'
  );
}

export function formatNumberPtBr(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
