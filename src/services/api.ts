import { httpClient } from '@/lib/http/client';

export {
  APP_VERSION,
  SCHEMA_VERSION,
  SYSTEM_EXPORT_NAME,
  STORAGE_KEYS,
  formatCurrencyBRL,
  formatKm,
  formatNumberPtBr,
} from '@/config/constants';

export { LOGO_FROTAWISE } from '@/assets/brand';
export { LOGO_FROTAWISE as LOGO_FROTAWISE_ICON, LOGO_FROTAWISE as FAVICON_FROTAWISE } from '@/assets/brand';
export {
  httpClient as api,
  createHttpClient,
  toSafeHttpErrorLog,
} from '@/lib/http/client';


// Compatibilidade com os componentes legados enquanto eles usam a fachada api.ts.
export const SNAPSHOT_KEY = 'ecofrota_v3_snapshot';
export const NIC_MULTIPLICADOR = 2;
export const KM_AVISO_PREVENTIVA = 500;
export const TIPOS_COMBUSTIVEL = ['Gasolina', 'Arla', 'Diesel'] as const;
export const BANDAS_PNEU = ['Liso', 'Borrachudo', 'Misto'] as const;
export const CATEGORIAS_MANUTENCAO = [
  'Elétrica/Eletrônica',
  'Motor',
  'Suspensão',
  'Freio',
  'Acessórios',
  'Lanternagem',
] as const;

export const formatCurrency = (value: number | string): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);

export const formatNumber = (value: number | string): string =>
  new Intl.NumberFormat('pt-BR').format(Number(value) || 0);

export const formatDec = (value: number | string, decimals = 2): string =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value) || 0);

export const formatUnit = (value: number | string): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(Number(value) || 0);

export const today = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};


export default httpClient;
