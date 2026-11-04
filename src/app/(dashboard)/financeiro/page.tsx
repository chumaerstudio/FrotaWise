'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Disc,
  DollarSign,
  Fuel,
  Pencil,
  Plus,
  Trash2,
  Undo2,
  Wallet,
  Wrench,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatDec, formatNumber } from '@/services/api';
import {
  addMonthsISO,
  buildPayables,
  daysBetween,
  formatDateBR,
  formatDateShort,
  localToday,
  splitInstallments,
  TIPOS_FINANCEIRO,
  type ItemFinanceiro,
} from '@/services/financeiroLocal';
import {
  Btn,
  Chip,
  Empty,
  Field,
  FormActions,
  Kpi,
  Modal,
  SectionHead,
} from '@/components/ui';
import type { ContaPagar, PagamentoPlano, TipoFinanceiro } from '@/types/frotawise';

const TONE: Record<TipoFinanceiro, 'teal' | 'blue' | 'red' | 'amber' | 'gray'> = {
  Abastecimento: 'teal',
  Manutenção: 'blue',
  Multa: 'red',
  Pneus: 'amber',
  Outros: 'gray',
};

const ICON: Record<TipoFinanceiro, React.ElementType> = {
  Abastecimento: Fuel,
  Manutenção: Wrench,
  Multa: AlertTriangle,
  Pneus: Disc,
  Outros: DollarSign,
};

const EMPTY_CONTA = () => ({
  tipo: 'Outros' as TipoFinanceiro,
  veiculoId: '',
  descricao: '',
  fornecedor: '',
  valor: '',
  forma: 'avista' as 'avista' | 'parcelado',
  parcelas: '2',
  vencimento: localToday(),
});

