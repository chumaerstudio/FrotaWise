import type { Multa } from '@/types/frotawise';

const PREFIXO = 'MUL';

const anoDe = (data?: string): string => {
  const y = String(data || '').slice(0, 4);
  return /^\d{4}$/.test(y) ? y : String(new Date().getFullYear());
};

const sequenciaDe = (codigo: string | undefined, ano: string): number => {
  const m = new RegExp(`^${PREFIXO}-${ano}-(\\d+)$`).exec(codigo || '');
  return m ? Number(m[1]) : 0;
};

/** Gera o próximo ID único de multa/NIC no formato MUL-AAAA-0001. */
export function gerarCodigoMulta(fines: Multa[], data?: string): string {
  const ano = anoDe(data);
  const max = fines.reduce((a, f) => Math.max(a, sequenciaDe(f.codigo, ano)), 0);
  return `${PREFIXO}-${ano}-${String(max + 1).padStart(4, '0')}`;
}

/**
 * Preenche o ID das multas antigas (sem `codigo`) sem alterar nenhum outro dado
 * e garante unicidade. Registros que já têm ID mantêm o valor.
 */
export function garantirCodigosMultas(fines: Multa[]): Multa[] {
  const usados = new Set(fines.map((f) => f.codigo).filter(Boolean) as string[]);
  const semCodigo = fines
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => !f.codigo || false)
    .sort((a, b) => String(a.f.data).localeCompare(String(b.f.data)) || b.i - a.i);
  if (!semCodigo.length) return fines;
  const novos = new Map<string, string>();
  const acumulado: Multa[] = [...fines];
  for (const { f } of semCodigo) {
    let codigo = gerarCodigoMulta(acumulado, f.data);
    while (usados.has(codigo)) {
      const [, ano, seq] = /^MUL-(\d{4})-(\d+)$/.exec(codigo)!;
      codigo = `${PREFIXO}-${ano}-${String(Number(seq) + 1).padStart(4, '0')}`;
    }
    usados.add(codigo);
    novos.set(f.id, codigo);
    acumulado.push({ ...f, codigo });
  }
  return fines.map((f) => (novos.has(f.id) ? { ...f, codigo: novos.get(f.id) } : f));
}

export const ehNic = (f: Pick<Multa, 'tipoLancamento'>): boolean => f.tipoLancamento === 'NIC';

export const nicsDaMulta = (fines: Multa[], multaId: string): Multa[] =>
  fines.filter((f) => ehNic(f) && f.multaOrigemId === multaId);

export const multaOriginalDaNic = (fines: Multa[], nic: Multa): Multa | undefined =>
  nic.multaOrigemId ? fines.find((f) => f.id === nic.multaOrigemId) : undefined;

/** Multas originais (não NIC) que podem receber um lançamento de NIC. */
export const multasVinculaveis = (fines: Multa[]): Multa[] => fines.filter((f) => !ehNic(f));

export const normalizarMultas = (arr: unknown): Multa[] =>
  Array.isArray(arr)
    ? garantirCodigosMultas(
        arr.map((f: any) => ({
          tipoLancamento: 'Multa' as const,
          multaOrigemId: null,
          ...f,
        }))
      )
    : [];

/** Normaliza texto de placa para busca (sem hífen/espaço, minúsculo). */
export const normPlaca = (s?: string): string =>
  String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
