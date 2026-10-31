import {
  APP_VERSION,
  SCHEMA_VERSION,
  SYSTEM_EXPORT_NAME,
} from '@/config/constants';
import type {
  Abastecimento,
  EmpresaConfig,
  Manutencao,
  Multa,
  Pneu,
  Veiculo,
} from '@/types/frotawise';

const FORMULA_INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (
    str.length > 0 &&
    FORMULA_INJECTION_PREFIXES.some((prefix) => str.startsWith(prefix))
  ) {
    return "'" + str;
  }
  return str;
}

export interface TenantExportSnapshot350 {
  tipoDocumento: 'EXPORTACAO_DADOS_TENANT_NAO_SUBSTITUI_BACKUP_POSTGRESQL';
  sistema: typeof SYSTEM_EXPORT_NAME;
  versao: typeof APP_VERSION;
  schema: typeof SCHEMA_VERSION;
  dataExportacao: string;
  company: EmpresaConfig;
  vehicles: Veiculo[];
  tires: Pneu[];
  maintenances: Manutencao[];
  fines: Multa[];
  fuelings: Abastecimento[];
}

export function buildTenantExportPayload(data: {
  company: EmpresaConfig;
  vehicles: Veiculo[];
  tires: Pneu[];
  maintenances: Manutencao[];
  fines: Multa[];
  fuelings: Abastecimento[];
}): TenantExportSnapshot350 {
  return {
    tipoDocumento: 'EXPORTACAO_DADOS_TENANT_NAO_SUBSTITUI_BACKUP_POSTGRESQL',
    sistema: SYSTEM_EXPORT_NAME,
    versao: APP_VERSION,
    schema: SCHEMA_VERSION,
    dataExportacao: new Date().toISOString(),
    company: data.company,
    vehicles: data.vehicles,
    tires: data.tires,
    maintenances: data.maintenances,
    fines: data.fines,
    fuelings: data.fuelings,
  };
}

export interface SnapshotValidationConflict {
  entidade: string;
  indice: number;
  campo: string;
  mensagem: string;
}

export function validateSnapshotDryRun(rawJson: unknown): {
  valido: boolean;
  versaoDetectada: string | null;
  conflitos: SnapshotValidationConflict[];
} {
  const conflitos: SnapshotValidationConflict[] = [];
  if (!rawJson || typeof rawJson !== 'object') {
    return {
      valido: false,
      versaoDetectada: null,
      conflitos: [
        {
          entidade: 'root',
          indice: 0,
          campo: 'json',
          mensagem: 'Arquivo de importação não é um objeto JSON válido.',
        },
      ],
    };
  }

  const obj = rawJson as Record<string, unknown>;
  const versaoDetectada =
    typeof obj.versao === 'string' ? obj.versao : 'legado-desconhecido';

  const vehicles = Array.isArray(obj.vehicles) ? obj.vehicles : [];
  const vehicleIds = new Set<string>();

  vehicles.forEach((v: Record<string, unknown>, idx: number) => {
    if (typeof v.id === 'string') vehicleIds.add(v.id);
    if (typeof v.eixos === 'number' && (v.eixos < 2 || v.eixos > 6)) {
      conflitos.push({
        entidade: 'vehicles',
        indice: idx,
        campo: 'eixos',
        mensagem:
          'Veículo com ' +
          String(v.eixos) +
          ' eixos fora do intervalo homologado (2..6).',
      });
    }
  });

  const fuelings = Array.isArray(obj.fuelings) ? obj.fuelings : [];
  fuelings.forEach((f: Record<string, unknown>, idx: number) => {
    if (typeof f.veiculoId !== 'string' || !vehicleIds.has(f.veiculoId)) {
      conflitos.push({
        entidade: 'fuelings',
        indice: idx,
        campo: 'veiculoId',
        mensagem: 'Abastecimento referencia veículo inexistente no lote.',
      });
    }
    if (typeof f.litros !== 'number' || f.litros <= 0) {
      conflitos.push({
        entidade: 'fuelings',
        indice: idx,
        campo: 'litros',
        mensagem: 'Litros devem ser maiores que zero.',
      });
    }
  });

  return {
    valido: conflitos.length === 0,
    versaoDetectada,
    conflitos,
  };
}
