import type { Abastecimento, DespesaViagem, Viagem } from '@/types/frotawise';

export const INITIAL_TRIPS: Viagem[] = [];

const n = (v: unknown): number => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

/** Distância percorrida = KM final − KM inicial (null enquanto a viagem está em andamento). */
export function distanciaViagem(v: Pick<Viagem, 'kmInicial' | 'kmFinal'>): number | null {
  if (v.kmFinal === null || v.kmFinal === undefined) return null;
  const d = n(v.kmFinal) - n(v.kmInicial);
  return d >= 0 ? d : null;
}

export const totalItensViagem = (v: Pick<Viagem, 'itens'>): number =>
  (v.itens || []).reduce((a, i) => a + n(i.valor), 0);

export const totalDespesasViagem = (v: Pick<Viagem, 'despesas'>): number =>
  (v.despesas || []).reduce((a, d) => a + n(d.valor), 0);

export const totalAbastecimentoViagem = (v: Pick<Viagem, 'despesas'>): number =>
  (v.despesas || [])
    .filter((d) => d.origem === 'abastecimento')
    .reduce((a, d) => a + n(d.valor), 0);

export const proximoNumeroViagem = (trips: Viagem[]): number =>
  trips.reduce((max, t) => Math.max(max, n(t.numero)), 0) + 1;

export function validarViagem(
  trip: Pick<Viagem, 'numero' | 'veiculoId' | 'data' | 'kmInicial' | 'kmFinal'>,
  trips: Viagem[],
  editingId?: string | null
): string {
  if (!trip.veiculoId) return 'Selecione o veículo da viagem.';
  if (!(n(trip.numero) > 0) || !Number.isInteger(n(trip.numero)))
    return 'Informe um número de viagem inteiro e maior que zero.';
  if (trips.some((t) => t.id !== editingId && n(t.numero) === n(trip.numero)))
    return `Já existe a viagem nº ${trip.numero}.`;
  if (!trip.data) return 'Informe a data da viagem.';
  if (!(n(trip.kmInicial) >= 0)) return 'Informe o KM inicial da viagem.';
  if (trip.kmFinal !== null && trip.kmFinal !== undefined && n(trip.kmFinal) < n(trip.kmInicial))
    return 'O KM final não pode ser menor que o KM inicial.';
  return '';
}

export const idDespesaAbastecimento = (abastecimentoId: string) => `dsp-ab-${abastecimentoId}`;

/**
 * Mantém a despesa de abastecimento da viagem consistente. É idempotente:
 * a despesa tem id determinístico por abastecimento, então salvar de novo,
 * editar ou trocar de viagem nunca duplica. Despesas manuais não são tocadas.
 * Passe `fuel = null` + `removeId` para excluir o abastecimento.
 */
export function sincronizarDespesaAbastecimento(
  trips: Viagem[],
  fuel: Abastecimento | null,
  removeId?: string
): Viagem[] {
  const abastecimentoId = fuel?.id ?? removeId;
  if (!abastecimentoId) return trips;
  return trips.map((t) => {
    const semDespesa = (t.despesas || []).filter(
      (d) => !(d.origem === 'abastecimento' && d.abastecimentoId === abastecimentoId)
    );
    if (fuel && fuel.viagemId && fuel.viagemId === t.id) {
      const despesa: DespesaViagem = {
        id: idDespesaAbastecimento(fuel.id),
        descricao: `Abastecimento ${fuel.tipo} · ${fuel.fornecedor || 'Posto não informado'}`,
        valor: n(fuel.valorTotal),
        data: fuel.data,
        origem: 'abastecimento',
        abastecimentoId: fuel.id,
      };
      return { ...t, despesas: [...semDespesa, despesa] };
    }
    return semDespesa.length === (t.despesas || []).length ? t : { ...t, despesas: semDespesa };
  });
}

/** Normaliza viagens salvas no navegador (campos ausentes, tipos errados). */
export function normalizarViagens(arr: unknown): Viagem[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((t) => t && typeof t === 'object')
    .map((t: any) => ({
      id: String(t.id),
      numero: n(t.numero),
      veiculoId: String(t.veiculoId || ''),
      data: String(t.data || ''),
      origem: t.origem || '',
      destino: t.destino || '',
      kmInicial: n(t.kmInicial),
      kmFinal: t.kmFinal === null || t.kmFinal === undefined || t.kmFinal === '' ? null : n(t.kmFinal),
      itens: Array.isArray(t.itens) ? t.itens : [],
      despesas: Array.isArray(t.despesas) ? t.despesas : [],
      obs: t.obs || '',
    }));
}
