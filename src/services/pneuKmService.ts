import type { HistoricoPneu, Pneu, TipoOperacaoPneu } from '@/types/frotawise';

/**
 * Regras de quilometragem individual do pneu.
 *
 *   KM DA MOVIMENTAÇÃO = KM FINAL − KM INICIAL
 *
 * O KM inicial de uma nova movimentação é sempre o último KM rodado do próprio
 * pneu (`kmTotal`), nunca digitado e nunca o hodômetro do veículo. O KM do
 * pneu só é alterado por movimentações individuais gravadas no histórico do
 * pneu — isso vale para qualquer posição, inclusive o estepe.
 *
 * Todas as funções são puras: recebem o pneu e devolvem um novo pneu.
 */

export const TIPOS_MOVIMENTACAO: ReadonlySet<string> = new Set<TipoOperacaoPneu>([
  'Mount',
  'Estocar',
  'Recapar',
  'Sucatear',
  'AddKm',
]);

export interface MovimentacaoPneuInput {
  /** Chave de idempotência: o mesmo movId nunca é aplicado duas vezes. */
  movId: string;
  tipo: TipoOperacaoPneu;
  data: string;
  /** KM final do pneu. `null`/vazio = movimentação sem KM (0 km). */
  kmFinal: number | null;
  placa: string;
  modelo: string;
  veiculoId?: string;
  /** Leitura absoluta do hodômetro do veículo, quando informada. */
  kmVeiculo?: number | null;
  obs: string;
}

export interface ResultadoMovimentacao {
  tire: Pneu;
  erro?: string;
  duplicada?: boolean;
  kmMovimentacao?: number;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Último KM rodado do pneu: é o KM inicial da próxima movimentação. */
export const kmInicialDaProximaMovimentacao = (t: Pick<Pneu, 'kmTotal'>): number =>
  Math.max(0, num(t.kmTotal));

export function calcularKmMovimentacao(
  kmInicial: number,
  kmFinal: number | null | undefined
): { ok: true; km: number; kmFinal: number } | { ok: false; erro: string } {
  if (kmFinal === null || kmFinal === undefined || Number.isNaN(kmFinal)) {
    return { ok: true, km: 0, kmFinal: kmInicial };
  }
  if (!Number.isFinite(kmFinal) || kmFinal < 0) {
    return { ok: false, erro: 'Informe um KM final válido.' };
  }
  if (kmFinal < kmInicial) {
    return {
      ok: false,
      erro: `O KM final (${fmt(kmFinal)}) não pode ser menor que o KM inicial (${fmt(kmInicial)}).`,
    };
  }
  return { ok: true, km: kmFinal - kmInicial, kmFinal };
}

const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n);

export function registrarMovimentacao(
  tire: Pneu,
  input: MovimentacaoPneuInput
): ResultadoMovimentacao {
  const historico = tire.historicoVeiculos || [];
  if (historico.some((h) => h.id === input.movId)) {
    return { tire, duplicada: true };
  }
  const kmInicial = kmInicialDaProximaMovimentacao(tire);
  const calc = calcularKmMovimentacao(kmInicial, input.kmFinal);
  if (!calc.ok) return { tire, erro: calc.erro };

  const entrada: HistoricoPneu = {
    id: input.movId,
    tipo: input.tipo,
    placa: input.placa,
    modelo: input.modelo,
    veiculoId: input.veiculoId,
    kmInicial,
    kmFinal: calc.kmFinal,
    kmRodados: calc.km,
    kmVeiculo:
      input.kmVeiculo !== null && input.kmVeiculo !== undefined && Number.isFinite(input.kmVeiculo)
        ? input.kmVeiculo
        : null,
    data: input.data,
    obs: input.obs,
  };
  return {
    tire: {
      ...tire,
      kmTotal: kmInicial + calc.km,
      historicoVeiculos: [...historico, entrada],
    },
    kmMovimentacao: calc.km,
  };
}

