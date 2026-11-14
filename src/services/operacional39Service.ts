/**
 * Contrato do backend FrotaWise 3.9. Todas as requisições passam pelo BFF
 * same-origin: o JWT HttpOnly nunca deve ser exposto ao JavaScript do cliente.
 */
import { httpClient } from '@/lib/http/client';
import type { ContaPagar, CustoFixo, PagamentoPlano, Viagem } from '@/types/frotawise';

export function api39Error(error: unknown): string {
  const e = error as { response?: { status?: number; data?: { detail?: unknown } }; message?: string };
  const detail = e?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((v) => typeof v?.msg === 'string' ? v.msg : 'Campo inválido').join('; ');
  if (e?.response?.status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (e?.response?.status === 403) return 'Sem permissão para esta operação.';
  return 'Não foi possível confirmar a operação. Atualize os dados antes de tentar novamente.';
}

/** Decimal chega como texto para preservar precisão monetária no backend. */
const asMoney = (v: unknown): number => {
  const value = Number(v);
  if (!Number.isFinite(value)) throw new Error('Resposta financeira inválida do servidor.');
  return value;
};

// Não aceitar uma resposta parcial como sucesso: evita mostrar dados falsos.
function records(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data) || !data.every((v) => v !== null && typeof v === 'object' && !Array.isArray(v))) {
    throw new Error('O servidor retornou uma lista no formato inesperado.');
  }
  return data as Record<string, unknown>[];
}

export function mapTrips(data: unknown): Viagem[] {
  return records(data).map((t) => ({
    id: String(t.id), numero: Number(t.numero), veiculoId: String(t.veiculoId),
    data: String(t.data), origem: String(t.origem ?? ''), destino: String(t.destino ?? ''),
    kmInicial: Number(t.kmInicial), kmFinal: t.kmFinal == null ? null : Number(t.kmFinal),
    obs: String(t.obs ?? ''),
    itens: records(t.itens).map((i) => ({ id: String(i.id), descricao: String(i.descricao), valor: asMoney(i.valor) })),
    despesas: records(t.despesas).map((d) => ({
      id: String(d.id), descricao: String(d.descricao), valor: asMoney(d.valor),
      data: String(d.data), origem: (d.origem === 'abastecimento' ? 'abastecimento' : 'manual') as Viagem['despesas'][number]['origem'],
      abastecimentoId: d.abastecimentoId ? String(d.abastecimentoId) : undefined,
    })),
  }));
}

export function mapCosts(data: unknown): CustoFixo[] {
  return records(data).map((c) => ({
    id: String(c.id), veiculoId: String(c.veiculoId), categoria: c.categoria as CustoFixo['categoria'],
    descricao: String(c.descricao), valorMensal: asMoney(c.valorMensal),
    diaVencimento: Number(c.diaVencimento), inicio: String(c.inicio),
    fim: c.fim == null ? null : String(c.fim), ativo: Boolean(c.ativo), obs: String(c.obs ?? ''),
  }));
}

export function mapAccounts(data: unknown): ContaPagar[] {
  return records(data).map((c) => ({
    id: String(c.id), tipo: c.tipo as ContaPagar['tipo'], veiculoId: String(c.veiculoId ?? ''),
    descricao: String(c.descricao), fornecedor: String(c.fornecedor ?? ''),
    valor: asMoney(c.valor), data: String(c.data),
  }));
}

export function mapPlans(data: unknown): PagamentoPlano[] {
  return records(data).map((p) => ({
    id: String(p.id), origem: p.origem as PagamentoPlano['origem'], origemId: String(p.origemId),
    forma: p.forma as PagamentoPlano['forma'], parcelas: Number(p.parcelas),
    vencimento: String(p.vencimento), pagas: (p.pagas ?? {}) as Record<string, string>,
  }));
}

export const tripPayload = (trip: Omit<Viagem, 'id'>) => ({
  numero: trip.numero, veiculoId: trip.veiculoId, data: trip.data,
  origem: trip.origem ?? '', destino: trip.destino ?? '',
  kmInicial: trip.kmInicial, kmFinal: trip.kmFinal, obs: trip.obs ?? '',
  // IDs e valores derivados não são aceitos pelo contrato de escrita do servidor.
  itens: trip.itens.map((i) => ({ descricao: i.descricao, valor: i.valor.toFixed(2) })),
  // Despesa de combustível é criada EXCLUSIVAMENTE pelo backend.
  despesas: trip.despesas.filter((d) => d.origem === 'manual').map((d) => ({
    descricao: d.descricao, data: d.data, valor: d.valor.toFixed(2), origem: 'manual',
  })),
});

export const costPayload = (cost: CustoFixo) => ({
  veiculoId: cost.veiculoId, categoria: cost.categoria, descricao: cost.descricao,
  valorMensal: cost.valorMensal.toFixed(2), diaVencimento: cost.diaVencimento,
  inicio: cost.inicio, fim: cost.fim, ativo: cost.ativo, obs: cost.obs ?? '',
});

export const accountPayload = (account: Omit<ContaPagar, 'id'>) => ({
  tipo: account.tipo, veiculoId: account.veiculoId || null,
  descricao: account.descricao, fornecedor: account.fornecedor,
  valor: account.valor.toFixed(2), data: account.data,
});

export const planPayload = (plan: Omit<PagamentoPlano, 'id'>) => ({
  origem: plan.origem, origemId: plan.origemId, forma: plan.forma,
  parcelas: plan.parcelas, vencimento: plan.vencimento, pagas: plan.pagas,
});

/** POST pode ser reenviado com a mesma chave após falha de rede sem duplicar. */
export const requestKey = (): string => crypto.randomUUID();

export async function createAccount(account: Omit<ContaPagar, 'id'>, key: string): Promise<ContaPagar> {
  const { data } = await httpClient.post('/financeiro/contas', accountPayload(account), {
    headers: { 'Idempotency-Key': key },
  });
  return mapAccounts([data])[0];
}

export async function savePlan(plan: Omit<PagamentoPlano, 'id'>): Promise<void> {
  await httpClient.put('/financeiro/pagamentos', planPayload(plan));
}
