import type {
  Abastecimento,
  ContaPagar,
  Manutencao,
  Multa,
  PagamentoPlano,
  Pneu,
  TipoFinanceiro,
  Veiculo,
} from '@/types/frotawise';

export const TIPOS_FINANCEIRO: TipoFinanceiro[] = [
  'Abastecimento',
  'Manutenção',
  'Multa',
  'Pneus',
  'Outros',
];

export interface ItemFinanceiro {
  key: string;
  origem: PagamentoPlano['origem'];
  origemId: string;
  idx: number;
  tipo: TipoFinanceiro;
  descricao: string;
  sub: string;
  total: number;
  forma: 'avista' | 'parcelado';
  parcelas: number;
  numParcela: number;
  valor: number;
  primeiroVenc: string;
  vencimento: string;
  pagoEm: string | null;
}

export function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addMonthsISO(iso: string, n: number): string {
  const [year, month, day] = String(iso).split('-').map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(year, month - 1 + n, 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(Math.min(day, lastDay))}`;
}

export function splitInstallments(total: number, count: number): number[] {
  const n = Math.max(1, Math.min(48, Math.round(Number(count) || 1)));
  const cents = Math.round((Number(total) || 0) * 100);
  const base = Math.floor(cents / n);
  return Array.from({ length: n }, (_, i) =>
    (i === n - 1 ? cents - base * (n - 1) : base) / 100
  );
}

export function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00`);
  const b = new Date(`${bIso}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function formatDateBR(iso: string | null | undefined): string {
  return iso ? String(iso).split('-').reverse().join('/') : '—';
}

export function formatDateShort(iso: string | null | undefined): string {
  return iso
    ? String(iso).split('-').reverse().map((part, index) => (index === 2 ? part.slice(2) : part)).join('/')
    : '—';
}

export function buildPayables(args: {
  fuelings: Abastecimento[];
  maintenances: Manutencao[];
  fines: Multa[];
  tires: Pneu[];
  vehicles: Veiculo[];
  pagamentos: PagamentoPlano[];
  contas: ContaPagar[];
}): ItemFinanceiro[] {
  const { fuelings, maintenances, fines, tires, vehicles, pagamentos, contas } = args;
  const placa = (id: string) => vehicles.find((v) => v.id === id)?.placa || '';
  const base: Array<{
    origem: PagamentoPlano['origem'];
    origemId: string;
    tipo: TipoFinanceiro;
    descricao: string;
    sub: string;
    total: number;
    data: string;
    paga?: boolean;
  }> = [];

  fuelings.forEach((f) => base.push({
    origem: 'abastecimento', origemId: f.id, tipo: 'Abastecimento',
    descricao: `${f.tipo} · ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(f.litros)} L`,
    sub: [placa(f.veiculoId), f.fornecedor].filter(Boolean).join(' · '),
    total: Number(f.valorTotal) || 0, data: f.data,
  }));

  maintenances.filter((m) => m.integrarFinanceiro !== false).forEach((m) => base.push({
    origem: 'manutencao', origemId: m.id, tipo: 'Manutenção', descricao: m.descricao,
    sub: [placa(m.veiculoId), m.osNumero, m.fornecedor].filter(Boolean).join(' · '),
    total: Number(m.valor) || 0, data: m.data,
  }));

  fines.filter((f) => f.integrarFinanceiro !== false).forEach((f) => base.push({
    origem: 'multa', origemId: f.id, tipo: 'Multa', descricao: f.motivo,
    sub: [placa(f.veiculoId), f.ait].filter(Boolean).join(' · '),
    total: Number(f.valor) || 0, data: f.data, paga: f.status === 'Paga',
  }));

  tires.forEach((t) => (t.reformas || []).forEach((r) => {
    if (Number(r.valor) > 0) base.push({
      origem: 'pneu', origemId: `${t.id}:${r.id}`, tipo: 'Pneus',
      descricao: `Recapagem · Fogo #${t.fogo} (${r.ciclo}ª, banda ${r.tipoBanda || '—'})`,
      sub: r.fornecedor || '', total: Number(r.valor), data: r.data,
    });
  }));

  contas.forEach((c) => base.push({
    origem: 'conta', origemId: c.id, tipo: c.tipo || 'Outros', descricao: c.descricao,
    sub: [placa(c.veiculoId), c.fornecedor].filter(Boolean).join(' · '),
    total: Number(c.valor) || 0, data: c.data,
  }));

  const out: ItemFinanceiro[] = [];
  base.filter((item) => item.total > 0).forEach((item) => {
    const plan = pagamentos.find((p) => p.origem === item.origem && p.origemId === item.origemId);
    const parcelado = plan?.forma === 'parcelado';
    const count = parcelado ? Math.max(2, Math.min(48, Number(plan?.parcelas) || 2)) : 1;
    const firstDue = plan?.vencimento || item.data;
    splitInstallments(item.total, count).forEach((valor, index) => out.push({
      key: `${item.origem}:${item.origemId}:${index}`,
      origem: item.origem,
      origemId: item.origemId,
      idx: index,
      tipo: item.tipo,
      descricao: item.descricao,
      sub: item.sub,
      total: item.total,
      forma: parcelado ? 'parcelado' : 'avista',
      parcelas: count,
      numParcela: index + 1,
      valor,
      primeiroVenc: firstDue,
      vencimento: addMonthsISO(firstDue, index),
      pagoEm: plan?.pagas?.[index] || (item.paga ? item.data : null),
    }));
  });
  return out;
}
