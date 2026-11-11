'use client';

import React, { useMemo, useState } from 'react';
import { Route, Plus, Fuel, DollarSign, Gauge } from 'lucide-react';
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
    liveMode,
  } = useEstoquePneus();

  const [plate, setPlate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TripForm | null>(null);

  const plates = useMemo(() => vehicles.map((v) => v.placa).sort(), [vehicles]);
  const rows = useMemo(() => {
    const q = normPlaca(plate);
    return [...trips]
      .filter((t) => !q || normPlaca(vehicles.find((v) => v.id === t.veiculoId)?.placa).includes(q))
      .sort((a, b) => b.numero - a.numero);
  }, [trips, plate, vehicles]);

  if (liveMode) {
    return (
      <div className="card ef-rise">
        <Empty
          icon={Route}
          title="Viagens indisponíveis no modo API"
          text="O backend atual ainda não possui endpoints de viagens. Nesta entrega o módulo funciona no modo DEMO/offline, com dados no armazenamento local do navegador."
        />
      </div>
    );
  }

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
    setForm(blank());
    setOpen(true);
  };
  const openEdit = (t: Viagem) => {
    setEditingId(t.id);
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

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const kmFinal = form.kmFinal === '' ? null : Number(form.kmFinal);
    const draft = {
      numero: Number(form.numero),
      veiculoId: form.veiculoId,
      data: form.data,
      kmInicial: Number(form.kmInicial),
      kmFinal,
    };
    const erro = validarViagem(draft, trips, editingId);
    if (erro) {
      showToast(erro, 'error');
      return;
    }
    const old = editingId ? trips.find((t) => t.id === editingId) : undefined;
    // Despesas de abastecimento são geradas pelo módulo de abastecimento: preservadas como estão.
    const trip: Viagem = {
      id: old?.id ?? `vg-${Date.now()}`,
      ...draft,
      origem: form.origem.trim(),
      destino: form.destino.trim(),
      obs: form.obs.trim(),
      itens: form.itens.filter((i) => i.descricao.trim() || Number(i.valor)),
      despesas: [
        ...(old?.despesas || []).filter((d) => d.origem === 'abastecimento'),
        ...form.despesas.filter((d) => d.origem === 'manual' && (d.descricao.trim() || Number(d.valor))),
      ],
    };
    const next = editingId ? trips.map((t) => (t.id === editingId ? trip : t)) : [trip, ...trips];
    setTrips(next);
    // O KM final/inicial da viagem é leitura de hodômetro: atualiza o veículo (nunca soma).
    syncOdometers([trip.veiculoId, old?.veiculoId ?? trip.veiculoId], fuelings, maintenances, 'viagem', next);
    // Se a viagem ficou acima do hodômetro cadastrado, garante a atualização mesmo sem outros lançamentos.
    const veh = vehicles.find((v) => v.id === trip.veiculoId);
    const maxKm = Math.max(trip.kmInicial, trip.kmFinal ?? 0);
    if (veh && maxKm > (Number(veh.kmAtual) || 0)) {
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: maxKm } : v)));
    }
    showToast(editingId ? `Viagem nº ${trip.numero} atualizada!` : `Viagem nº ${trip.numero} registrada!`);
    close();
  };

  const remove = (t: Viagem) => {
    const vinc = fuelings.filter((f) => f.viagemId === t.id).length;
    if (
      !window.confirm(
        `Excluir a viagem nº ${t.numero}?${
          vinc ? `\n${vinc} abastecimento(s) vinculado(s) serão mantidos, sem viagem.` : ''
        }`
      )
    )
      return;
    // O abastecimento nunca depende de viagem: apenas perde o vínculo.
    setFuelings((p) => p.map((f) => (f.viagemId === t.id ? { ...f, viagemId: null } : f)));
    setTrips((p) => p.filter((x) => x.id !== t.id));
    showToast(`Viagem nº ${t.numero} excluída.`);
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
          sub="Cada abastecimento vinculado a uma viagem lança o valor como despesa dela, automaticamente"
        >
          <Btn v="primary" icon={Plus} onClick={openNew}>
            Registrar viagem
          </Btn>
        </SectionHead>
        <div className="px-5 py-3 flex flex-wrap items-center gap-3" style={{ borderTop: '1px solid var(--line2)' }}>
          <PlateFilter id="plate-trips" value={plate} onChange={setPlate} plates={plates} />
          {plate.trim() && <Btn sm onClick={() => setPlate('')}>Limpar filtro</Btn>}
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
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nº / data</th>
                  <th>Veículo</th>
                  <th>Trecho</th>
                  <th className="ef-tr">KM inicial</th>
                  <th className="ef-tr">KM final</th>
                  <th className="ef-tr">Percorrido</th>
                  <th className="ef-tr">Itens (R$)</th>
                  <th className="ef-tr">Despesas (R$)</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const veh = vehicles.find((v) => v.id === t.veiculoId);
                  const dist = distanciaViagem(t);
                  const abast = totalAbastecimentoViagem(t);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="mono font-bold">Viagem nº {t.numero}</div>
                        <div className="ef-t12" style={{ color: 'var(--mute)' }}>{t.data}</div>
                      </td>
                      <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                      <td style={{ color: 'var(--ink2)' }}>
                        {t.origem || t.destino ? `${t.origem || '—'} → ${t.destino || '—'}` : '—'}
                      </td>
                      <td className="mono text-right">{formatNumber(t.kmInicial)} km</td>
                      <td className="mono text-right">
                        {t.kmFinal === null ? <Chip tone="amber">Em andamento</Chip> : `${formatNumber(t.kmFinal)} km`}
                      </td>
                      <td className="mono text-right font-bold">{dist === null ? '—' : `${formatNumber(dist)} km`}</td>
                      <td className="mono text-right">{formatCurrency(totalItensViagem(t))}</td>
                      <td className="mono text-right">
                        <b>{formatCurrency(totalDespesasViagem(t))}</b>
                        {abast > 0 && (
                          <div className="ef-t11_5" style={{ color: 'var(--mute)' }}>
                            abastecimento {formatCurrency(abast)}
                          </div>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap ef-sx15">
                        <Btn sm onClick={() => openEdit(t)}>Editar</Btn>
                        <Btn sm className="ef-del" onClick={() => remove(t)}>Excluir</Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && form && (
        <Modal wide title={editingId ? `Editar viagem nº ${form.numero}` : 'Registrar viagem'} onClose={close}>
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nº da viagem">
                <input type="number" min="1" required className="inp mono" value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })} />
              </Field>
              <div className="col-span-2">
                <Field label="Veículo">
                  <select required className="inp" value={form.veiculoId}
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
