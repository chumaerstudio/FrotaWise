'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Gauge,
  Package,
  Disc,
  Search,
  Truck,
  History,
  ZoomIn,
  ZoomOut,
  MapPin,
  Trash2,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatNumber, today } from '@/services/api';
import { registrarMovimentacao } from '@/services/pneuKmService';
import { getTireLimits, getTireRecapStyle, getTireRecapLegend } from '@/services/pneusService';
import { getVehicleChassisSlots, normalizeChassisSlotCode } from '@/services/veiculosService';
import { Btn, Chip, Empty, Field, FormActions, Modal, SectionHead, TireChip, cx } from '@/components/ui';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { ChassisView } from '@/components/chassis/ChassisView';

export default function PneusHubPage() {
  const {
    company,
    vehicles,
    tires,
    totalStockTires,
    selectedChassisVehicleId,
    setSelectedChassisVehicleId,
    selectedTireForActionId,
    setSelectedTireForActionId,
    draggedTireId,
    setDraggedTireId,
    openTireOperationModal,
    handleCompleteRecap,
    setHistoryModalTire,
    startEditTire,
    handleDeleteTire,
    setTires, fuelings, maintenances, trips, syncOdometers, showToast,
    liveMode, runLiveMutation,
  } = useEstoquePneus();

  const [tireHubSubTab, setTireHubSubTab] = useState<'chassis' | 'stock' | 'all'>('chassis');
  const [chassisEquipSearch, setChassisEquipSearch] = useState('');
  const [chassisTireSearch, setChassisTireSearch] = useState('');
  const [chassisFilterBy, setChassisFilterBy] = useState<'fogo' | 'marca' | 'medida'>('fogo');
  const [zoomed, setZoomed] = useState(false);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [selectedSlotCode, setSelectedSlotCode] = useState('');
  const [swapDraft, setSwapDraft] = useState<{ key: string; sourceId: string; targetId: string; kmSource: string; kmTarget: string; kmVehicle: string } | null>(null);

  const activeVehicle =
    vehicles.find((v) => v.id === selectedChassisVehicleId) || vehicles[0];
  const layout = activeVehicle ? getVehicleChassisSlots(activeVehicle.eixos, activeVehicle.categoria) : null;
  const mounted = activeVehicle
    ? tires.filter((t) => t.veiculoAtualId === activeVehicle.id)
    : [];
  const unmounted = tires.filter((t) => {
    if (t.veiculoAtualId || t.classificacao === 'Sucatear') return false;
    const q = chassisTireSearch.trim().toLowerCase();
    if (!q) return true;
    if (chassisFilterBy === 'fogo') return t.fogo.toLowerCase().includes(q);
    if (chassisFilterBy === 'marca') return t.marca.toLowerCase().includes(q);
    return t.medida.toLowerCase().includes(q);
  });

  const sel = tires.find((t) => t.id === selectedTireForActionId) || null;
  const freeSlots = layout ? [
    ...layout.axles.flatMap(axle => [...axle.leftSlots, ...axle.rightSlots]),
    layout.spareSlot,
  ].filter(slot => !mounted.some(t => normalizeChassisSlotCode(t.posicaoAtual, activeVehicle?.categoria) === slot.code)) : [];
  const openSlotPicker = () => {
    setSelectedSlotCode(freeSlots[0]?.code || '');
    setSlotPickerOpen(true);
  };
  const armed = !!sel || !!draggedTireId;
  const dropTire = () => (draggedTireId ? tires.find((t) => t.id === draggedTireId) : null);

  const beginTireSwap = (sourceId: string, targetId: string) => {
    if (!activeVehicle || sourceId === targetId) return;
    const source = tires.find((t) => t.id === sourceId);
    const target = tires.find((t) => t.id === targetId);
    if (!source || !target) return;
    if (source.veiculoAtualId !== activeVehicle.id || target.veiculoAtualId !== activeVehicle.id) {
      showToast('Para trocar posições, arraste um pneu montado sobre outro pneu do mesmo chassi.', 'warning');
      return;
    }
    const kmVehicle = Number(activeVehicle.kmAtual) || 0;
    const projectedKm = (tire: typeof source) => {
      const lastReading = [...(tire.historicoVeiculos || [])].reverse().find((movement) =>
        !movement.cancelada && movement.veiculoId === activeVehicle.id && movement.kmVeiculo != null && Number.isFinite(Number(movement.kmVeiculo))
      )?.kmVeiculo;
      return Math.max(0, Number(tire.kmTotal) || 0) + (lastReading == null ? 0 : Math.max(0, kmVehicle - Number(lastReading)));
    };
    setSwapDraft({ key: crypto.randomUUID(), sourceId, targetId, kmSource: String(projectedKm(source)), kmTarget: String(projectedKm(target)), kmVehicle: String(kmVehicle) });
  };

  const confirmTireSwap = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!swapDraft || !activeVehicle) return;
    const source = tires.find((t) => t.id === swapDraft.sourceId);
    const target = tires.find((t) => t.id === swapDraft.targetId);
    if (!source || !target || source.veiculoAtualId !== activeVehicle.id || target.veiculoAtualId !== activeVehicle.id) {
      showToast('A posição dos pneus mudou. Atualize a tela e tente novamente.', 'error'); setSwapDraft(null); return;
    }
    const kmSource = Number(swapDraft.kmSource); const kmTarget = Number(swapDraft.kmTarget);
    const kmVehicle = swapDraft.kmVehicle === '' ? null : Number(swapDraft.kmVehicle);
    if (!Number.isFinite(kmSource) || kmSource < Number(source.kmTotal || 0)) { showToast(`O KM final do pneu #${source.fogo} não pode ser menor que o KM acumulado atual.`, 'error'); return; }
    if (!Number.isFinite(kmTarget) || kmTarget < Number(target.kmTotal || 0)) { showToast(`O KM final do pneu #${target.fogo} não pode ser menor que o KM acumulado atual.`, 'error'); return; }
    if (kmVehicle !== null && (!Number.isFinite(kmVehicle) || kmVehicle < Number(activeVehicle.kmAtual || 0))) { showToast('O KM do veículo não pode ser menor que o hodômetro atual.', 'error'); return; }
    const sourcePos = normalizeChassisSlotCode(source.posicaoAtual, activeVehicle.categoria);
    const targetPos = normalizeChassisSlotCode(target.posicaoAtual, activeVehicle.categoria);
    const sourceDelta = kmSource - Number(source.kmTotal || 0); const targetDelta = kmTarget - Number(target.kmTotal || 0);
    if (liveMode) {
      const saved = await runLiveMutation('post', '/pneus/trocar-posicoes', {
        pneuOrigemId: source.id, pneuDestinoId: target.id,
        kmRodadosOrigem: sourceDelta, kmRodadosDestino: targetDelta,
        kmVeiculo: kmVehicle, obs: `Troca de posição ${sourcePos} ↔ ${targetPos}`,
      }, `Posições dos pneus #${source.fogo} e #${target.fogo} trocadas. KM atualizado.`, true, swapDraft.key);
      if (saved) { setSwapDraft(null); setDraggedTireId(null); }
      return;
    }
    const date = today();

    const sourceMove = registrarMovimentacao(source, {
      movId: `swap-${Date.now()}-a`,
      tipo: 'AddKm',
      data: date,
      kmFinal: kmSource,
      placa: activeVehicle.placa,
      modelo: activeVehicle.modelo,
      veiculoId: activeVehicle.id,
      kmVeiculo: kmVehicle,
      obs: `Troca de posição ${sourcePos} → ${targetPos} com pneu #${target.fogo}`
    });

    const targetMove = registrarMovimentacao(target, {
      movId: `swap-${Date.now()}-b`,
      tipo: 'AddKm',
      data: date,
      kmFinal: kmTarget,
      placa: activeVehicle.placa,
      modelo: activeVehicle.modelo,
      veiculoId: activeVehicle.id,
      kmVeiculo: kmVehicle,
      obs: `Troca de posição ${targetPos} → ${sourcePos} com pneu #${source.fogo}`
    });
    if (sourceMove.erro || targetMove.erro) { showToast(sourceMove.erro || targetMove.erro || 'Não foi possível registrar a troca.', 'error'); return; }
    const nextTires = tires.map((t) => {
      if (t.id === source.id) return { ...sourceMove.tire, classificacao: 'Rodando' as const, veiculoAtualId: activeVehicle.id, posicaoAtual: targetPos, localEstoque: '' };
      if (t.id === target.id) return { ...targetMove.tire, classificacao: 'Rodando' as const, veiculoAtualId: activeVehicle.id, posicaoAtual: sourcePos, localEstoque: '' };
      return t;
    });
    setTires(nextTires);
    const changes = kmVehicle == null ? [] : syncOdometers([activeVehicle.id], fuelings, maintenances, 'troca de posição dos pneus', trips, nextTires);
    showToast(`Posições dos pneus #${source.fogo} e #${target.fogo} trocadas. KM atualizado no histórico.` + (changes.length ? ` ${changes.join(' · ')}` : ''));
    setSwapDraft(null); setDraggedTireId(null);
  };

  const renderSlot = (slot: { code: string; label: string }) => {
    const mt = mounted.find((t) => normalizeChassisSlotCode(t.posicaoAtual, activeVehicle?.categoria) === slot.code);
    if (mt) {
      return (
        <TireChip
          key={slot.code}
          variant="chassis"
          t={mt}
          selected={selectedTireForActionId === mt.id}
          onSelect={(id) => setSelectedTireForActionId((p) => (p === id ? null : id))}
          onDragStartTire={(id) => {
            setDraggedTireId(id);
            setSelectedTireForActionId(id);
          }}
          onDragEndTire={() => setDraggedTireId(null)}
          onDropTire={beginTireSwap}
          draggedTireId={draggedTireId}
        />
      );
    }
    return (
      <button
        type="button"
        key={slot.code}
        className={cx('slot', armed && 'slot-armed')}
        title={`Posição vaga: ${slot.label}${sel ? '. Clique para montar o pneu selecionado.' : ''}`}
        aria-label={`Posição vaga: ${slot.label}${sel ? '. Montar pneu selecionado.' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          const d = dropTire();
          if (d && activeVehicle) openTireOperationModal(d, 'Mount', activeVehicle.id, slot.code);
        }}
        onClick={() => {
          if (sel && activeVehicle)
            openTireOperationModal(sel, 'Mount', activeVehicle.id, slot.code);
        }}
      >
        <span className="mono">{slot.code}</span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="seg" role="tablist">
          <button
            role="tab"
            aria-selected={tireHubSubTab === 'chassis'}
            className={tireHubSubTab === 'chassis' ? 'on' : ''}
            onClick={() => setTireHubSubTab('chassis')}
          >
            <ArrowRightLeft size={15} />
            Movimentação no chassi
          </button>
          <button
            role="tab"
            aria-selected={tireHubSubTab === 'stock'}
            className={tireHubSubTab === 'stock' ? 'on' : ''}
            onClick={() => setTireHubSubTab('stock')}
          >
            <Package size={15} />
            Estoque ({totalStockTires.length})
          </button>
          <button
            role="tab"
            aria-selected={tireHubSubTab === 'all'}
            className={tireHubSubTab === 'all' ? 'on' : ''}
            onClick={() => setTireHubSubTab('all')}
          >
            <Disc size={15} />
            Todos os pneus ({tires.length})
          </button>
        </div>
        <span className="ef-hub-caption">Selecione uma aba para explorar os pneus da frota.</span>
      </div>

      {tireHubSubTab === 'chassis' &&
        (!activeVehicle || !layout ? (
          <div className="card">
            <Empty
              icon={Truck}
              title="Cadastre um veículo"
              text="O chassi aparece quando houver ao menos um veículo na frota."
            />
          </div>
        ) : (
          <div className="card ef-rise">
            <div className="p-5 space-y-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-40">
                  <Field label="Buscar equipamento">
                    <div className="relative">
                      <input
                        className="inp ef-pr8"
                        placeholder="Placa..."
                        value={chassisEquipSearch}
                        onChange={(e) => setChassisEquipSearch(e.target.value)}
                      />
                      <Search
                        size={15}
                        className="absolute right-3 top-3"
                        style={{ color: 'var(--mute)' }}
                      />
                    </div>
                  </Field>
                </div>
                <div className="flex-1" style={{ minWidth: 260, maxWidth: 448 }}>
                  <Field label="Equipamento">
                    <select
                      className="inp font-semibold"
                      value={activeVehicle.id}
                      onChange={(e) => {
                        setSelectedChassisVehicleId(e.target.value);
                        setSelectedTireForActionId(null);
                      }}
                    >
                      {vehicles
                        .filter(
                          (v) =>
                            !chassisEquipSearch.trim() ||
                            v.placa.toLowerCase().includes(chassisEquipSearch.toLowerCase()) ||
                            v.categoria.toLowerCase().includes(chassisEquipSearch.toLowerCase())
                        )
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.categoria} - {v.placa}/{v.uf || 'MG'}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-56">
                    <Field label="Pneu em estoque">
                      <input
                        className="inp"
                        placeholder="Nº fogo ou marca..."
                        value={chassisTireSearch}
                        onChange={(e) => setChassisTireSearch(e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="w-40">
                    <Field label="Filtrar por">
                      <select
                        className="inp"
                        value={chassisFilterBy}
                        onChange={(e) =>
                          setChassisFilterBy(e.target.value as 'fogo' | 'marca' | 'medida')
                        }
                      >
                        <option value="fogo">Marca fogo</option>
                        <option value="marca">Marca / modelo</option>
                        <option value="medida">Medida</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            {sel && (
              <div className="ef-tire-active-bar" aria-live="polite">
                <div className="min-w-0"><b>Pneu #{sel.fogo} selecionado</b><span>Clique em uma posição livre no chassi ou arraste o pneu até ela.</span></div>
                <div className="ef-tire-active-actions">
                  <Btn sm v="primary" icon={MapPin} disabled={!freeSlots.length} onClick={openSlotPicker}>Escolher posição</Btn>
                  <RowActionsMenu label={`Outras ações do pneu ${sel.fogo}`} actions={[
                    { label: 'Registrar KM', icon: Gauge, onClick: () => openTireOperationModal(sel, 'AddKm') },
                    { label: 'Estocar', icon: Package, onClick: () => openTireOperationModal(sel, 'Estocar') },
                    { label: 'Recapar', icon: Disc, onClick: () => openTireOperationModal(sel, 'Recapar') },
                    { label: 'Sucatear', icon: Trash2, danger: true, onClick: () => openTireOperationModal(sel, 'Sucatear') },
                  ]} />
                  <button className="ef-tire-clear" onClick={() => setSelectedTireForActionId(null)} type="button">Limpar</button>
                </div>
              </div>
            )}

            <div className={cx('p-5 ef-g-chassis', layout.axles.length >= 3 && 'ef-g-chassis-wide')}>
              <div className="py-2 ef-chassis-preview">
                <div className="ef-chassis-preview-toolbar"><span>Chassi · {activeVehicle.placa}</span><Btn sm icon={zoomed ? ZoomOut : ZoomIn} onClick={() => setZoomed(value => !value)}>{zoomed ? 'Ajustar à tela' : 'Ampliar'}</Btn></div>
                <ChassisView layout={layout} eixos={activeVehicle.eixos} categoria={activeVehicle.categoria} renderSlot={renderSlot} zoomed={zoomed} />
              </div>

              <div className="ef-chassis-side">
                <div className="ef-tire-stock-tray">
                  <div className="ef-tire-stock-title"><div><b>Pneus disponíveis para montagem</b><p>Selecione um pneu e depois uma posição no chassi. Você também pode arrastar.</p></div><Chip tone="gray">{unmounted.length} disponíveis</Chip></div>
                  <div className="ef-tire-stock-strip">
                    {unmounted.length === 0 ? <span className="ef-t12" style={{ color: 'var(--mute)' }}>Nenhum pneu disponível com os filtros atuais.</span> : unmounted.map(t => (
                      <TireChip key={t.id} t={t} selected={selectedTireForActionId === t.id}
                        onSelect={id => setSelectedTireForActionId(previous => previous === id ? null : id)}
                        onDragStartTire={id => { setDraggedTireId(id); setSelectedTireForActionId(id); }}
                        onDragEndTire={() => setDraggedTireId(null)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-4">
              <div
                className="flex flex-wrap items-center gap-x-5 gap-y-2 ef-t12_5"
                style={{ color: 'var(--ink2)' }}
              >
                {getTireRecapLegend(tires).map((cycle) => (
                  <span key={cycle.label} className="flex items-center gap-2"><i className="ef-w3_5 ef-h3_5 rounded inline-block" style={{ background: cycle.c }} />{cycle.label}</span>
                ))}
              </div>
              <div
                className="drop p-4 flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const d = dropTire();
                  if (d) openTireOperationModal(d, 'Estocar');
                }}
                onClick={() => {
                  if (sel && sel.veiculoAtualId) openTireOperationModal(sel, 'Estocar');
                }}
              >
                <span className="ef-t13">
                  <b>Solte aqui para reservar.</b> Arraste um pneu do chassi para enviá-lo ao
                  almoxarifado.
                </span>
                <span className="ef-t13 font-semibold" style={{ color: 'var(--teal)' }}>
                  Enviar ao almoxarifado
                </span>
              </div>
            </div>
          </div>
        ))}

      {slotPickerOpen && sel && activeVehicle && (
        <Modal title={`Montar pneu #${sel.fogo}`} onClose={() => setSlotPickerOpen(false)}>
          <div className="space-y-4">
            <p className="ef-t13" style={{ color: 'var(--ink2)' }}>Escolha a posição livre no veículo {activeVehicle.placa}. Você poderá conferir a operação antes de salvar.</p>
            <Field label="Posição no chassi">
              <select className="inp" value={selectedSlotCode} onChange={event => setSelectedSlotCode(event.target.value)}>
                {freeSlots.map(slot => <option key={slot.code} value={slot.code}>{slot.label} ({slot.code})</option>)}
              </select>
            </Field>
            <div className="flex flex-wrap justify-end gap-2">
              <Btn onClick={() => setSlotPickerOpen(false)}>Cancelar</Btn>
              <Btn v="primary" disabled={!selectedSlotCode || !freeSlots.some(slot => slot.code === selectedSlotCode)}
                onClick={() => { setSlotPickerOpen(false); openTireOperationModal(sel, 'Mount', activeVehicle.id, selectedSlotCode); }}>
                Continuar montagem
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {swapDraft && activeVehicle && (() => {
        const source = tires.find((t) => t.id === swapDraft.sourceId); const target = tires.find((t) => t.id === swapDraft.targetId);
        if (!source || !target) return null;
        return <Modal title={`Trocar pneus #${source.fogo} e #${target.fogo}`} onClose={() => setSwapDraft(null)}>
          <form onSubmit={confirmTireSwap} className="space-y-4">
            <p className="ef-t13" style={{ color: 'var(--ink2)' }}>As posições <b>{source.posicaoAtual}</b> e <b>{target.posicaoAtual}</b> serão invertidas no veículo {activeVehicle.placa}. Os KM sugeridos consideram a diferença desde a última leitura do hodômetro em cada pneu; confira antes de confirmar.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`KM final do pneu #${source.fogo}`}><input required type="number" min={source.kmTotal} className="inp mono" value={swapDraft.kmSource} onChange={(e) => setSwapDraft({ ...swapDraft, kmSource: e.target.value })} /></Field>
              <Field label={`KM final do pneu #${target.fogo}`}><input required type="number" min={target.kmTotal} className="inp mono" value={swapDraft.kmTarget} onChange={(e) => setSwapDraft({ ...swapDraft, kmTarget: e.target.value })} /></Field>
            </div>
            <Field label={`KM atual do veículo ${activeVehicle.placa}`}><input type="number" min={activeVehicle.kmAtual} className="inp mono" value={swapDraft.kmVehicle} onChange={(e) => setSwapDraft({ ...swapDraft, kmVehicle: e.target.value })} /></Field>
            <FormActions onCancel={() => setSwapDraft(null)} label="Confirmar troca de posições" v="primary" />
          </form>
        </Modal>;
      })()}

      {tireHubSubTab === 'stock' && (
        <div className="card overflow-hidden ef-rise">
          <SectionHead
            title="Pneus em estoque"
            sub="Disponíveis no almoxarifado, fora dos veículos"
          >
            <Chip tone="teal">{totalStockTires.length} pneus</Chip>
          </SectionHead>
          {totalStockTires.length === 0 ? (
            <Empty
              icon={Package}
              title="Estoque vazio"
              text="Cadastre um pneu ou envie um pneu do chassi ao almoxarifado."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Nº fogo</th>
                    <th>Marca / medida</th>
                    <th>Ciclo</th>
                    <th className="ef-tc">Sulco</th>
                    <th>Local</th>
                    <th className="ef-tr">KM</th>
                    <th className="ef-tc">Histórico</th>
                    <th className="ef-tr">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {totalStockTires.map((t) => {
                    const st = getTireRecapStyle(t.recapagens);
                    return (
                      <tr key={t.id}>
                        <td>
                          <span
                            className="mono ef-t12 font-bold text-white ef-px2_5 py-1 rounded-md"
                            style={{ background: st.c }}
                          >
                            #{t.fogo}
                          </span>
                        </td>
                        <td>
                          <div className="font-semibold">{t.marca}</div>
                          <div className="mono ef-t12" style={{ color: 'var(--mute)' }}>
                            {t.medida}
                          </div>
                        </td>
                        <td className="ef-t13">
                          <div>{st.label}</div>
                        </td>
                        <td className="mono text-center">{t.sulcoMm} mm</td>
                        <td className="mono ef-t12_5">{t.localEstoque || 'Almoxarifado'}</td>
                        <td className="mono text-right font-bold">{formatNumber(t.kmTotal)} km</td>
                        <td className="text-center">
                          <button
                            onClick={() => setHistoryModalTire(t)}
                            className="font-semibold ef-hu"
                            style={{ color: 'var(--teal)' }}
                          >
                            Movimentações
                          </button>
                        </td>
                        <td className="text-right whitespace-nowrap ef-sx15">
                          <Btn
                            sm
                            v="primary"
                            onClick={() => {
                              setSelectedTireForActionId(t.id);
                              setTireHubSubTab('chassis');
                            }}
                          >
                            Montar
                          </Btn>
                          {t.classificacao === 'Recapar' ? (
                            <Btn sm v="soft" onClick={() => handleCompleteRecap(t)}>
                              Concluir recape
                            </Btn>
                          ) : (
                            <Btn sm onClick={() => openTireOperationModal(t, 'Recapar')}>
                              Recapar
                            </Btn>
                          )}
                          <Btn sm onClick={() => openTireOperationModal(t, 'Sucatear')}>
                            Sucatear
                          </Btn>
                          <Btn sm onClick={() => startEditTire(t)}>
                            Editar
                          </Btn>
                          <Btn sm className="ef-del" onClick={() => handleDeleteTire(t)}>
                            Excluir
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tireHubSubTab === 'all' && (
        <div className="card overflow-hidden ef-rise">
          <SectionHead
            title="Controle geral de pneus"
            sub="Todos os pneus, com a soma de KM em diferentes veículos"
          />
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nº fogo</th>
                  <th>Marca / medida</th>
                  <th>Status</th>
                  <th>Veículo / posição</th>
                  <th style={{ minWidth: 190 }}>KM acumulado</th>
                  <th className="ef-tc">Histórico</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tires.map((t) => {
                  const veh = vehicles.find((v) => v.id === t.veiculoAtualId);
                  const st = getTireRecapStyle(t.recapagens);
                  const lim = getTireLimits(t, company);
                  const pct = Math.min(
                    100,
                    ((Number(t.kmTotal) || 0) / (lim.kmSucatear || 1)) * 100
                  );
                  const barC =
                    t.kmTotal >= lim.kmSucatear
                      ? 'var(--red)'
                      : t.kmTotal >= lim.kmRecapar
                      ? 'var(--amber)'
                      : 'var(--teal)';
                  return (
                    <tr key={t.id}>
                      <td>
                        <span
                          className="mono ef-t12 font-bold text-white ef-px2_5 py-1 rounded-md"
                          style={{ background: st.c }}
                        >
                          #{t.fogo}
                        </span>
                      </td>
                      <td>
                        <div className="font-semibold">{t.marca}</div>
                        <div className="mono ef-t12" style={{ color: 'var(--mute)' }}>
                          {t.medida}
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center rounded-lg px-2.5 py-1 ef-t12 font-semibold text-white" style={{ background: st.c }}>
                          {t.classificacao}
                        </span>
                        <div className="ef-t11_5 mt-1" style={{ color: 'var(--mute)' }}>
                          {st.label}
                        </div>
                      </td>
                      <td className="mono ef-t12_5">
                        {veh ? `${veh.placa} (${t.posicaoAtual})` : t.localEstoque || 'Estoque'}
                      </td>
                      <td>
                        <div className="mono font-bold ef-t13">{formatNumber(t.kmTotal)} km</div>
                        <div
                          className="ef-h1_5 rounded-full ef-mt1_5 overflow-hidden"
                          style={{ background: 'var(--line2)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: barC,
                              transition: 'width .6s cubic-bezier(.2,.7,.2,1)',
                            }}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <Btn sm icon={History} onClick={() => setHistoryModalTire(t)}>
                          Movimentações
                        </Btn>
                      </td>
                      <td className="text-right whitespace-nowrap ef-sx15">
                        <Btn sm v="dark" onClick={() => openTireOperationModal(t, 'AddKm')}>
                          + KM
                        </Btn>
                        <Btn sm onClick={() => openTireOperationModal(t, 'Estocar')}>
                          Estocar
                        </Btn>
                        {t.classificacao === 'Recapar' && !t.veiculoAtualId ? (
                          <Btn sm v="soft" onClick={() => handleCompleteRecap(t)}>
                            Concluir recape
                          </Btn>
                        ) : (
                          <Btn sm onClick={() => openTireOperationModal(t, 'Recapar')}>
                            Recapar
                          </Btn>
                        )}
                        <Btn sm onClick={() => openTireOperationModal(t, 'Sucatear')}>
                          Sucatear
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
