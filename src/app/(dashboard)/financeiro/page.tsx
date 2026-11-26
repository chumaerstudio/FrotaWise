'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { httpClient } from '@/lib/http/client';
import { accountPayload, api39Error, createAccount, planPayload, savePlan } from '@/services/operacional39Service';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Disc,
  DollarSign,
  Fuel,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Undo2,
  Wallet,
  Wrench,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
import { totalItensViagem, totalDespesasViagem } from '@/services/viagensService';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';

const TONE: Record<TipoFinanceiro, 'teal' | 'blue' | 'red' | 'amber' | 'gray'> = {
  Abastecimento: 'teal',
  Manutenção: 'blue',
  Multa: 'red',
  Pneus: 'amber',
  'Custo Fixo': 'blue',
  Outros: 'gray',
};

const ICON: Record<TipoFinanceiro, React.ElementType> = {
  Abastecimento: Fuel,
  Manutenção: Wrench,
  Multa: AlertTriangle,
  Pneus: Disc,
  'Custo Fixo': Calendar,
  Outros: DollarSign,
};

const EMPTY_CONTA = () => ({
  tipo: 'Outros' as TipoFinanceiro,
  veiculoId: '',
  descricao: '',
  fornecedor: '',
  valor: '',
  forma: 'avista' as 'avista' | 'parcelado',
  meioPagamento: 'Boleto',
  parcelas: '2',
  vencimento: localToday(),
});

