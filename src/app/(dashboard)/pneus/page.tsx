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
import { formatNumber } from '@/services/api';
import { getTireLimits, getTireRecapStyle } from '@/services/pneusService';
import { getClassificacaoTone } from '@/services/statusTones';
import { getVehicleChassisSlots } from '@/services/veiculosService';
import { Btn, Chip, Empty, Field, Modal, SectionHead, TireChip, cx } from '@/components/ui';
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
    setHistoryModalTire,
    startEditTire,
    handleDeleteTire,
  } = useEstoquePneus();

  const [tireHubSubTab, setTireHubSubTab] = useState<'chassis' | 'stock' | 'all'>('chassis');
  const [chassisEquipSearch, setChassisEquipSearch] = useState('');
  const [chassisTireSearch, setChassisTireSearch] = useState('');
  const [chassisFilterBy, setChassisFilterBy] = useState<'fogo' | 'marca' | 'medida'>('fogo');
  const [zoomed, setZoomed] = useState(false);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [selectedSlotCode, setSelectedSlotCode] = useState('');

  const activeVehicle =
    vehicles.find((v) => v.id === selectedChassisVehicleId) || vehicles[0];
  const layout = activeVehicle ? getVehicleChassisSlots(activeVehicle.eixos) : null;
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
  ].filter(slot => !mounted.some(t => t.posicaoAtual === slot.code)) : [];
  const openSlotPicker = () => {
    setSelectedSlotCode(freeSlots[0]?.code || '');
    setSlotPickerOpen(true);
  };
  const armed = !!sel || !!draggedTireId;
  const dropTire = () => (draggedTireId ? tires.find((t) => t.id === draggedTireId) : null);

  const renderSlot = (slot: { code: string; label: string }) => {
    const mt = mounted.find((t) => t.posicaoAtual === slot.code);
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
                <ChassisView layout={layout} eixos={activeVehicle.eixos} renderSlot={renderSlot} zoomed={zoomed} />
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
                {[0, 1, 2, 3, 4].map((n) => {
                  const s = getTireRecapStyle(n);
                  return (
                    <span key={n} className="flex items-center gap-2">
                      <i
                        className="ef-w3_5 ef-h3_5 rounded inline-block"
                        style={{ background: s.c }}
                      />
                      {s.label}
                    </span>
                  );
                })}
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
                        <td className="ef-t13">{st.label}</td>
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
                          <Btn sm onClick={() => openTireOperationModal(t, 'Recapar')}>
                            Recapar
                          </Btn>
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
                        <Chip tone={getClassificacaoTone(t.classificacao)}>
                          {t.classificacao}
                        </Chip>
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
                        <Btn sm onClick={() => openTireOperationModal(t, 'Recapar')}>
                          Recapar
                        </Btn>
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