/** Soma das distâncias válidas (não canceladas) do histórico individual do pneu. */
export const somaKmValidos = (t: Pick<Pneu, 'historicoVeiculos'>): number =>
  (t.historicoVeiculos || [])
    .filter((h) => !h.cancelada)
    .reduce((acc, h) => acc + num(h.kmRodados), 0);

export const kmConsistente = (t: Pick<Pneu, 'kmTotal' | 'historicoVeiculos'>): boolean =>
  Math.abs(somaKmValidos(t) - num(t.kmTotal)) < 1e-6;

export const ehMovimentacao = (h: HistoricoPneu): boolean =>
  !!h.tipo && TIPOS_MOVIMENTACAO.has(h.tipo) && h.kmInicial !== undefined;

/**
 * Só a última entrada válida do histórico pode ser editada/cancelada, porque o
 * KM inicial de cada movimentação é encadeado com o KM final da anterior.
 */
export function ultimaMovimentacaoEditavel(t: Pick<Pneu, 'historicoVeiculos'>): HistoricoPneu | null {
  const validas = (t.historicoVeiculos || []).filter((h) => !h.cancelada);
  const ultima = validas[validas.length - 1];
  return ultima && ehMovimentacao(ultima) ? ultima : null;
}

export function editarKmFinalMovimentacao(
  tire: Pneu,
  movId: string,
  novoKmFinal: number
): ResultadoMovimentacao {
  const alvo = ultimaMovimentacaoEditavel(tire);
  if (!alvo || alvo.id !== movId) {
    return {
      tire,
      erro: 'Somente a última movimentação do pneu pode ser editada, para manter o KM encadeado.',
    };
  }
  const calc = calcularKmMovimentacao(num(alvo.kmInicial), novoKmFinal);
  if (!calc.ok) return { tire, erro: calc.erro };
  const delta = calc.km - num(alvo.kmRodados);
  if (delta === 0 && calc.kmFinal === num(alvo.kmFinal)) return { tire, duplicada: true };
  return {
    tire: {
      ...tire,
      kmTotal: Math.max(0, num(tire.kmTotal) + delta),
      historicoVeiculos: (tire.historicoVeiculos || []).map((h) =>
        h.id === movId ? { ...h, kmFinal: calc.kmFinal, kmRodados: calc.km } : h
      ),
    },
    kmMovimentacao: calc.km,
  };
}

/**
 * Cancela a última movimentação: estorna o KM e mantém o registro no histórico
 * como cancelado (não é apagado). A posição/local do pneu não é revertida.
 */
export function cancelarMovimentacao(tire: Pneu, movId: string, data: string): ResultadoMovimentacao {
  const alvo = ultimaMovimentacaoEditavel(tire);
  if (!alvo || alvo.id !== movId) {
    return {
      tire,
      erro: 'Somente a última movimentação do pneu pode ser cancelada, para manter o KM encadeado.',
    };
  }
  return {
    tire: {
      ...tire,
      kmTotal: Math.max(0, num(tire.kmTotal) - num(alvo.kmRodados)),
      historicoVeiculos: (tire.historicoVeiculos || []).map((h) =>
        h.id === movId ? { ...h, cancelada: true, canceladaEm: data } : h
      ),
    },
    kmMovimentacao: 0,
  };
}

/** Ajuste manual do KM acumulado (edição do cadastro) registrado no histórico. */
export function aplicarAjusteKm(tire: Pneu, novoKm: number, id: string, data: string): Pneu {
  const alvo = Math.max(0, num(novoKm));
  const atual = num(tire.kmTotal);
  if (alvo === atual) return tire;
  return {
    ...tire,
    kmTotal: alvo,
    historicoVeiculos: [
      ...(tire.historicoVeiculos || []),
      {
        id,
        tipo: 'Ajuste',
        placa: 'AJUSTE-MANUAL',
        modelo: 'Edição do cadastro',
        kmInicial: atual,
        kmFinal: alvo,
        kmRodados: alvo - atual,
        data,
        obs: 'Ajuste do KM acumulado no cadastro do pneu',
      },
    ],
  };
}