const monthLabel = (ym: string) => {
  const [year, month] = ym.split('-').map(Number);
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(year, month - 1, 1));
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} / ${year}`;
};

export default function FinanceiroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    vehicles,
    trips,
    tires,
    maintenances,
    fines,
    setFines,
    fuelings,
    pagamentos,
    setPagamentos,
    contas,
    setContas,
    custosFixos,
    showToast,
    liveMode, runLiveMutation, refreshLiveData,
  } = useEstoquePneus();

  const [periodo, setPeriodo] = useState('todos');
  const [abaAvisos, setAbaAvisos] = useState<'vencidos' | 'pagos'>('vencidos');
  const [expandirAvisos, setExpandirAvisos] = useState(false);
  const [payEdit, setPayEdit] = useState<Pick<ItemFinanceiro, 'origem' | 'origemId' | 'tipo' | 'descricao' | 'total'> | null>(null);
  const [payForm, setPayForm] = useState({ forma: 'avista' as 'avista' | 'parcelado', meioPagamento: 'Boleto', parcelas: '2', vencimento: '' });
  const [contaAberta, setContaAberta] = useState(false);
  const [editingContaId, setEditingContaId] = useState<string | null>(null);
  const [contaForm, setContaForm] = useState(EMPTY_CONTA());
  const [contaCreateKey, setContaCreateKey] = useState('');
  const [savingConta, setSavingConta] = useState(false);
  const [deletingConta, setDeletingConta] = useState<ContaPagar | null>(null);
  const [confirmPayment, setConfirmPayment] = useState<ItemFinanceiro | null>(null);
  const [detailPayment, setDetailPayment] = useState<ItemFinanceiro | null>(null);
  const handledPayment = useRef('');

  const finItems = useMemo(
    () => buildPayables({ fuelings, maintenances, fines, tires, vehicles, pagamentos, contas, custosFixos }),
    [fuelings, maintenances, fines, tires, vehicles, pagamentos, contas, custosFixos]
  );

  // A prioridade da tela inicial aponta para uma parcela exata, não só para a aba.
  const paymentKey = searchParams.get('pagamento');
  useEffect(() => {
    if (!paymentKey || paymentKey === handledPayment.current) return;
    const item = finItems.find(record => record.key === paymentKey && !record.pagoEm);
    if (!item) return;
    handledPayment.current = paymentKey;
    setPeriodo('todos');
    setConfirmPayment(item);
  }, [paymentKey, finItems]);
  const closePayment = () => {
    setConfirmPayment(null);
    if (paymentKey) router.replace('/financeiro', { scroll: false });
  };

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
    if (liveMode) {
      const next = {
        origem: item.origem, origemId: item.origemId,
        forma: plan?.forma ?? item.forma, parcelas: plan?.parcelas ?? item.parcelas,
        vencimento: plan?.vencimento || item.primeiroVenc,
        pagas: { ...(plan?.pagas || {}), [String(item.idx)]: localToday() },
      };
      return runLiveMutation('put', '/financeiro/pagamentos', planPayload(next), 'Pagamento confirmado.');
    }
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
    const plan = planOf(item);
    if (liveMode && !plan) {
      showToast('Este lançamento foi marcado como pago fora do Financeiro. Regularize o status na origem.', 'error');
      return;
    }
    const paid = { ...(plan?.pagas || {}) };
    delete paid[String(item.idx)];
    if (liveMode && plan) {
      // O backend exige ADMIN para estorno/correção de uma parcela já paga.
      return runLiveMutation('put', '/financeiro/pagamentos', planPayload({
        origem: plan.origem, origemId: plan.origemId, forma: plan.forma,
        parcelas: plan.parcelas, vencimento: plan.vencimento, pagas: paid,
      }), 'Pagamento desfeito.');
    }
    upsertPlan(item.origem, item.origemId, { pagas: paid });
    if (item.origem === 'multa') {
      setFines((prev) => prev.map((f) => (f.id === item.origemId && f.status === 'Paga' ? { ...f, status: 'Pendente' } : f)));
    }
    showToast('Baixa desfeita: o pagamento voltou a ficar pendente.');
  };

  const openPayEdit = (item: ItemFinanceiro) => {
    const current = planOf(item);
    setPayEdit({
      origem: item.origem,
      origemId: item.origemId,
      tipo: item.tipo,
      descricao: item.descricao,
      total: item.total,
    });
    setPayForm({
      forma: item.forma,
      meioPagamento: current?.meioPagamento || 'Boleto',
      parcelas: item.forma === 'parcelado' ? String(item.parcelas) : '2',
      vencimento: item.primeiroVenc,
    });
  };

  const openContaModal = (id?: string) => {
    if (!id) {
      setEditingContaId(null);
      setContaCreateKey(crypto.randomUUID());
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
      meioPagamento: plan?.meioPagamento || 'Boleto',
      parcelas: String(plan?.forma === 'parcelado' ? plan.parcelas : 2),
      vencimento: plan?.vencimento || conta.data,
    });
    setContaAberta(true);
  };

  const saveConta = async (event: React.FormEvent) => {
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
      meioPagamento: contaForm.meioPagamento || 'Boleto',
      parcelas,
      vencimento: contaForm.vencimento,
    };

    if (liveMode) {
      if (savingConta) return;
      setSavingConta(true);
      let contaConfirmada = false;
      let planoConfirmado = false;
      // Cadastro da conta e plano são duas operações HTTP distintas na API.
      // Em caso de falha da segunda, guardamos o ID da conta para um retry sem duplicá-la.
      try {
        const existing = editingContaId ? contas.find((c) => c.id === editingContaId) : null;
        const accountData = { ...dados, data: existing?.data || localToday() };
        let id = editingContaId;
        if (id) {
          await httpClient.put(`/financeiro/contas/${id}`, accountPayload(accountData));
        } else {
          const created = await createAccount(accountData, contaCreateKey);
          id = created.id;
          setEditingContaId(id);
        }
        contaConfirmada = true;
        const current = pagamentos.find((p) => p.origem === 'conta' && p.origemId === id);
        await savePlan({
          origem: 'conta', origemId: id!, ...plano,
          pagas: Object.fromEntries(Object.entries(current?.pagas || {}).filter(([index]) => Number(index) < parcelas)),
        });
        planoConfirmado = true;
        await refreshLiveData();
        showToast('Conta e plano de pagamento salvos com sucesso.');
        setContaAberta(false);
        setEditingContaId(null);
        setContaForm(EMPTY_CONTA());
      } catch (err) {
        // A primeira requisição pode ter sido confirmada. Nunca orientar um novo
        // cadastro indiscriminado: o ID é mantido para uma tentativa segura.
        if (planoConfirmado) showToast('Conta e plano salvos, mas a atualização da tela falhou. Recarregue a página.', 'error');
        else if (contaConfirmada) showToast('A conta foi salva, porém o plano falhou: ' + api39Error(err), 'error');
        else showToast(api39Error(err), 'error');
      } finally {
        setSavingConta(false);
      }
      return;
    }

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
    if (!conta) return;
    if (liveMode) {
      return runLiveMutation('delete', `/financeiro/contas/${id}`, undefined, 'Conta excluída.');
    }
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
    if (liveMode) {
      void runLiveMutation('put', '/financeiro/pagamentos', planPayload({
        origem: payEdit.origem, origemId: payEdit.origemId,
        forma: parcelado ? 'parcelado' : 'avista', meioPagamento: payForm.meioPagamento || 'Boleto', parcelas, vencimento: payForm.vencimento,
        pagas: Object.fromEntries(Object.entries(current?.pagas || {}).filter(([index]) => Number(index) < parcelas)),
      }), 'Plano atualizado.').then((ok) => { if (ok) setPayEdit(null); });
      return;
    }
    upsertPlan(payEdit.origem, payEdit.origemId, {
      forma: parcelado ? 'parcelado' : 'avista',
      meioPagamento: payForm.meioPagamento || 'Boleto',
      parcelas,
      vencimento: payForm.vencimento,
      pagas: Object.fromEntries(Object.entries(current?.pagas || {}).filter(([index]) => Number(index) < parcelas)),
    });
    setPayEdit(null);
    showToast('Pagamento atualizado!');
  };

  const hoje = localToday();
  const isYM = (ym: string) => /^\d{4}-\d{2}$/.test(ym);
  const periodos = [...new Set([
    hoje.slice(0, 7),
    ...finItems.map((item) => String(item.vencimento || '').slice(0, 7)).filter(isYM),
    ...finItems.filter((item) => item.pagoEm).map((item) => String(item.pagoEm || '').slice(0, 7)).filter(isYM),
    ...trips.flatMap(trip => trip.despesas.filter(d => d.origem === 'manual').map(d => d.data.slice(0, 7))).filter(isYM),
    ...trips.map((trip) => String(trip.data || '').slice(0, 7)).filter(isYM),
  ])].sort().reverse();
  const noPeriodo = (iso: string) => periodo === 'todos' || String(iso).slice(0, 7) === periodo;
  const itens = finItems.filter((item) => (item.pagoEm ? noPeriodo(item.pagoEm) : noPeriodo(item.vencimento)));
  const ordenar = (a: ItemFinanceiro, b: ItemFinanceiro) =>
    a.vencimento < b.vencimento ? -1 : a.vencimento > b.vencimento ? 1 : a.tipo.localeCompare(b.tipo);
  const aVencer = itens.filter((item) => !item.pagoEm && item.vencimento >= hoje).sort(ordenar);
  const proximosSeteDias = aVencer.filter(item => daysBetween(hoje, item.vencimento) <= 7);
  const venceHoje = aVencer.filter(item => item.vencimento === hoje);
  const vencidos = itens.filter((item) => !item.pagoEm && item.vencimento < hoje).sort(ordenar);
  const pagos = itens.filter((item) => item.pagoEm).sort((a, b) =>
    (a.pagoEm as string) < (b.pagoEm as string) ? 1 : (a.pagoEm as string) > (b.pagoEm as string) ? -1 : b.valor - a.valor
  );
  const soma = (list: ItemFinanceiro[]) => list.reduce((sum, item) => sum + item.valor, 0);
  const viagensPeriodo = trips.filter((trip) => noPeriodo(trip.data)).sort((a, b) => b.data.localeCompare(a.data) || b.numero - a.numero);
  const faturamentoViagens = viagensPeriodo.reduce((sum, trip) => sum + totalItensViagem(trip), 0);
  const despesasManuaisViagens = trips.reduce((sum, trip) => sum + trip.despesas.filter((expense) => expense.origem === 'manual' && noPeriodo(expense.data)).reduce((partial, expense) => partial + (Number(expense.valor) || 0), 0), 0);
  const despesasFinanceiras = soma(itens) + despesasManuaisViagens;
  const resultadoFinanceiro = faturamentoViagens - despesasFinanceiras;
  const resumo = TIPOS_FINANCEIRO.map((tipo) => {
    const lista = itens.filter((item) => item.tipo === tipo);
    const av = lista.filter((item) => !item.pagoEm && item.vencimento >= hoje);
    const vc = lista.filter((item) => !item.pagoEm && item.vencimento < hoje);
    const pg = lista.filter((item) => !!item.pagoEm);
    return { tipo, av: soma(av), vc: soma(vc), pg: soma(pg), total: soma(lista), qtd: lista.length };
  }).filter((row) => (row.tipo !== 'Outros' && row.tipo !== 'Custo Fixo') || row.qtd > 0);
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
    <div className="ef-fin-actions flex items-center justify-end gap-2 whitespace-nowrap">
      {isPaid ? <Chip tone="teal">Pago</Chip> : <Btn sm v="primary" className="btn-pill" onClick={() => setConfirmPayment(item)}>Marcar como pago</Btn>}
      {item.origem === 'conta' && <Btn sm v="danger" icon={Trash2} title="Excluir conta" aria-label={`Excluir conta ${item.descricao}`} onClick={() => setDeletingConta(contas.find(c => c.id === item.origemId) || null)}>Excluir</Btn>}
      <RowActionsMenu label={`Ações do pagamento ${item.descricao}`} actions={[
        { label: 'Ver detalhes', icon: Eye, onClick: () => setDetailPayment(item) },
        ...(!isPaid ? [{ label: 'Editar pagamento', icon: Pencil, onClick: () => openPayEdit(item) }] : []),
        ...(isPaid ? [{ label: 'Desfazer pagamento', icon: Undo2, onClick: () => undoPayItem(item) }] : []),
        ...(item.origem === 'conta' ? [{ label: 'Excluir conta', icon: Trash2, danger: true, onClick: () => setDeletingConta(contas.find(c => c.id === item.origemId) || null) }] : []),
      ]} />
    </div>
  );

  return (
    <div className="ef-financeiro space-y-5">
      <div className="ef-fin-top">
        <div className="flex items-center gap-3 min-w-0">
          <span className="ef-tile" style={{ background: 'linear-gradient(135deg,#0B2342,#1F5AA6)' }}><Wallet size={21} /></span>
          <div className="min-w-0">
            <h2 className="disp" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>Acompanhe seus pagamentos</h2>
            <p className="ef-t13 mt-1" style={{ color: 'var(--mute)' }}>Contas a pagar, vencimentos e baixas em um só lugar</p>
          </div>
        </div>
        <div className="ef-fin-controls flex items-center gap-3 flex-wrap">
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

      <div className="ef-fin-priorities" aria-label="Prioridades de pagamento">
        <button type="button" className="ef-fin-priority ef-fin-priority-red" onClick={() => { setAbaAvisos('vencidos'); document.getElementById('financeiro-avisos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><span>Vencidos</span><strong>{vencidos.length} parcela{vencidos.length !== 1 ? 's' : ''}</strong><small>{formatCurrency(soma(vencidos))}</small></button>
        <button type="button" className="ef-fin-priority ef-fin-priority-amber" onClick={() => document.getElementById('financeiro-a-vencer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>Vencem hoje</span><strong>{venceHoje.length} parcela{venceHoje.length !== 1 ? 's' : ''}</strong><small>{formatCurrency(soma(venceHoje))}</small></button>
        <button type="button" className="ef-fin-priority" onClick={() => document.getElementById('financeiro-a-vencer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>Próximos 7 dias</span><strong>{proximosSeteDias.length} parcela{proximosSeteDias.length !== 1 ? 's' : ''}</strong><small>{formatCurrency(soma(proximosSeteDias))}</small></button>
      </div>

      <div className="ef-g-kpi ef-fin-kpis">
        <Kpi label="Total a pagar" value={soma(aVencer) + soma(vencidos)} fmt={formatCurrency} icon={DollarSign} tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }} sub="A vencer + vencido" delay={0} />
        <Kpi label="Total pago" value={soma(pagos)} fmt={formatCurrency} icon={CheckCircle2} tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal-ink)' }} sub="Baixas registradas" delay={70} />
        <Kpi label="Total vencido" value={soma(vencidos)} fmt={formatCurrency} icon={AlertTriangle} tone={{ bg: 'var(--red-soft)', fg: 'var(--red-ink)' }} sub={`${vencidos.length} parcela(s) em atraso`} delay={140} />
        <Kpi label="Lançamentos" value={itens.length} fmt={(n) => formatNumber(Math.round(n))} icon={Calendar} tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }} sub="Parcelas no período" delay={210} />
      </div>

      <div className="card p-4 space-y-3 ef-rise">
        <SectionHead title="Lucro e despesas do período" sub="Faturamento informado nas viagens menos as despesas lançadas no Financeiro." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ef-fin-kpis">
          <Kpi label="Faturamento das viagens" value={faturamentoViagens} fmt={formatCurrency} icon={DollarSign} tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal-ink)' }} sub={`${viagensPeriodo.length} viagem(ns) no período`} />
          <Kpi label="Despesas financeiras" value={despesasFinanceiras} fmt={formatCurrency} icon={Wallet} tone={{ bg: 'var(--red-soft)', fg: 'var(--red-ink)' }} sub="Contas, parcelas, lançamentos e despesas manuais das viagens" />
          <Kpi label="Resultado (lucro)" value={resultadoFinanceiro} fmt={formatCurrency} icon={CheckCircle2} tone={{ bg: resultadoFinanceiro >= 0 ? 'var(--teal-soft)' : 'var(--red-soft)', fg: resultadoFinanceiro >= 0 ? 'var(--teal-ink)' : 'var(--red-ink)' }} sub="Faturamento − despesas" />
        </div>
        <div className="overflow-x-auto">
          <table className="tbl ef-compact">
            <thead><tr><th>Viagem</th><th>Data</th><th>Trajeto</th><th className="ef-tr">Faturamento</th><th className="ef-tr">Saldo da viagem</th></tr></thead>
            <tbody>
              {viagensPeriodo.length ? viagensPeriodo.map((trip) => {
                const receita = totalItensViagem(trip); const saldo = receita - totalDespesasViagem(trip);
                return <tr key={trip.id}><td className="font-semibold">Nº {trip.numero}</td><td className="mono">{formatDateBR(trip.data)}</td><td>{trip.origem || '—'} → {trip.destino || '—'}</td><td className="mono text-right font-semibold">{formatCurrency(receita)}</td><td className="mono text-right" style={{ color: saldo >= 0 ? 'var(--teal-ink)' : 'var(--red-ink)' }}>{formatCurrency(saldo)}</td></tr>;
              }) : <tr><td colSpan={5} className="text-center" style={{ color: 'var(--mute)' }}>Nenhum faturamento de viagem neste período.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div id="financeiro-a-vencer" className="card overflow-hidden ef-rise ef-fin-card ef-scroll-anchor">
        <SectionHead title="Pagamentos a vencer" sub="Inclui abastecimentos, manutenções e multas integradas, reformas de pneus e contas avulsas.">
          <Chip tone="teal">{aVencer.length} pagamento(s) · {formatCurrency(soma(aVencer))}</Chip>
        </SectionHead>
        {aVencer.length === 0 ? (
          <Empty icon={CheckCircle2} title="Nenhum pagamento a vencer" text="Os lançamentos integrados aparecem aqui. Use o botão acima para incluir uma conta avulsa." />
        ) : (
          <div className="ef-fin-table-scroll overflow-x-auto" style={{ padding: '10px 10px 12px' }}>
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
                      <td className="mono ef-fin-amount text-right font-bold">{formatCurrency(item.valor)}{item.forma === 'parcelado' && <div className="ef-t11_5 font-normal" style={{ color: 'var(--mute)' }}>Total {formatCurrency(item.total)}</div>}</td>
                      <td className="mono">{formatDateBR(item.vencimento)}<div className={`ef-sans ef-t11_5 ef-fin-deadline ${dias === 0 ? 'ef-fin-deadline-today' : ''}`}>{dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `em ${dias} dias`}</div></td>
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
        <div className="card overflow-hidden ef-rise ef-fin-card">
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

        <div id="financeiro-avisos" className="card overflow-hidden ef-rise ef-fin-card ef-scroll-anchor">
          <div className="ef-cardhead" style={{ borderBottom: 0 }}>
            <span className="ef-tile" style={{ background: 'linear-gradient(135deg,#1F5AA6,#3B82F6)' }}><Bell size={20} /></span>
            <div className="min-w-0 flex-1"><h3>Avisos de pagamento</h3><p>Vencidos e pagos, separados e ordenados por data</p></div>
            <Btn className="btn-pill btn-oblue" aria-expanded={expandirAvisos} aria-controls="financeiro-avisos-lista" onClick={() => setExpandirAvisos((prev) => !prev)}>{expandirAvisos ? 'Ver menos' : 'Ver todos'}<ChevronRight size={14} /></Btn>
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
            <div id="financeiro-avisos-lista" className="ef-fin-wrap" style={{ margin: '8px 10px 12px', maxHeight: expandirAvisos ? 'none' : 262 }}>
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

      <div className="ef-fin-management"><span>Custos mensais recorrentes por veículo também entram neste controle.</span><Btn sm onClick={() => router.push('/custos-multas?aba=fixed')}>Gerenciar custos fixos <ChevronRight size={14}/></Btn></div>

      {detailPayment && (
        <Modal title="Detalhes do pagamento" onClose={() => setDetailPayment(null)}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2"><Chip tone={TONE[detailPayment.tipo]}>{detailPayment.tipo}</Chip><Chip tone={detailPayment.pagoEm ? 'teal' : detailPayment.vencimento < localToday() ? 'red' : 'amber'}>{detailPayment.pagoEm ? 'Pago' : detailPayment.vencimento < localToday() ? 'Vencido' : 'Pendente'}</Chip></div>
            <h4 className="ef-t16 font-semibold">{detailPayment.descricao}</h4>
            {detailPayment.sub && <p className="ef-t13" style={{ color: 'var(--mute)' }}>{detailPayment.sub}</p>}
            <div className="ef-trip-details-grid">
              <div><small>Valor desta parcela</small><b className="mono">{formatCurrency(detailPayment.valor)}</b></div>
              <div><small>Valor total</small><b className="mono">{formatCurrency(detailPayment.total)}</b></div>
              <div><small>Vencimento</small><b>{formatDateBR(detailPayment.vencimento)}</b></div>
              <div><small>Forma de pagamento</small><b>{detailPayment.forma === 'parcelado' ? `Parcela ${detailPayment.numParcela} de ${detailPayment.parcelas}` : 'À vista'}</b></div>
              {detailPayment.pagoEm && <div><small>Pago em</small><b>{formatDateBR(detailPayment.pagoEm)}</b></div>}
            </div>
            <div className="flex flex-wrap justify-end gap-2"><Btn onClick={() => setDetailPayment(null)}>Fechar</Btn>{!detailPayment.pagoEm && <Btn v="primary" onClick={() => { setDetailPayment(null); setConfirmPayment(detailPayment); }}>Marcar como pago</Btn>}</div>
          </div>
        </Modal>
      )}

      {deletingConta && <ConfirmDialog title="Excluir conta a pagar?" description={`A conta “${deletingConta.descricao}”, de ${formatCurrency(deletingConta.valor)}, e todas as suas parcelas serão removidas. Se já houver pagamentos registrados, a exclusão poderá ser impedida.`} confirmLabel="Excluir conta" onCancel={() => setDeletingConta(null)} onConfirm={() => deleteConta(deletingConta.id)} />}
      {confirmPayment && <ConfirmDialog title="Confirmar pagamento?" description={`Registrar ${formatCurrency(confirmPayment.valor)} como pago para “${confirmPayment.descricao}”? A data da baixa será a de hoje.`} variant="primary" confirmLabel="Confirmar pagamento" onCancel={closePayment} onConfirm={() => payItem(confirmPayment)} />}

      {payEdit && (
        <Modal title="Editar plano de pagamento" onClose={() => setPayEdit(null)} wide>
          <form onSubmit={savePayEdit} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2"><Chip tone={TONE[payEdit.tipo]}>{payEdit.tipo}</Chip><b>{payEdit.descricao}</b></div>
            <div className="ef-t13" style={{ color: 'var(--mute)' }}>Valor total: <b className="mono">{formatCurrency(payEdit.total)}</b></div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Condição de pagamento">
                <select className="inp" value={payForm.forma} onChange={(e) => setPayForm({ ...payForm, forma: e.target.value as 'avista' | 'parcelado' })}>
                  <option value="avista">À vista</option><option value="parcelado">Parcelado</option>
                </select>
              </Field>
              <Field label="Meio de pagamento">
                <select className="inp" value={payForm.meioPagamento} onChange={(e) => setPayForm({ ...payForm, meioPagamento: e.target.value })}>
                  <option>Boleto</option><option>Pix</option><option>Transferência</option><option>Débito automático</option><option>Cartão</option><option>Dinheiro</option><option>Outro</option>
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
        <Modal title={editingContaId ? 'Editar conta a pagar' : 'Lançar conta a pagar'} onClose={() => { if (savingConta) return; setContaAberta(false); setEditingContaId(null); setContaForm(EMPTY_CONTA()); }} wide>
          <form onSubmit={saveConta} className="space-y-3"><fieldset disabled={savingConta} className="space-y-3">
            <Field label="Categoria">
              <select className="inp" value={contaForm.tipo} onChange={(e) => setContaForm({ ...contaForm, tipo: e.target.value as TipoFinanceiro })}>
                {TIPOS_FINANCEIRO.filter((tipo) => tipo !== 'Custo Fixo').map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
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
            <div className="grid grid-cols-3 gap-3">
              <Field label="Valor total (R$)"><input type="number" min="0.01" step="0.01" required className="inp mono" value={contaForm.valor} onChange={(e) => setContaForm({ ...contaForm, valor: e.target.value })} /></Field>
              <Field label="Condição"><select className="inp" value={contaForm.forma} onChange={(e) => setContaForm({ ...contaForm, forma: e.target.value as 'avista' | 'parcelado' })}><option value="avista">À vista</option><option value="parcelado">Parcelado</option></select></Field>
              <Field label="Meio de pagamento"><select className="inp" value={contaForm.meioPagamento} onChange={(e) => setContaForm({ ...contaForm, meioPagamento: e.target.value })}><option>Boleto</option><option>Pix</option><option>Transferência</option><option>Débito automático</option><option>Cartão</option><option>Dinheiro</option><option>Outro</option></select></Field>
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
            <FormActions loading={savingConta} onCancel={() => { if (savingConta) return; setContaAberta(false); setEditingContaId(null); setContaForm(EMPTY_CONTA()); }} label={editingContaId ? 'Salvar alterações' : 'Salvar conta'} v="primary" />
          </fieldset></form>
        </Modal>
      )}
    </div>
  );
}
