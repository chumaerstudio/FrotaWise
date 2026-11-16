'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tripPayload } from '@/services/operacional39Service';
import { Route, Plus, Fuel, DollarSign, Gauge, CheckCircle2, Eye, Pencil, Trash2 } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatNumber, today } from '@/services/api';
import { Btn, Chip, Empty, Field, FormActions, Kpi, Modal, Plate, PlateFilter, SectionHead } from '@/components/ui';
import { normPlaca } from '@/services/multasService';
import {
  distanciaViagem,
  proximoNumeroViagem,
  totalAbastecimentoViagem,
  totalDespesasViagem,
  totalItensViagem,
  validarViagem,
} from '@/services/viagensService';
import type { DespesaViagem, ItemViagem, Viagem } from '@/types/frotawise';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';

interface TripForm {
  numero: string;
  veiculoId: string;
  data: string;
  origem: string;
  destino: string;
  kmInicial: string;
  kmFinal: string;
  obs: string;
  itens: ItemViagem[];
  despesas: DespesaViagem[];
}

export default function ViagensPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    vehicles,
    trips,
    setTrips,
    fuelings,
    setVehicles,
    syncOdometers,
    maintenances,
    setFuelings,
    showToast,
    setPendingConfirmation,
    liveMode, runLiveMutation,
  } = useEstoquePneus();

  const [plate, setPlate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TripForm | null>(null);
  const [createKey, setCreateKey] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'andamento' | 'concluidas'>('todas');
  const [completing, setCompleting] = useState<Viagem | null>(null);
  const [completionKm, setCompletionKm] = useState('');
  const [detailTrip, setDetailTrip] = useState<Viagem | null>(null);
  const handledDeepLink = useRef('');

  const startCompletion = (trip: Viagem) => {
    setCompleting(trip);
    setCompletionKm('');
  };
  const closeCompletion = () => {
    setCompleting(null);
    if (searchParams.has('concluir')) router.replace('/viagens', { scroll: false });
  };

  // A home aponta para o próprio registro; abre a conclusão sem exigir nova busca.
  const completionTarget = searchParams.get('concluir');
  useEffect(() => {
    if (!completionTarget || completionTarget === handledDeepLink.current) return;
    const trip = trips.find(t => t.id === completionTarget && t.kmFinal === null);
    if (!trip) return;
    handledDeepLink.current = completionTarget;
    startCompletion(trip);
  }, [completionTarget, trips]);

  const plates = useMemo(() => vehicles.map((v) => v.placa).sort(), [vehicles]);
  const rows = useMemo(() => {
    const q = normPlaca(plate);
    return [...trips]
      .filter((t) => !q || normPlaca(vehicles.find((v) => v.id === t.veiculoId)?.placa).includes(q))
      .filter(t => statusFilter === 'todas' || (statusFilter === 'andamento' ? t.kmFinal === null : t.kmFinal !== null))
      .sort((a, b) => b.numero - a.numero);
  }, [trips, plate, vehicles, statusFilter]);

  const blank = (veiculoId = ''): TripForm => ({
    numero: String(proximoNumeroViagem(trips)),
    veiculoId,
    data: today(),
    origem: '',
    destino: '',
    kmInicial: veiculoId ? String(vehicles.find((v) => v.id === veiculoId)?.kmAtual ?? '') : '',
    kmFinal: '',
    obs: '',
    itens: [],
    despesas: [],
  });

  const openNew = () => {
    setEditingId(null);
    setCreateKey(crypto.randomUUID());
    setForm(blank());
    setOpen(true);
  };
  const openEdit = (t: Viagem) => {
    setEditingId(t.id);
    setCreateKey('');
    setForm({
      numero: String(t.numero),
      veiculoId: t.veiculoId,
      data: t.data,
      origem: t.origem || '',
      destino: t.destino || '',
      kmInicial: String(t.kmInicial),
      kmFinal: t.kmFinal === null ? '' : String(t.kmFinal),
      obs: t.obs || '',
      itens: t.itens || [],
      despesas: t.despesas || [],
    });
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(null);
  };

  const persistTrip = (trip: Viagem, old: Viagem | undefined, onSuccess: () => void) => {
    if (liveMode) {
      const payload = tripPayload(trip);
      // O backend não permite mudar número/veículo após a criação.
      const changes = {
        data: payload.data, origem: payload.origem, destino: payload.destino,
        kmInicial: payload.kmInicial, kmFinal: payload.kmFinal, obs: payload.obs,
        itens: payload.itens, despesas: payload.despesas,
      };
      void runLiveMutation(
        old ? 'patch' : 'post',
        old ? `/viagens/${old.id}` : '/viagens',
        old ? changes : payload,
        old ? 'Viagem atualizada.' : 'Viagem cadastrada.',
        !old, createKey
      ).then((ok) => { if (ok) onSuccess(); });
      return;
    }
    const next = old ? trips.map((t) => (t.id === old.id ? trip : t)) : [trip, ...trips];
    setTrips(next);
    // O KM final/inicial da viagem é leitura de hodômetro: atualiza o veículo (nunca soma).
    syncOdometers([trip.veiculoId, old?.veiculoId ?? trip.veiculoId], fuelings, maintenances, 'viagem', next);
    // Se a viagem ficou acima do hodômetro cadastrado, garante a atualização mesmo sem outros lançamentos.
    const veh = vehicles.find((v) => v.id === trip.veiculoId);
    const maxKm = Math.max(trip.kmInicial, trip.kmFinal ?? 0);
    if (veh && maxKm > (Number(veh.kmAtual) || 0)) {
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: maxKm } : v)));
    }
    showToast(old ? `Viagem nº ${trip.numero} atualizada!` : `Viagem nº ${trip.numero} registrada!`);
    onSuccess();
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const draft = {
      numero: Number(form.numero), veiculoId: form.veiculoId, data: form.data,
      kmInicial: Number(form.kmInicial), kmFinal: form.kmFinal === '' ? null : Number(form.kmFinal),
    };
    const erro = validarViagem(draft, trips, editingId);
    if (erro) { showToast(erro, 'error'); return; }
    const old = editingId ? trips.find(t => t.id === editingId) : undefined;
    // Despesas geradas pelo abastecimento nunca são sobrescritas por edição manual.
    const trip: Viagem = {
      id: old?.id ?? `vg-${Date.now()}`, ...draft,
      origem: form.origem.trim(), destino: form.destino.trim(), obs: form.obs.trim(),
      itens: form.itens.filter(i => i.descricao.trim() || Number(i.valor)),
      despesas: [
        ...(old?.despesas || []).filter(d => d.origem === 'abastecimento'),
        ...form.despesas.filter(d => d.origem === 'manual' && (d.descricao.trim() || Number(d.valor))),
      ],
    };
    persistTrip(trip, old, close);
  };

  const finishTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completing) return;
    if (!completionKm.trim() || !Number.isFinite(Number(completionKm))) {
      showToast('Informe o KM final registrado no veículo.', 'error'); return;
    }
    const updated = { ...completing, kmFinal: Number(completionKm) };
    const erro = validarViagem(updated, trips, completing.id);
    if (erro) { showToast(erro, 'error'); return; }
    persistTrip(updated, completing, closeCompletion);
  };

  const remove = (t: Viagem) => {
    const vinc = fuelings.filter((f) => f.viagemId === t.id).length;
    if (liveMode && vinc) {
      showToast('Esta viagem tem abastecimentos vinculados. Desvincule-os primeiro.', 'error');
      return;
    }
    setPendingConfirmation({
      title: `Excluir viagem nº ${t.numero}?`,
      description: vinc ? `${vinc} abastecimento(s) vinculado(s) serão preservados, mas perderão o vínculo com esta viagem no modo demonstrativo.` : 'Esta viagem será removida dos registros da empresa.',
      confirmLabel: 'Excluir viagem',
      action: () => {
        if (liveMode) return runLiveMutation('delete', `/viagens/${t.id}`, undefined, 'Viagem excluída.');
        setFuelings(p => p.map(f => f.viagemId === t.id ? { ...f, viagemId: null } : f));
        setTrips(p => p.filter(x => x.id !== t.id));
        showToast(`Viagem nº ${t.numero} excluída.`);
      },
    });
  };

  const totalReceita = rows.reduce((a, t) => a + totalItensViagem(t), 0);
  const totalDespesa = rows.reduce((a, t) => a + totalDespesasViagem(t), 0);
  const totalAbast = rows.reduce((a, t) => a + totalAbastecimentoViagem(t), 0);
  const totalKm = rows.reduce((a, t) => a + (distanciaViagem(t) ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="ef-g-kpi">
        <Kpi label="Viagens" value={rows.length} suffix="registros" icon={Route}
          tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal)' }} sub="Conforme o filtro de placa" delay={0} />
        <Kpi label="KM percorridos" value={totalKm} fmt={(n) => formatNumber(Math.round(n))} suffix="km" icon={Gauge}
          tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }} sub="KM final − KM inicial" delay={70} />
        <Kpi label="Valor transportado" value={totalReceita} fmt={formatCurrency} icon={DollarSign}
          tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }} sub="Soma dos itens das viagens" delay={140} />
        <Kpi label="Despesas das viagens" value={totalDespesa} fmt={formatCurrency} icon={Fuel}
          tone={{ bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }}
          sub={`Abastecimento: ${formatCurrency(totalAbast)}`} delay={210} />
      </div>

      <div className="card overflow-hidden ef-rise">
        <SectionHead
          title="Viagens"
          sub="Registros de percurso, cargas e despesas. Abastecimentos vinculados compõem o custo da viagem."
        >
          <Btn v="primary" icon={Plus} onClick={openNew}>
            Registrar viagem
          </Btn>
        </SectionHead>
        <div className="px-5 py-3 flex flex-wrap items-center gap-3" style={{ borderTop: '1px solid var(--line2)' }}>
          <PlateFilter id="plate-trips" value={plate} onChange={setPlate} plates={plates} />
          <select className="inp ef-list-select" aria-label="Filtrar por situação da viagem" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}><option value="todas">Todas as viagens</option><option value="andamento">Em andamento</option><option value="concluidas">Concluídas</option></select>
          {(plate.trim() || statusFilter !== 'todas') && <Btn sm onClick={() => { setPlate(''); setStatusFilter('todas'); }}>Limpar filtros</Btn>}
        </div>
        {rows.length === 0 ? (
          <Empty
            icon={Route}
            title={trips.length === 0 ? 'Nenhuma viagem registrada' : 'Nenhuma viagem para esta placa'}
            text={
              trips.length === 0
                ? 'Registre a primeira viagem para poder vincular abastecimentos e acompanhar as despesas.'
                : 'Ajuste ou limpe o filtro de placa.'
            }
          />
        ) : (
          <>
          <div className="ef-desktop-trips">
            <table className="tbl ef-trips-table ef-record-table">
              <thead>
                <tr>
                  <th>Viagem / data</th>
                  <th>Veículo</th>
                  <th>Trecho</th>
                  <th>Situação</th>
                  <th className="ef-tr">Saldo</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const veh = vehicles.find((v) => v.id === t.veiculoId);
                  const dist = distanciaViagem(t);
                  const saldo = totalItensViagem(t) - totalDespesasViagem(t);
                  return (
                    <tr key={t.id}>
                      <td>
                        <button type="button" className="ef-entity-link mono whitespace-nowrap" onClick={() => setDetailTrip(t)}>Viagem nº {t.numero}</button>
                        <div className="ef-record-secondary">{t.data}</div>
                      </td>
                      <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                      <td style={{ color: 'var(--ink2)' }}>
                        <span className="ef-record-description" title={`${t.origem || '—'} → ${t.destino || '—'}`}>
                          {t.origem || t.destino ? `${t.origem || '—'} → ${t.destino || '—'}` : 'Trecho não informado'}
                        </span>
                      </td>
                      <td>
                        <Chip tone={t.kmFinal === null ? 'amber' : 'teal'}>{t.kmFinal === null ? 'Em andamento' : 'Concluída'}</Chip>
                        <div className="ef-record-secondary mono">{dist === null ? `${formatNumber(t.kmInicial)} km iniciais` : `${formatNumber(dist)} km percorridos`}</div>
                      </td>
                      <td className="mono ef-tr ef-record-amount" style={{ color: saldo >= 0 ? 'var(--teal-ink)' : 'var(--red-ink)' }} title="Itens registrados menos despesas; não é lucro líquido">
                        {formatCurrency(saldo)}
                      </td>
                      <td className="ef-tr">
                        <div className="ef-record-actions">
                          {t.kmFinal === null && <Btn sm v="primary" icon={CheckCircle2} onClick={() => startCompletion(t)}>Concluir</Btn>}
                          <RowActionsMenu label={`Ações da viagem nº ${t.numero}`} actions={[
                            { label: 'Ver detalhes', icon: Eye, onClick: () => setDetailTrip(t) },
                            { label: 'Editar viagem', icon: Pencil, onClick: () => openEdit(t) },
                            { label: 'Excluir viagem', icon: Trash2, danger: true, onClick: () => remove(t) },
                          ]} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ef-mobile-trip-list">{rows.map(t => {
            const vehicle = vehicles.find(v => v.id === t.veiculoId);
            const amount = totalItensViagem(t) - totalDespesasViagem(t);
            return <article key={t.id} className="ef-mobile-trip-card">
              <div className="ef-mobile-trip-top"><button type="button" className="ef-entity-link" onClick={() => setDetailTrip(t)}>Viagem nº {t.numero}</button><Chip tone={t.kmFinal === null ? 'amber' : 'teal'}>{t.kmFinal === null ? 'Em andamento' : 'Concluída'}</Chip></div>
              <p className="ef-mobile-trip-route">{t.origem || 'Origem não informada'} → {t.destino || 'Destino não informado'}</p>
              <div className="ef-mobile-trip-meta">{vehicle ? <Plate v={vehicle}/> : 'Veículo indisponível'}<time dateTime={t.data}>{t.data}</time></div>
              <div className="ef-mobile-trip-facts"><span><small>Distância</small><b>{distanciaViagem(t) === null ? '—' : `${formatNumber(distanciaViagem(t) || 0)} km`}</b></span><span><small>Despesas</small><b>{formatCurrency(totalDespesasViagem(t))}</b></span><span><small>Saldo registrado</small><b style={{color:amount >= 0 ? 'var(--teal-ink)' : 'var(--red-ink)'}}>{formatCurrency(amount)}</b></span></div>
              <div className="ef-mobile-trip-actions">
                {t.kmFinal === null && <Btn sm v="primary" icon={CheckCircle2} onClick={() => startCompletion(t)}>Concluir</Btn>}
                <RowActionsMenu label={`Ações da viagem nº ${t.numero}`} actions={[
                  { label: 'Ver detalhes', icon: Eye, onClick: () => setDetailTrip(t) },
                  { label: 'Editar viagem', icon: Pencil, onClick: () => openEdit(t) },
                  { label: 'Excluir viagem', icon: Trash2, danger: true, onClick: () => remove(t) },
                ]}/>
              </div>
            </article>;
          })}</div>
          </>
        )}
      </div>

      {detailTrip && (
        <Modal wide title={`Viagem nº ${detailTrip.numero}`} onClose={() => setDetailTrip(null)}>
          <div className="space-y-4">
            <p className="ef-t13" style={{ color: 'var(--ink2)' }}>{detailTrip.origem || 'Origem não informada'} → {detailTrip.destino || 'Destino não informado'}</p>
            <div className="ef-trip-details-grid">
              <div><small>Veículo</small><b>{vehicles.find(v => v.id === detailTrip.veiculoId)?.placa || 'Não encontrado'}</b></div>
              <div><small>Data da viagem</small><b>{detailTrip.data}</b></div>
              <div><small>KM inicial</small><b className="mono">{formatNumber(detailTrip.kmInicial)} km</b></div>
              <div><small>KM final</small><b className="mono">{detailTrip.kmFinal === null ? 'Em andamento' : `${formatNumber(detailTrip.kmFinal)} km`}</b></div>
              <div><small>Percurso</small><b className="mono">{distanciaViagem(detailTrip) === null ? 'Aguardando conclusão' : `${formatNumber(distanciaViagem(detailTrip) || 0)} km`}</b></div>
              <div><small>Saldo registrado</small><b className="mono" style={{ color: totalItensViagem(detailTrip) - totalDespesasViagem(detailTrip) >= 0 ? 'var(--teal-ink)' : 'var(--red-ink)' }}>{formatCurrency(totalItensViagem(detailTrip) - totalDespesasViagem(detailTrip))}</b></div>
            </div>
            <div className="ef-trip-details-list"><h4>Itens transportados · {formatCurrency(totalItensViagem(detailTrip))}</h4>
              {detailTrip.itens?.length ? <ul>{detailTrip.itens.map(item => <li key={item.id}><span>{item.descricao}</span><b className="mono">{formatCurrency(item.valor)}</b></li>)}</ul> : <p className="ef-t12" style={{ color: 'var(--mute)' }}>Nenhum item informado.</p>}
            </div>
            <div className="ef-trip-details-list"><h4>Despesas · {formatCurrency(totalDespesasViagem(detailTrip))}</h4>
              {detailTrip.despesas?.length ? <ul>{detailTrip.despesas.map(item => <li key={item.id}><span>{item.descricao} · {item.data}</span><b className="mono">{formatCurrency(item.valor)}</b></li>)}</ul> : <p className="ef-t12" style={{ color: 'var(--mute)' }}>Nenhuma despesa vinculada.</p>}
            </div>
            {detailTrip.obs && <p className="ef-t12" style={{ color: 'var(--mute)' }}>Observações: {detailTrip.obs}</p>}
            <div className="flex justify-end"><Btn onClick={() => setDetailTrip(null)}>Fechar detalhes</Btn></div>
          </div>
        </Modal>
      )}

      {completing && (
        <Modal title={`Concluir viagem nº ${completing.numero}`} onClose={closeCompletion}>
          <form onSubmit={finishTrip} className="space-y-4">
            <div className="ef-trip-complete-summary">
              <div><span>Veículo</span><b>{vehicles.find(v => v.id === completing.veiculoId)?.placa || 'Não encontrado'}</b></div>
              <div><span>KM inicial</span><b className="mono">{formatNumber(completing.kmInicial)} km</b></div>
              <p>{completing.origem || 'Origem'} → {completing.destino || 'Destino'}</p>
            </div>
            <Field label="KM final do veículo">
              <input autoFocus required type="number" min={completing.kmInicial} step="1" inputMode="numeric" className="inp mono" value={completionKm} onChange={e => setCompletionKm(e.target.value)} placeholder={`A partir de ${formatNumber(completing.kmInicial)} km`} />
            </Field>
            <div className="ef-trip-complete-distance">
              <span>Distância percorrida</span><b className="mono">{completionKm.trim() && Number(completionKm) >= completing.kmInicial ? `${formatNumber(Number(completionKm) - completing.kmInicial)} km` : '—'}</b>
            </div>
            <p className="ef-t12" style={{ color: 'var(--mute)' }}>A conclusão registra o KM final e atualiza o hodômetro quando necessário. Os itens e despesas da viagem são preservados.</p>
            <FormActions onCancel={closeCompletion} label="Concluir viagem" v="primary" />
          </form>
        </Modal>
      )}

      {open && form && (
        <Modal wide title={editingId ? `Editar viagem nº ${form.numero}` : 'Registrar viagem'} onClose={close}>
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nº da viagem">
                <input type="number" min="1" required disabled={liveMode && !!editingId} className="inp mono" value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })} />
              </Field>
              <div className="col-span-2">
                <Field label="Veículo">
                  <select required disabled={liveMode && !!editingId} className="inp" value={form.veiculoId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const v = vehicles.find((x) => x.id === id);
                      setForm({
                        ...form,
                        veiculoId: id,
                        // Nova viagem: o KM inicial vem do hodômetro atual do veículo.
                        kmInicial: !editingId && v ? String(v.kmAtual) : form.kmInicial,
                      });
                    }}>
                    <option value="">Selecione o veículo...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.placa} — {v.modelo}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Data">
                <input type="date" required className="inp" value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })} />
              </Field>
              <Field label="Origem">
                <input className="inp" value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} />
              </Field>
              <Field label="Destino">
                <input className="inp" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="KM inicial">
                <input type="number" min="0" required className="inp mono" value={form.kmInicial}
                  onChange={(e) => setForm({ ...form, kmInicial: e.target.value })} />
              </Field>
              <Field label="KM final (vazio = em andamento)">
                <input type="number" min="0" className="inp mono" value={form.kmFinal}
                  onChange={(e) => setForm({ ...form, kmFinal: e.target.value })} />
              </Field>
              <Field label="KM percorrido">
                <input readOnly tabIndex={-1} className="inp mono"
                  value={
                    form.kmFinal !== '' && Number(form.kmFinal) >= Number(form.kmInicial)
                      ? `${formatNumber(Number(form.kmFinal) - Number(form.kmInicial))} km`
                      : '—'
                  } />
              </Field>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="lbl">Itens transportados e valores</span>
                <Btn sm type="button" icon={Plus}
                  onClick={() => setForm({ ...form, itens: [...form.itens, { id: `it-${Date.now()}`, descricao: '', valor: 0 }] })}>
                  Item
                </Btn>
              </div>
              {form.itens.map((it, i) => (
                <div key={it.id} className="grid grid-cols-[1fr_140px_auto] gap-2 mt-2">
                  <input className="inp" placeholder="Descrição do item" value={it.descricao}
                    onChange={(e) => setForm({ ...form, itens: form.itens.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)) })} />
                  <input type="number" min="0" step="0.01" className="inp mono" placeholder="Valor (R$)" value={it.valor || ''}
                    onChange={(e) => setForm({ ...form, itens: form.itens.map((x, j) => (j === i ? { ...x, valor: Number(e.target.value) } : x)) })} />
                  <Btn sm type="button" className="ef-del" onClick={() => setForm({ ...form, itens: form.itens.filter((_, j) => j !== i) })}>×</Btn>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="lbl">Despesas da viagem</span>
                <Btn sm type="button" icon={Plus}
                  onClick={() => setForm({ ...form, despesas: [...form.despesas, { id: `dp-${Date.now()}`, descricao: '', valor: 0, data: form.data, origem: 'manual' }] })}>
                  Despesa
                </Btn>
              </div>
              {form.despesas.map((d, i) =>
                d.origem === 'abastecimento' ? (
                  <div key={d.id} className="flex items-center justify-between gap-2 mt-2 px-3 ef-py2_5 rounded-lg"
                    style={{ background: 'var(--teal-wash)' }}>
                    <span className="ef-t13"><Fuel size={13} className="inline mr-1" />{d.descricao} · {d.data}
                      <span className="ef-t12" style={{ color: 'var(--mute)' }}> (vinculada ao abastecimento)</span></span>
                    <b className="mono ef-t13">{formatCurrency(d.valor)}</b>
                  </div>
                ) : (
                  <div key={d.id} className="grid grid-cols-[1fr_140px_auto] gap-2 mt-2">
                    <input className="inp" placeholder="Ex.: pedágio, diária" value={d.descricao}
                      onChange={(e) => setForm({ ...form, despesas: form.despesas.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)) })} />
                    <input type="number" min="0" step="0.01" className="inp mono" placeholder="Valor (R$)" value={d.valor || ''}
                      onChange={(e) => setForm({ ...form, despesas: form.despesas.map((x, j) => (j === i ? { ...x, valor: Number(e.target.value) } : x)) })} />
                    <Btn sm type="button" className="ef-del" onClick={() => setForm({ ...form, despesas: form.despesas.filter((_, j) => j !== i) })}>×</Btn>
                  </div>
                )
              )}
            </div>
            <Field label="Observações">
              <input className="inp" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
            </Field>
            <FormActions onCancel={close} label={editingId ? 'Salvar alterações' : 'Salvar viagem'} v="primary" />
          </form>
        </Modal>
      )}
    </div>
  );
}
