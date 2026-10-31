'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Package,
  Disc,
  Plus,
  Search,
  Truck,
  History,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatNumber } from '@/services/api';
import { getTireLimits, getTireRecapStyle } from '@/services/pneusService';
import { getVehicleChassisSlots } from '@/services/veiculosService';
import { Btn, Chip, Empty, Field, SectionHead, TireChip, cx } from '@/components/ui';
import { TipoOperacaoPneu } from '@/types/frotawise';

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
    setShowTireModal,
    startEditTire,
    handleDeleteTire,
    showToast,
  } = useEstoquePneus();

  const [tireHubSubTab, setTireHubSubTab] = useState<'chassis' | 'stock' | 'all'>('chassis');
  const [chassisEquipSearch, setChassisEquipSearch] = useState('');
  const [chassisTireSearch, setChassisTireSearch] = useState('');
  const [chassisFilterBy, setChassisFilterBy] = useState<'fogo' | 'marca' | 'medida'>('fogo');

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
  const armed = !!sel || !!draggedTireId;
  const dropTire = () => (draggedTireId ? tires.find((t) => t.id === draggedTireId) : null);

  const renderSlot = (slot: { code: string; label: string }) => {
    const mt = mounted.find((t) => t.posicaoAtual === slot.code);
    if (mt) {
      return (
        <TireChip
          key={slot.code}
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
      <div
        key={slot.code}
        className={cx('slot', armed && 'slot-armed')}
        title={`Posição vaga: ${slot.label}`}
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
      </div>
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
        <Btn v="primary" icon={Plus} onClick={() => setShowTireModal(true)}>
          Novo pneu
        </Btn>
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
                <div className="flex items-center gap-2">
                  {(['Sucatear', 'Estocar', 'Recapar'] as const).map((a) => (
                    <button
                      key={a}
                      className={cx(
                        'btn btn-sm',
                        sel ? (a === 'Sucatear' ? 'btn-danger' : 'btn-dark') : 'btn-ghost'
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        const d = dropTire();
                        if (d) openTireOperationModal(d, a as TipoOperacaoPneu);
                      }}
                      onClick={() => {
                        if (!sel) {
                          showToast('Selecione ou arraste um pneu primeiro!', 'error');
                          return;
                        }
                        openTireOperationModal(sel, a as TipoOperacaoPneu);
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 ef-t13"
              style={{
                background: 'var(--card2)',
                borderBottom: '1px solid var(--line)',
                color: 'var(--ink2)',
              }}
            >
              <span>
                Clique ou arraste um pneu para trocar de posição, <b>estocar</b>, <b>recapar</b> ou{' '}
                <b>sucatear</b>.
              </span>
              {sel && (
                <div className="flex items-center gap-2 ef-fade">
                  <Chip tone="teal">
                    Fogo #{sel.fogo} · {formatNumber(sel.kmTotal)} km
                  </Chip>
                  <Btn
                    sm
                    v="dark"
                    icon={Plus}
                    onClick={() => openTireOperationModal(sel, 'AddKm')}
                  >
                    Somar KM
                  </Btn>
                </div>
              )}
            </div>

            <div className="p-5 ef-g-chassis">
              <div className="overflow-x-auto flex justify-center py-4">
                <div className="flex items-center" style={{ minWidth: 540 }}>
                  <div className="w-3 h-28 rounded-sm" style={{ background: 'var(--axle)' }} />
                  <div className="w-5 h-2" style={{ background: 'var(--rail)' }} />
                  <div className="z-10">{renderSlot(layout.spareSlot)}</div>
                  <div className="w-7 ef-h2_5" style={{ background: 'var(--rail)' }} />
                  <div className="relative flex items-center gap-8">
                    <div
                      className="absolute left-0 right-0 top-1/2 -translate-y-1/2 ef-h2_5 rounded-full"
                      style={{ background: 'var(--rail)' }}
                    />
                    {[...layout.axles].reverse().map((ax) => (
                      <div key={ax.axleNumber} className="relative z-10 flex flex-col items-center">
                        <div className="flex flex-col ef-gap1_5 mb-3">
                          {ax.leftSlots.map(renderSlot)}
                        </div>
                        <div
                          className="ef-w1_5 h-10 rounded-full"
                          style={{ background: 'var(--axle)' }}
                        />
                        <div className="flex flex-col ef-gap1_5 mt-3">
                          {ax.rightSlots.map(renderSlot)}
                        </div>
                        <span
                          className="mt-2 ef-t11 font-semibold"
                          style={{ color: 'var(--mute)' }}
                        >
                          {ax.axleNumber}º eixo
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="w-7 ef-h2_5" style={{ background: 'var(--rail)' }} />
                  <div
                    className="w-10 h-28 rounded-r-2xl"
                    style={{ background: 'var(--axle)' }}
                    title="Cabine"
                  />
                </div>
              </div>

              <div className="ef-chassis-side">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">Pneus em estoque</span>
                  <Chip tone="gray">{unmounted.length}</Chip>
                </div>
                <p className="ef-t12_5 mb-3" style={{ color: 'var(--mute)' }}>
                  Arraste para uma posição vaga do chassi.
                </p>
                <div className="flex flex-wrap ef-gap2_5 max-h-56 overflow-y-auto p-1">
                  {unmounted.length === 0 && (
                    <span className="ef-t13" style={{ color: 'var(--mute)' }}>
                      Nenhum pneu encontrado.
                    </span>
                  )}
                  {unmounted.map((t) => (
                    <TireChip
                      key={t.id}
                      t={t}
                      selected={selectedTireForActionId === t.id}
                      onSelect={(id) => setSelectedTireForActionId((p) => (p === id ? null : id))}
                      onDragStartTire={(id) => {
                        setDraggedTireId(id);
                        setSelectedTireForActionId(id);
                      }}
                      onDragEndTire={() => setDraggedTireId(null)}
                    />
                  ))}
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
                            {(t.historicoVeiculos || []).length} veículos
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
                        <Chip
                          tone={
                            t.classificacao === 'Sucatear'
                              ? 'red'
                              : t.classificacao === 'Recapar'
                              ? 'amber'
                              : t.classificacao === 'Rodando'
                              ? 'teal'
                              : 'gray'
                          }
                        >
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
                          {(t.historicoVeiculos || []).length} veículos
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
