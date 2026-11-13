import type { CategoriaCustoFixo, CustoFixo } from '@/types/frotawise';

export const CATEGORIAS_CUSTO_FIXO: CategoriaCustoFixo[] = [
  'Seguro',
  'IPVA / Licenciamento',
  'Rastreamento',
  'Financiamento / Consórcio',
  'Salário / Encargos',
  'Outros',
];

/** Quantos meses depois do mês atual o Financeiro já mostra (a vencer). */
export const MESES_A_FRENTE_FINANCEIRO = 1;

const pad = (n: number) => String(n).padStart(2, '0');
export const ymDe = (iso: string): string => String(iso || '').slice(0, 7);
export const ymAtual = (hojeIso: string): string => ymDe(hojeIso);

export function addMesesYM(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Vencimento de uma competência: dia escolhido, limitado ao último dia do mês. */
export function vencimentoDaCompetencia(ym: string, dia: number): string {
  const [y, m] = ym.split('-').map(Number);
  const ultimo = new Date(y, m, 0).getDate();
  const d = Math.max(1, Math.min(ultimo, Math.trunc(Number(dia) || 1)));
  return `${y}-${pad(m)}-${pad(d)}`;
}

/**
 * Competências (AAAA-MM) que o Financeiro deve mostrar: do início até o fim do
 * custo ou, se não houver fim, até o mês atual + MESES_A_FRENTE_FINANCEIRO.
 * Custo inativo não gera novas competências futuras, mas as já vencidas até o
 * mês atual continuam (para não apagar histórico de pagamentos).
 */
export function competenciasDoCusto(
  c: Pick<CustoFixo, 'inicio' | 'fim' | 'ativo'>,
  hojeIso: string
): string[] {
  const inicio = ymDe(c.inicio);
  if (!/^\d{4}-\d{2}$/.test(inicio)) return [];
  const atual = ymAtual(hojeIso);
  const limiteFuturo = addMesesYM(atual, c.ativo ? MESES_A_FRENTE_FINANCEIRO : 0);
  const fim = c.fim && /^\d{4}-\d{2}$/.test(c.fim) ? c.fim : null;
  const limite = fim && fim < limiteFuturo ? fim : limiteFuturo;
  const out: string[] = [];
  for (let ym = inicio, guard = 0; ym <= limite && guard < 600; ym = addMesesYM(ym, 1), guard++) out.push(ym);
  return out;
}

export const idCompetencia = (custoId: string, ym: string) => `${custoId}:${ym}`;

export const vigenteNoMes = (c: CustoFixo, ym: string): boolean =>
  c.ativo && ymDe(c.inicio) <= ym && (!c.fim || c.fim >= ym);

export const totalMensalVigente = (custos: CustoFixo[], ym: string, veiculoId?: string): number =>
  custos
    .filter((c) => vigenteNoMes(c, ym) && (!veiculoId || c.veiculoId === veiculoId))
    .reduce((a, c) => a + (Number(c.valorMensal) || 0), 0);

export function situacaoDoCusto(c: CustoFixo, ym: string): 'Ativo' | 'Encerrado' | 'Inativo' | 'Futuro' {
  if (!c.ativo) return 'Inativo';
  if (c.fim && c.fim < ym) return 'Encerrado';
  if (ymDe(c.inicio) > ym) return 'Futuro';
  return 'Ativo';
}

export function validarCustoFixo(c: Pick<CustoFixo, 'veiculoId' | 'descricao' | 'valorMensal' | 'diaVencimento' | 'inicio' | 'fim'>): string {
  if (!c.veiculoId) return 'Selecione o veículo.';
  if (!c.descricao.trim()) return 'Informe a descrição do custo.';
  if (!(Number(c.valorMensal) > 0)) return 'Informe o valor mensal.';
  const dia = Number(c.diaVencimento);
  if (!Number.isInteger(dia) || dia < 1 || dia > 31) return 'O dia de vencimento deve estar entre 1 e 31.';
  if (!/^\d{4}-\d{2}$/.test(c.inicio)) return 'Informe o mês de início.';
  if (c.fim && c.fim < c.inicio) return 'O mês final não pode ser anterior ao início.';
  return '';
}

export function normalizarCustosFixos(arr: unknown): CustoFixo[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((c) => c && typeof c === 'object')
    .map((c: any) => ({
      id: String(c.id),
      veiculoId: String(c.veiculoId || ''),
      categoria: CATEGORIAS_CUSTO_FIXO.includes(c.categoria) ? c.categoria : 'Outros',
      descricao: String(c.descricao || ''),
      valorMensal: Number(c.valorMensal) || 0,
      diaVencimento: Math.max(1, Math.min(31, Math.trunc(Number(c.diaVencimento) || 10))),
      inicio: ymDe(c.inicio),
      fim: c.fim ? ymDe(c.fim) : null,
      ativo: c.ativo !== false,
      obs: c.obs || '',
    }));
}