const monthLabel = (ym: string) => {
  const [year, month] = ym.split('-').map(Number);
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(year, month - 1, 1));
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} / ${year}`;
};

export default function FinanceiroPage() {
  const {
    vehicles,
    tires,
    maintenances,
    fines,
    setFines,
    fuelings,
    pagamentos,
    setPagamentos,
    contas,
    setContas,
    showToast,
    liveMode,
  } = useEstoquePneus();

  const [periodo, setPeriodo] = useState('todos');
  const [abaAvisos, setAbaAvisos] = useState<'vencidos' | 'pagos'>('vencidos');
  const [expandirAvisos, setExpandirAvisos] = useState(false);
  const [payEdit, setPayEdit] = useState<Pick<ItemFinanceiro, 'origem' | 'origemId' | 'tipo' | 'descricao' | 'total'> | null>(null);
  const [payForm, setPayForm] = useState({ forma: 'avista' as 'avista' | 'parcelado', parcelas: '2', vencimento: '' });
  const [contaAberta, setContaAberta] = useState(false);
  const [editingContaId, setEditingContaId] = useState<string | null>(null);
  const [contaForm, setContaForm] = useState(EMPTY_CONTA());

  const finItems = useMemo(
    () => buildPayables({ fuelings, maintenances, fines, tires, vehicles, pagamentos, contas }),
    [fuelings, maintenances, fines, tires, vehicles, pagamentos, contas]
  );

  const upsertPlan = (
    origem: PagamentoPlano['origem'],
    origemId: string,
    patch: Partial<Omit<PagamentoPlano, 'id' | 'origem' | 'origemId'>>
  ) => {
    setPagamentos((prev) => {
      const index = prev.findIndex((p) => p.origem === origem && p.origemId === origemId);
      if (index < 0) {
        const item: PagamentoPlano = {
          id: `pg-${Date.now()}`,
          origem,
          origemId,
          forma: 'avista',
          parcelas: 1,
          vencimento: '',
          pagas: {},
          ...patch,
        };
        return [...prev, item];
      }
      return prev.map((p, i) => (i === index ? { ...p, ...patch } : p));
    });
  };

  const planOf = (item: Pick<ItemFinanceiro, 'origem' | 'origemId'>) =>
    pagamentos.find((p) => p.origem === item.origem && p.origemId === item.origemId);

  const payItem = (item: ItemFinanceiro) => {
    const plan = planOf(item);
    upsertPlan(item.origem, item.origemId, {
      pagas: { ...(plan?.pagas || {}), [item.idx]: localToday() },
    });
    if (item.origem === 'multa') {
      const related = finItems.filter((x) => x.origem === 'multa' && x.origemId === item.origemId);
      const allOtherPaid = related.every((x) => x.idx === item.idx || !!x.pagoEm);
      if (allOtherPaid) {
        setFines((prev) => prev.map((f) => (f.id === item.origemId ? { ...f, status: 'Paga' } : f)));
      }
    }
    showToast(`Baixa registrada: ${item.tipo} · ${formatCurrency(item.valor)}.`);
  };

  const undoPayItem = (item: ItemFinanceiro) => {
    const paid = { ...(planOf(item)?.pagas || {}) };
    delete paid[String(item.idx)];
    upsertPlan(item.origem, item.origemId, { pagas: paid });
    if (item.origem === 'multa') {
      setFines((prev) => prev.map((f) => (f.id === item.origemId && f.status === 'Paga' ? { ...f, status: 'Pendente' } : f)));
    }
    showToast('Baixa desfeita: o pagamento voltou a ficar pendente.');
  };

  const openPayEdit = (item: ItemFinanceiro) => {
    setPayEdit({
      origem: item.origem,
      origemId: item.origemId,
      tipo: item.tipo,
      descricao: item.descricao,
      total: item.total,
    });
    setPayForm({
      forma: item.forma,
      parcelas: item.forma === 'parcelado' ? String(item.parcelas) : '2',
      vencimento: item.primeiroVenc,
    });
  };

  const openContaModal = (id?: string) => {
    if (!id) {
      setEditingContaId(null);
      setContaForm(EMPTY_CONTA());
      setContaAberta(true);
      return;
    }
    const conta = contas.find((c) => c.id === id);
    if (!conta) return;
    const plan = pagamentos.find((p) => p.origem === 'conta' && p.origemId === id);
    setEditingContaId(id);
    setContaForm({
      tipo: conta.tipo || 'Outros',
      veiculoId: conta.veiculoId || '',
      descricao: conta.descricao,
      fornecedor: conta.fornecedor || '',
      valor: String(conta.valor),
      forma: plan?.forma === 'parcelado' ? 'parcelado' : 'avista',
      parcelas: String(plan?.forma === 'parcelado' ? plan.parcelas : 2),
      vencimento: plan?.vencimento || conta.data,
    });
    setContaAberta(true);
  };

  const saveConta = (event: React.FormEvent) => {
    event.preventDefault();
    const valor = Number(contaForm.valor);
    if (!contaForm.descricao.trim() || !(valor > 0) || !contaForm.vencimento) return;
    const parcelado = contaForm.forma === 'parcelado';
    const parcelas = parcelado ? Math.round(Number(contaForm.parcelas)) : 1;
    if (parcelado && !(parcelas >= 2 && parcelas <= 48)) {
      showToast('Informe de 2 a 48 parcelas.', 'error');
      return;
    }

    const dados = {
      tipo: contaForm.tipo,
      veiculoId: contaForm.veiculoId,
      descricao: contaForm.descricao.trim(),
      fornecedor: contaForm.fornecedor.trim(),
      valor,
    };
    const plano = {
      forma: parcelado ? 'parcelado' as const : 'avista' as const,
      parcelas,
      vencimento: contaForm.vencimento,
    };

    if (editingContaId) {
      setContas((prev) => prev.map((c) => (c.id === editingContaId ? { ...c, ...dados } : c)));
      const current = pagamentos.find((p) => p.origem === 'conta' && p.origemId === editingContaId);
      upsertPlan('conta', editingContaId, {
        ...plano,
        pagas: Object.fromEntries(Object.entries(current?.pagas || {}).filter(([index]) => Number(index) < parcelas)),
      });
      showToast('Conta a pagar atualizada!');
    } else {
      const id = `ct-${Date.now()}`;
      const item: ContaPagar = { id, ...dados, data: localToday() };
      setContas((prev) => [...prev, item]);
      upsertPlan('conta', id, { ...plano, pagas: {} });
      showToast(parcelado ? `Conta lançada em ${parcelas} parcelas.` : 'Conta a pagar lançada!');
    }
    setContaAberta(false);
    setEditingContaId(null);
    setContaForm(EMPTY_CONTA());
  };

  const deleteConta = (id: string) => {
    const conta = contas.find((c) => c.id === id);
    if (!conta || !window.confirm(`Excluir a conta "${conta.descricao}" (${formatCurrency(conta.valor)})? Todas as parcelas serão removidas.`)) return;
    setContas((prev) => prev.filter((c) => c.id !== id));
    setPagamentos((prev) => prev.filter((p) => !(p.origem === 'conta' && p.origemId === id)));
    showToast('Conta excluída.');
  };

  const savePayEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!payEdit || !payForm.vencimento) return;
    const parcelado = payForm.forma === 'parcelado';
    const parcelas = parcelado ? Math.round(Number(payForm.parcelas)) : 1;
    if (parcelado && !(parcelas >= 2 && parcelas <= 48)) {
      showToast('Informe de 2 a 48 parcelas.', 'error');
      return;
    }
    const current = pagamentos.find((p) => p.origem === payEdit.origem && p.origemId === payEdit.origemId);
    upsertPlan(payEdit.origem, payEdit.origemId, {
      forma: parcelado ? 'parcelado' : 'avista',
      parcelas,
      vencimento: payForm.vencimento,
      pagas: Object.fromEntries(Object.entries(current?.pagas || {}).filter(([index]) => Number(index) < parcelas)),
    });
    setPayEdit(null);
    showToast('Pagamento atualizado!');
  };

  if (liveMode) {
    return (
      <div className="card p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Wallet size={24} style={{ color: 'var(--blue-ink)' }} />
          <h2 className="disp ef-t20 font-semibold">Financeiro</h2>
        </div>
        <Chip tone="amber">Integração com o servidor ainda não disponível</Chip>
        <p className="ef-t13" style={{ color: 'var(--ink2)' }}>
          O módulo financeiro da atualização 3.9.0 utiliza armazenamento local do navegador. Como este ambiente está conectado à API, os pagamentos e contas não seriam sincronizados com o servidor. Para evitar registros que pareçam salvos mas não estejam compartilhados, esta tela fica desabilitada no modo API.
        </p>
      </div>
    );
  }

  const hoje = localToday();
  const periodos = [...new Set([
    hoje.slice(0, 7),
    ...finItems.map((item) => item.vencimento.slice(0, 7)),
    ...finItems.filter((item) => item.pagoEm).map((item) => (item.pagoEm as string).slice(0, 7)),
  ])].sort().reverse();
  const noPeriodo = (iso: string) => periodo === 'todos' || String(iso).slice(0, 7) === periodo;
  const itens = finItems.filter((item) => (item.pagoEm ? noPeriodo(item.pagoEm) : noPeriodo(item.vencimento)));
  const ordenar = (a: ItemFinanceiro, b: ItemFinanceiro) =>
    a.vencimento < b.vencimento ? -1 : a.vencimento > b.vencimento ? 1 : a.tipo.localeCompare(b.tipo);
  const aVencer = itens.filter((item) => !item.pagoEm && item.vencimento >= hoje).sort(ordenar);
  const vencidos = itens.filter((item) => !item.pagoEm && item.vencimento < hoje).sort(ordenar);
  const pagos = itens.filter((item) => item.pagoEm).sort((a, b) =>
    (a.pagoEm as string) < (b.pagoEm as string) ? 1 : (a.pagoEm as string) > (b.pagoEm as string) ? -1 : b.valor - a.valor
  );
  const soma = (list: ItemFinanceiro[]) => list.reduce((sum, item) => sum + item.valor, 0);
  const resumo = TIPOS_FINANCEIRO.map((tipo) => {
    const lista = itens.filter((item) => item.tipo === tipo);
    const av = lista.filter((item) => !item.pagoEm && item.vencimento >= hoje);
    const vc = lista.filter((item) => !item.pagoEm && item.vencimento < hoje);
    const pg = lista.filter((item) => !!item.pagoEm);
    return { tipo, av: soma(av), vc: soma(vc), pg: soma(pg), total: soma(lista), qtd: lista.length };
  }).filter((row) => row.tipo !== 'Outros' || row.qtd > 0);
  const total = resumo.reduce((acc, row) => ({
    av: acc.av + row.av,
    vc: acc.vc + row.vc,
    pg: acc.pg + row.pg,
    geral: acc.geral + row.total,
    qtd: acc.qtd + row.qtd,
  }), { av: 0, vc: 0, pg: 0, geral: 0, qtd: 0 });
  const listaAvisos = abaAvisos === 'vencidos' ? vencidos : pagos;

  const detail = (item: ItemFinanceiro) =>
    `${item.forma === 'parcelado' ? `Parcela ${item.numParcela}/${item.parcelas}` : 'À vista'}${item.sub ? ` · ${item.sub}` : ''}`;

  const actionsFor = (item: ItemFinanceiro, isPaid = false) => (
    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
      {isPaid ? (
        <Btn sm className="btn-pill btn-oblue" icon={Undo2} onClick={() => undoPayItem(item)}>Desfazer</Btn>
      ) : (
        <>
          <Btn sm v="primary" className="btn-pill" onClick={() => payItem(item)}>Dar baixa</Btn>
          <Btn sm className="btn-pill btn-oblue" icon={Pencil} title="Editar pagamento" aria-label="Editar pagamento" onClick={() => openPayEdit(item)} />
          {item.origem === 'conta' && <Btn sm className="btn-pill ef-del" icon={Trash2} title="Excluir conta" aria-label="Excluir conta" onClick={() => deleteConta(item.origemId)} />}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="ef-fin-top">
        <div className="flex items-center gap-3">
          <span className="ef-tile" style={{ background: 'linear-gradient(135deg,#0B2342,#1F5AA6)' }}><Wallet size={21} /></span>
          <div>
            <div className="disp" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>Acompanhe seus pagamentos</div>
            <div style={{ fontSize: 13, color: 'var(--mute)' }}>Contas a pagar, vencimentos e baixas em um só lugar</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="ef-period">
            <Calendar size={16} />
            <select aria-label="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="todos">Todos os períodos</option>
              {periodos.map((ym) => <option key={ym} value={ym}>{monthLabel(ym)}</option>)}
            </select>
          </label>
          <Btn v="primary" className="btn-pill" icon={Plus} onClick={() => openContaModal()}>Lançar conta a pagar</Btn>
        </div>
      </div>

      <div className="ef-g-kpi">
        <Kpi label="Total a pagar" value={soma(aVencer) + soma(vencidos)} fmt={formatCurrency} icon={DollarSign} tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }} sub="A vencer + vencido" delay={0} />
        <Kpi label="Total pago" value={soma(pagos)} fmt={formatCurrency} icon={CheckCircle2} tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal-ink)' }} sub="Baixas registradas" delay={70} />
        <Kpi label="Total vencido" value={soma(vencidos)} fmt={formatCurrency} icon={AlertTriangle} tone={{ bg: 'var(--red-soft)', fg: 'var(--red-ink)' }} sub={`${vencidos.length} parcela(s) em atraso`} delay={140} />
        <Kpi label="Lançamentos" value={itens.length} fmt={(n) => formatNumber(Math.round(n))} icon={Calendar} tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }} sub="Parcelas no período" delay={210} />
      </div>

      <div className="card overflow-hidden ef-rise">
        <SectionHead title="Pagamentos a vencer" sub="Inclui abastecimentos, manutenções e multas integradas, reformas de pneus e contas avulsas.">
          <Chip tone="teal">{aVencer.length} pagamento(s) · {formatCurrency(soma(aVencer))}</Chip>
        </SectionHead>
        {aVencer.length === 0 ? (
          <Empty icon={CheckCircle2} title="Nenhum pagamento a vencer" text="Os lançamentos integrados aparecem aqui. Use o botão acima para incluir uma conta avulsa." />
        ) : (
          <div className="overflow-x-auto" style={{ padding: '10px 10px 12px' }}>
            <table className="tbl ef-pillhead">
              <thead><tr><th>Tipo</th><th>Descrição</th><th className="ef-tr">Valor</th><th>Vencimento</th><th>Forma</th><th className="ef-tc">Parcelas</th><th className="ef-tr">Ações</th></tr></thead>
              <tbody>
                {aVencer.map((item) => {
                  const Icon = ICON[item.tipo];
                  const dias = daysBetween(hoje, item.vencimento);
                  return (
                    <tr key={item.key} style={item.vencimento === hoje ? { background: 'rgba(242,176,30,.12)' } : undefined}>
                      <td><span className="flex items-center gap-2"><span className="ef-ticon" style={{ background: 'var(--soft)', color: 'var(--ink2)', width: 34, height: 34, borderRadius: 10 }}><Icon size={17} /></span><span className="font-semibold">{item.tipo}</span></span></td>
                      <td style={{ minWidth: 190, maxWidth: 340 }}><div className="font-semibold">{item.descricao}</div>{item.sub && <div className="ef-t12" style={{ color: 'var(--blue-ink)' }}>{item.sub}</div>}</td>
                      <td className="mono text-right font-bold">{formatCurrency(item.valor)}{item.forma === 'parcelado' && <div className="ef-t11_5 font-normal" style={{ color: 'var(--mute)' }}>Total {formatCurrency(item.total)}</div>}</td>
                      <td className="mono">{formatDateBR(item.vencimento)}<div className="ef-sans ef-t11_5" style={{ color: item.vencimento === hoje ? 'var(--amber-ink)' : 'var(--mute)' }}>{dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `em ${dias} dias`}</div></td>
                      <td>{item.forma === 'parcelado' ? 'Parcelado' : 'À vista'}</td>
                      <td className="mono ef-tc">{item.forma === 'parcelado' ? `${item.numParcela} de ${item.parcelas}` : '—'}</td>
                      <td>{actionsFor(item)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ef-g-fin">
        <div className="card overflow-hidden ef-rise">
          <div className="ef-band">
            <span className="ef-tile ef-tile-glass"><DollarSign size={21} /></span>
            <div className="min-w-0"><h3>Resumo por categoria</h3><p>Valores em R$ por situação do pagamento</p></div>
            <svg className="ef-wave" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 100C70 30 130 96 196 46S280 8 300 0V100Z" fill="rgba(255,255,255,.10)" /></svg>
          </div>
          <div className="ef-band-body overflow-x-auto">
            <table className="tbl ef-compact ef-pillhead">
              <thead><tr><th>Categoria</th><th className="ef-tr">A vencer</th><th className="ef-tr">Vencido</th><th className="ef-tr">Pago</th><th className="ef-tr">Total</th></tr></thead>
              <tbody>
                {resumo.map((row) => {
                  const Icon = ICON[row.tipo];
                  return (
                    <tr key={row.tipo}>
                      <td><span className="flex items-center gap-2"><span className="ef-ticon" style={{ background: 'var(--soft)', color: 'var(--ink2)', width: 34, height: 34, borderRadius: 10 }}><Icon size={17} /></span><span><b>{row.tipo}</b><span className="block ef-t11_5" style={{ color: 'var(--mute)' }}>{row.qtd} pagamento(s)</span></span></span></td>
                      <td className="mono text-right">{row.av > 0 ? formatDec(row.av) : '—'}</td>
                      <td className="mono text-right" style={{ color: row.vc > 0 ? 'var(--red)' : undefined, fontWeight: row.vc > 0 ? 700 : undefined }}>{row.vc > 0 ? formatDec(row.vc) : '—'}</td>
                      <td className="mono text-right" style={{ color: row.pg > 0 ? 'var(--teal)' : undefined, fontWeight: row.pg > 0 ? 700 : undefined }}>{row.pg > 0 ? formatDec(row.pg) : '—'}</td>
                      <td className="mono text-right font-bold">{row.total > 0 ? formatDec(row.total) : '—'}</td>
                    </tr>
                  );
                })}
                <tr className="ef-total">
                  <td><b>Total geral</b><span className="block ef-t11_5" style={{ color: 'var(--mute)' }}>{total.qtd} pagamento(s)</span></td>
                  <td className="mono text-right font-bold">{formatDec(total.av)}</td>
                  <td className="mono text-right font-bold" style={{ color: total.vc > 0 ? 'var(--red)' : undefined }}>{formatDec(total.vc)}</td>
                  <td className="mono text-right font-bold">{formatDec(total.pg)}</td>
                  <td className="mono text-right font-bold">{formatDec(total.geral)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden ef-rise">
          <div className="ef-cardhead" style={{ borderBottom: 0 }}>
            <span className="ef-tile" style={{ background: 'linear-gradient(135deg,#1F5AA6,#3B82F6)' }}><Bell size={20} /></span>
            <div className="min-w-0 flex-1"><h3>Avisos de pagamento</h3><p>Vencidos e pagos, separados e ordenados por data</p></div>
            <Btn className="btn-pill btn-oblue" onClick={() => setExpandirAvisos((prev) => !prev)}>{expandirAvisos ? 'Ver menos' : 'Ver todos'}<ChevronRight size={14} /></Btn>
          </div>
          <div className="ef-seltiles">
            <button type="button" aria-pressed={abaAvisos === 'vencidos'} className={`ef-seltile ef-seltile-red ${abaAvisos === 'vencidos' ? 'on' : ''}`} onClick={() => setAbaAvisos('vencidos')}>
              <span className="ef-circle" style={{ background: 'var(--red)' }}>!</span>
              <span className="ef-seltile-txt"><b style={{ color: 'var(--red-ink)' }}>Vencidos</b><span>{vencidos.length} pagamento(s)</span></span>
              <span className="ef-seltile-val mono" style={{ color: 'var(--red)' }}>{formatCurrency(soma(vencidos))}</span>
            </button>
            <button type="button" aria-pressed={abaAvisos === 'pagos'} className={`ef-seltile ef-seltile-green ${abaAvisos === 'pagos' ? 'on' : ''}`} onClick={() => setAbaAvisos('pagos')}>
              <span className="ef-circle" style={{ background: 'var(--brand)' }}><CheckCircle2 size={20} /></span>
              <span className="ef-seltile-txt"><b style={{ color: 'var(--teal-ink)' }}>Pagos</b><span>{pagos.length} pagamento(s)</span></span>
              <span className="ef-seltile-val mono" style={{ color: 'var(--teal)' }}>{formatCurrency(soma(pagos))}</span>
            </button>
          </div>
          {listaAvisos.length === 0 ? (
            <div className="px-5 py-4" style={{ color: 'var(--mute)' }}>{abaAvisos === 'vencidos' ? 'Nenhum pagamento vencido.' : 'Nenhum pagamento baixado ainda.'}</div>
          ) : (
            <div className="ef-fin-wrap" style={{ margin: '8px 10px 12px', maxHeight: expandirAvisos ? 'none' : 262 }}>
              <table className="tbl ef-fin ef-pillhead">
                <thead><tr><th>Descrição</th><th>{abaAvisos === 'vencidos' ? 'Vencimento' : 'Pago em'}</th><th className="ef-tr">Valor</th><th className="ef-tr">Ações</th></tr></thead>
                <tbody>
                  {listaAvisos.map((item) => {
                    const Icon = ICON[item.tipo];
                    return (
                      <tr key={item.key}>
                        <td><span className="flex items-center gap-2" style={{ minWidth: 0 }}><span className="ef-ticon" style={{ background: 'var(--soft)', color: 'var(--ink2)', width: 36, height: 36, borderRadius: 10 }}><Icon size={17} /></span><span style={{ minWidth: 0, flex: 1 }}><span className="ef-ell font-semibold" title={item.descricao}>{item.descricao}</span><span className="ef-ell ef-t12" style={{ color: 'var(--blue-ink)' }} title={`${item.tipo} · ${detail(item)}`}>{item.tipo} · {detail(item)}</span></span></span></td>
                        {abaAvisos === 'vencidos' ? (
                          <td className="mono">{formatDateBR(item.vencimento)}<div className="ef-sans ef-t11_5" style={{ color: 'var(--red)' }}>{`há ${daysBetween(item.vencimento, hoje)} dia(s)`}</div></td>
                        ) : (
                          <td className="mono">{formatDateBR(item.pagoEm)}<div className="ef-sans ef-t11_5" style={{ color: 'var(--mute)' }}>venc. {formatDateShort(item.vencimento)}</div></td>
                        )}
                        <td className="mono text-right font-bold">{formatCurrency(item.valor)}</td>
                        <td>{actionsFor(item, abaAvisos === 'pagos')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {payEdit && (
        <Modal title="Editar plano de pagamento" onClose={() => setPayEdit(null)} wide>
          <form onSubmit={savePayEdit} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2"><Chip tone={TONE[payEdit.tipo]}>{payEdit.tipo}</Chip><b>{payEdit.descricao}</b></div>
            <div className="ef-t13" style={{ color: 'var(--mute)' }}>Valor total: <b className="mono">{formatCurrency(payEdit.total)}</b></div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Forma de pagamento">
                <select className="inp" value={payForm.forma} onChange={(e) => setPayForm({ ...payForm, forma: e.target.value as 'avista' | 'parcelado' })}>
                  <option value="avista">À vista</option><option value="parcelado">Parcelado</option>
                </select>
              </Field>
              <Field label="Quantidade de parcelas">
                <input type="number" min="2" max="48" disabled={payForm.forma !== 'parcelado'} className="inp mono" value={payForm.forma === 'parcelado' ? payForm.parcelas : 1} onChange={(e) => setPayForm({ ...payForm, parcelas: e.target.value })} />
              </Field>
            </div>
            <Field label={payForm.forma === 'parcelado' ? 'Vencimento da 1ª parcela' : 'Vencimento'}>
              <input type="date" required className="inp" value={payForm.vencimento} onChange={(e) => setPayForm({ ...payForm, vencimento: e.target.value })} />
            </Field>
            {payForm.vencimento && Number(payEdit.total) > 0 && (
              <div className="rounded-lg p-3 ef-t12_5 space-y-1" style={{ background: 'var(--card2)', color: 'var(--ink2)' }}>
                {splitInstallments(payEdit.total, payForm.forma === 'parcelado' ? Math.max(2, Math.min(48, Number(payForm.parcelas) || 2)) : 1).slice(0, 6).map((value, index, values) => (
                  <div key={index} className="flex justify-between"><span>{values.length > 1 ? `Parcela ${index + 1}/${payForm.parcelas} · ${formatDateBR(addMonthsISO(payForm.vencimento, index))}` : `À vista · ${formatDateBR(payForm.vencimento)}`}</span><b className="mono">{formatCurrency(value)}</b></div>
                ))}
              </div>
            )}
            <FormActions onCancel={() => setPayEdit(null)} label="Salvar plano" v="primary" />
          </form>
        </Modal>
      )}

      {contaAberta && (
        <Modal title={editingContaId ? 'Editar conta a pagar' : 'Lançar conta a pagar'} onClose={() => { setContaAberta(false); setEditingContaId(null); setContaForm(EMPTY_CONTA()); }} wide>
          <form onSubmit={saveConta} className="space-y-3">
            <Field label="Categoria">
              <select className="inp" value={contaForm.tipo} onChange={(e) => setContaForm({ ...contaForm, tipo: e.target.value as TipoFinanceiro })}>
                {TIPOS_FINANCEIRO.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </Field>
            <Field label="Veículo (opcional)">
              <select className="inp" value={contaForm.veiculoId} onChange={(e) => setContaForm({ ...contaForm, veiculoId: e.target.value })}>
                <option value="">Sem vínculo com veículo</option>
                {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.placa} — {vehicle.modelo}</option>)}
              </select>
            </Field>
            <Field label="Descrição da conta"><input required className="inp" value={contaForm.descricao} onChange={(e) => setContaForm({ ...contaForm, descricao: e.target.value })} /></Field>
            <Field label="Fornecedor / favorecido (opcional)"><input className="inp" value={contaForm.fornecedor} onChange={(e) => setContaForm({ ...contaForm, fornecedor: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor total (R$)"><input type="number" min="0.01" step="0.01" required className="inp mono" value={contaForm.valor} onChange={(e) => setContaForm({ ...contaForm, valor: e.target.value })} /></Field>
              <Field label="Forma de pagamento"><select className="inp" value={contaForm.forma} onChange={(e) => setContaForm({ ...contaForm, forma: e.target.value as 'avista' | 'parcelado' })}><option value="avista">À vista</option><option value="parcelado">Parcelado</option></select></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantidade de parcelas"><input type="number" min="2" max="48" disabled={contaForm.forma !== 'parcelado'} className="inp mono" value={contaForm.forma === 'parcelado' ? contaForm.parcelas : 1} onChange={(e) => setContaForm({ ...contaForm, parcelas: e.target.value })} /></Field>
              <Field label={contaForm.forma === 'parcelado' ? 'Vencimento da 1ª parcela' : 'Vencimento'}><input type="date" required className="inp" value={contaForm.vencimento} onChange={(e) => setContaForm({ ...contaForm, vencimento: e.target.value })} /></Field>
            </div>
            {contaForm.vencimento && Number(contaForm.valor) > 0 && (
              <div className="rounded-lg p-3 ef-t12_5 space-y-1" style={{ background: 'var(--card2)', color: 'var(--ink2)' }}>
                {splitInstallments(Number(contaForm.valor), contaForm.forma === 'parcelado' ? Math.max(2, Math.min(48, Number(contaForm.parcelas) || 2)) : 1).slice(0, 6).map((value, index, values) => (
                  <div key={index} className="flex justify-between"><span>{values.length > 1 ? `Parcela ${index + 1}/${contaForm.parcelas} · ${formatDateBR(addMonthsISO(contaForm.vencimento, index))}` : `À vista · ${formatDateBR(contaForm.vencimento)}`}</span><b className="mono">{formatCurrency(value)}</b></div>
                ))}
              </div>
            )}
            <FormActions onCancel={() => { setContaAberta(false); setEditingContaId(null); setContaForm(EMPTY_CONTA()); }} label={editingContaId ? 'Salvar alterações' : 'Salvar conta'} v="primary" />
          </form>
        </Modal>
      )}
    </div>
  );
}
