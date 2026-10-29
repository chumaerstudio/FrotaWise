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
export {
  httpClient as api,
  createHttpClient,
  toSafeHttpErrorLog,
} from '@/lib/http/client';

export default httpClient;
