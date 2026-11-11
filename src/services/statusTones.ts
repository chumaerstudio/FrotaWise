import type {
  ClassificacaoPneu,
  StatusMulta,
  StatusVeiculo,
  TipoLancamentoMulta,
} from '@/types/frotawise';

export type StatusTone = 'teal' | 'amber' | 'red' | 'blue' | 'gray';

/**
 * Fonte única da correspondência status → cor.
 * Todas as telas (pneus, painel, chassi, histórico) devem usar estas funções,
 * para que a cor sempre acompanhe o status atual do registro.
 */
export const CLASSIFICACAO_TONE: Record<ClassificacaoPneu, StatusTone> = {
  Rodando: 'teal',
  Estocar: 'blue',
  Recapar: 'amber',
  Sucatear: 'red',
};

/** Aceita também as variações usadas pelos alertas ('Atencao', 'sucatear'...). */
export function getClassificacaoTone(status?: string | null): StatusTone {
  const key = String(status || '').trim().toLowerCase();
  if (key === 'sucatear') return 'red';
  if (key === 'recapar') return 'amber';
  if (key === 'rodando') return 'teal';
  if (key === 'estocar') return 'blue';
  if (key === 'atencao') return 'blue';
  return 'gray';
}

export const MULTA_STATUS_TONE: Record<StatusMulta, StatusTone> = {
  Pendente: 'amber',
  Paga: 'teal',
  'Em Recurso': 'blue',
};

export function getMultaStatusTone(status?: string | null): StatusTone {
  return MULTA_STATUS_TONE[status as StatusMulta] ?? 'gray';
}

export function getVeiculoStatusTone(status?: StatusVeiculo | string | null): StatusTone {
  const key = String(status || '').trim().toLowerCase();
  if (key === 'operando' || key === 'ativo') return 'teal';
  if (key === 'inativo') return 'gray';
  return 'amber';
}

export function getTipoLancamentoMultaTone(tipo?: TipoLancamentoMulta): StatusTone {
  return tipo === 'NIC' ? 'red' : 'gray';
}
