'use client';

import React, { useState, useEffect } from 'react';
import { Disc, History, X } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import {
  BANDAS_PNEU,
  CATEGORIAS_MANUTENCAO,
  NIC_MULTIPLICADOR,
  TIPOS_COMBUSTIVEL,
  formatCurrency,
  formatDec,
  formatNumber,
  today,
} from '@/services/api';
import { getTireLimits, getTireRecapStyle } from '@/services/pneusService';
import { cmpFuel, computeFuelMedias } from '@/services/veiculosService';
import {
  Btn,
  Chip,
  Drawer,
  Empty,
  Field,
  FormActions,
  Modal,
  Plate,
  SectionHead,
} from '@/components/ui';
import { useRouter } from 'next/navigation';
import { StatusMulta, TipoCombustivel, TipoManutencao } from '@/types/frotawise';

export const GlobalModals: React.FC = () => {
  const router = useRouter();
  const {
    company,
    vehicles,
    setVehicles,
    tires,
    setTires,
    maintenances,
    setMaintenances,
    fines,
    setFines,
    fuelings,
    setFuelings,
    showToast,
    tireAlerts,
    selectedChassisVehicleId,
    setSelectedChassisVehicleId,
    setSelectedTireForActionId,
    tireActionModal,
    setTireActionModal,
    historyModalTire,
    setHistoryModalTire,
    detailVehicleId,
    setDetailVehicleId,
    showVehicleModal,
    setShowVehicleModal,
    showTireModal,
    setShowTireModal,
    showMaintenanceModal,
    setShowMaintenanceModal,
    maintenancePrefill,
    setMaintenancePrefill,
    showFineModal,
    setShowFineModal,
    showFuelModal,
    setShowFuelModal,
  } = useEstoquePneus();

  const [actionKmInput, setActionKmInput] = useState('');
  const [actionObsInput, setActionObsInput] = useState('');
  const [actionStockLocInput, setActionStockLocInput] = useState('Prateleira A-01');
  const [actionBandaInput, setActionBandaInput] = useState('');
  const [actionFornecedorInput, setActionFornecedorInput] = useState('');
  const [actionValorInput, setActionValorInput] = useState('');

  useEffect(() => {
    if (tireActionModal) {
      setActionKmInput('');
      setActionObsInput('');
      setActionStockLocInput(tireActionModal.tire.localEstoque || 'Prateleira A-01');
      setActionBandaInput(tireActionModal.tire.tipoBanda || '');
      setActionFornecedorInput('');
      setActionValorInput('');
    }
  }, [tireActionModal]);

  const emptyVehicle = { placa: '', uf: 'SP', modelo: '', categoria: '', eixos: 3, kmAtual: '' };
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);

  const emptyTire = {
    fogo: '',
    marca: '',
    medida: '295/80 R22.5',
    sulcoMm: 15,
    recapagens: 0,
    kmInicial: 0,
    localEstoque: 'Prateleira A-01',
  };
  const [tireForm, setTireForm] = useState(emptyTire);

  const emptyMaint = () => ({
    osNumero: '',
    veiculoId: '',
    tipo: 'Preventiva' as TipoManutencao,
    categoria: '',
    peca: '',
    km: '',
    descricao: '',
    fornecedor: '',
    data: today(),
    valor: '',
  });
  const [maintenanceForm, setMaintenanceForm] = useState(emptyMaint());

  useEffect(() => {
    if (showMaintenanceModal && maintenancePrefill) {
      setMaintenanceForm((prev) => ({
        ...prev,
        veiculoId: maintenancePrefill.veiculoId ?? prev.veiculoId,
        categoria: maintenancePrefill.categoria ?? prev.categoria,
        peca: maintenancePrefill.peca ?? prev.peca,
        tipo: maintenancePrefill.tipo ?? prev.tipo,
      }));
      setMaintenancePrefill(null);
    }
  }, [showMaintenanceModal, maintenancePrefill, setMaintenancePrefill]);

  const emptyFine = () => ({
    ait: '',
    veiculoId: '',
    motivo: '',
    identificado: true,
    motorista: '',
    status: 'Pendente' as StatusMulta,
    data: today(),
    pontos: 4,
    valor: '',
  });
  const [fineForm, setFineForm] = useState(emptyFine());

  const emptyFuel = () => ({
    veiculoId: '',
    tipo: 'Diesel' as TipoCombustivel,
    data: today(),
    litros: '',
    valorUnit: '',
    km: '',
    fornecedor: '',
  });
  const [fuelForm, setFuelForm] = useState(emptyFuel());

  const handleConfirmTireOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tireActionModal) return;
    const { tire, targetAction, targetVehicleId, targetSlotCode } = tireActionModal;
    const kmToAdd = Math.max(0, Number(actionKmInput) || 0);
    const currentVehicle = vehicles.find((v) => v.id === tire.veiculoAtualId);
    const targetVehicle = vehicles.find((v) => v.id === targetVehicleId);

    setTires((prev) =>
      prev.map((t) => {
        if (t.id !== tire.id) return t;
        const hist = [...(t.historicoVeiculos || [])];
        if (kmToAdd > 0) {
          hist.push({
            id: 'h-' + Date.now(),
            placa: currentVehicle
              ? currentVehicle.placa
              : targetVehicle
              ? targetVehicle.placa
              : 'AVULSO',
            modelo: currentVehicle
              ? currentVehicle.modelo
              : targetVehicle
              ? targetVehicle.modelo
              : 'Lançamento Manual',
            kmRodados: kmToAdd,
            data: today(),
            obs:
              actionObsInput.trim() ||
              (targetAction === 'AddKm'
                ? 'Lançamento de KM no veículo'
                : `Operação (${targetAction}) na posição ${t.posicaoAtual || 'Estoque'}`),
          });
        }
        const km = (Number(t.kmTotal) || 0) + kmToAdd;
        const base = { ...t, kmTotal: km, historicoVeiculos: hist };
        if (targetAction === 'Mount')
          return {
            ...base,
            classificacao: 'Rodando',
            veiculoAtualId: targetVehicleId,
            posicaoAtual: targetSlotCode,
            localEstoque: '',
          };
        if (targetAction === 'Estocar')
          return {
            ...base,
            classificacao: 'Estocar',
            veiculoAtualId: '',
            posicaoAtual: '',
            localEstoque: actionStockLocInput || 'Almoxarifado Geral',
          };
        if (targetAction === 'Recapar')
          return {
            ...base,
            classificacao: 'Recapar',
            veiculoAtualId: '',
            posicaoAtual: '',
            localEstoque: 'Em Recapadora Externa',
            tipoBanda: actionBandaInput,
            reformas: [
              ...(t.reformas || []),
              {
                id: 'r-' + Date.now(),
                data: today(),
                ciclo: (Number(t.recapagens) || 0) + 1,
                tipoBanda: actionBandaInput,
                fornecedor: actionFornecedorInput.trim(),
                valor: Number(actionValorInput) || 0,
              },
            ],
          };
        if (targetAction === 'Sucatear')
          return {
            ...base,
            classificacao: 'Sucatear',
            veiculoAtualId: '',
            posicaoAtual: '',
            localEstoque: 'Baixa / Sucata',
          };
        return base;
      })
    );

    setSelectedTireForActionId(null);
    setTireActionModal(null);
    showToast(`Pneu Fogo #${tire.fogo} atualizado com sucesso!`);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.placa.trim() || !vehicleForm.categoria.trim()) return;
    const nv = {
      id: 'v-' + Date.now(),
      placa: vehicleForm.placa.toUpperCase().trim(),
      uf: vehicleForm.uf.toUpperCase().trim() || 'SP',
      modelo: vehicleForm.modelo.trim() || vehicleForm.categoria.trim(),
      categoria: vehicleForm.categoria.trim(),
      eixos: Math.max(2, Math.min(6, Number(vehicleForm.eixos) || 3)),
      kmAtual: Number(vehicleForm.kmAtual) || 0,
      status: 'Operando' as const,
    };
    setVehicles((p) => [...p, nv]);
    if (!selectedChassisVehicleId) setSelectedChassisVehicleId(nv.id);
    setShowVehicleModal(false);
    setVehicleForm(emptyVehicle);
    showToast(`Veículo ${nv.placa} cadastrado!`);
  };

  const handleCreateTire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tireForm.fogo.trim() || !tireForm.marca.trim()) return;
    const kmIni = Math.max(0, Number(tireForm.kmInicial) || 0);
    const nt = {
      id: 't-' + Date.now(),
      fogo: tireForm.fogo.toUpperCase().trim(),
      marca: tireForm.marca.trim(),
      medida: tireForm.medida.trim() || '295/80 R22.5',
      sulcoMm: Number(tireForm.sulcoMm) || 15,
      recapagens: Number(tireForm.recapagens) || 0,
      kmTotal: kmIni,
      classificacao: 'Estocar' as const,
      veiculoAtualId: '',
      posicaoAtual: '',
      localEstoque: tireForm.localEstoque || 'Prateleira A-01',
      historicoVeiculos:
        kmIni > 0
          ? [
              {
                id: 'h-' + Date.now(),
                placa: 'CADASTRO-INICIAL',
                modelo: 'Histórico Anterior',
                kmRodados: kmIni,
                data: today(),
                obs: 'Quilometragem inicial no cadastro',
              },
            ]
          : [],
    };
    setTires((p) => [...p, nt]);
    setShowTireModal(false);
    setTireForm(emptyTire);
    showToast(`Pneu Fogo #${nt.fogo} cadastrado no estoque!`);
  };

  const checkMaintenanceKm = (form: typeof maintenanceForm) => {
    const veh = vehicles.find((v) => v.id === form.veiculoId);
    const km = Math.round(Number(form.km));
    if (!veh) return { erro: '', veh, km };
    if (form.km === '' || !Number.isFinite(km) || km < 0)
      return { erro: 'Informe a quilometragem do veículo nesta manutenção.', veh, km };
    const date = form.data;
    const daVeiculo = maintenances.filter((m) => m.veiculoId === veh.id);
    const comKm = daVeiculo.filter(
      (m) => m.km !== null && m.km !== undefined && Number.isFinite(Number(m.km))
    );
    const prev = comKm
      .filter((m) => m.data <= date)
      .reduce<typeof comKm[0] | null>(
        (a, m) =>
          !a || m.data > a.data || (m.data === a.data && Number(m.km) > Number(a.km)) ? m : a,
        null
      );
    const next = comKm
      .filter((m) => m.data > date)
      .reduce<typeof comKm[0] | null>((a, m) => (!a || m.data < a.data ? m : a), null);
    const isLatest = daVeiculo.every((m) => m.data <= date);
    let erro = '';
    if (prev && km < Number(prev.km))
      erro = `KM menor que a manutenção anterior (${prev.osNumero}: ${formatNumber(
        prev.km || 0
      )} km em ${prev.data}).`;
    else if (next && km > Number(next.km))
      erro = `KM maior que a manutenção seguinte (${next.osNumero}: ${formatNumber(
        next.km || 0
      )} km em ${next.data}).`;
    else if (isLatest && km < (Number(veh.kmAtual) || 0))
      erro = `KM menor que o hodômetro atual de ${veh.placa} (${formatNumber(veh.kmAtual)} km).`;
    return { erro, veh, km };
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !maintenanceForm.veiculoId ||
      !maintenanceForm.descricao.trim() ||
      !maintenanceForm.valor ||
      !maintenanceForm.categoria
    )
      return;
    const { erro, veh, km } = checkMaintenanceKm(maintenanceForm);
    if (erro || !veh) {
      showToast(erro || 'Veículo inválido', 'error');
      return;
    }
    const date = maintenanceForm.data;
    const nm = {
      id: 'm-' + Date.now(),
      osNumero:
        maintenanceForm.osNumero.trim() || `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      veiculoId: maintenanceForm.veiculoId,
      tipo: maintenanceForm.tipo,
      categoria: maintenanceForm.categoria,
      peca: (maintenanceForm.peca || '').trim(),
      km,
      descricao: maintenanceForm.descricao.trim(),
      fornecedor: maintenanceForm.fornecedor.trim() || 'Oficina Credenciada',
      data: date,
      valor: Number(maintenanceForm.valor) || 0,
    };
    setMaintenances((p) => [nm, ...p]);

    let msg = 'Despesa de manutenção registrada!';
    const delta = km - (Number(veh.kmAtual) || 0);
    if (delta > 0) {
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: km } : v)));
      const rolando = (t: typeof tires[0]) =>
        t.veiculoAtualId === veh.id && t.posicaoAtual !== 'ESTEPE-1';
      const qtd = tires.filter(rolando).length;
      if (qtd) {
        setTires((p) =>
          p.map((t) =>
            rolando(t)
              ? {
                  ...t,
                  kmTotal: (Number(t.kmTotal) || 0) + delta,
                  historicoVeiculos: [
                    ...(t.historicoVeiculos || []),
                    {
                      id: `h-${Date.now()}-${t.id}`,
                      placa: veh.placa,
                      modelo: veh.modelo,
                      kmRodados: delta,
                      data: date,
                      obs: `Sincronizado com o hodômetro (${nm.osNumero})`,
                    },
                  ],
                }
              : t
          )
        );
      }
      msg = `Manutenção registrada. Hodômetro de ${veh.placa}: ${formatNumber(
        km
      )} km (+${formatNumber(delta)}); ${qtd} pneus montados somaram o mesmo KM.`;
    }
    setShowMaintenanceModal(false);
    setMaintenanceForm(emptyMaint());
    showToast(msg);
  };

  const checkFuelKm = (form: typeof fuelForm) => {
    const veh = vehicles.find((v) => v.id === form.veiculoId);
    const km = Math.round(Number(form.km));
    if (!veh) return { erro: '', veh, km };
    if (form.km === '' || !Number.isFinite(km) || km < 0)
      return { erro: 'Informe a quilometragem do veículo neste abastecimento.', veh, km };
    const date = form.data;
    const serie = [
      ...fuelings
        .filter((f) => f.veiculoId === veh.id)
        .map((f) => ({ data: f.data, km: Number(f.km), rotulo: `abastecimento de ${f.data}` })),
      ...maintenances
        .filter(
          (m) =>
            m.veiculoId === veh.id &&
            m.km !== null &&
            m.km !== undefined &&
            Number.isFinite(Number(m.km))
        )
        .map((m) => ({
          data: m.data,
          km: Number(m.km),
          rotulo: `manutenção ${m.osNumero} de ${m.data}`,
        })),
    ];
    const prev = serie
      .filter((x) => x.data <= date)
      .reduce<typeof serie[0] | null>(
        (a, x) => (!a || x.data > a.data || (x.data === a.data && x.km > a.km) ? x : a),
        null
      );
    const next = serie
      .filter((x) => x.data > date)
      .reduce<typeof serie[0] | null>((a, x) => (!a || x.data < a.data ? x : a), null);
    const isLatest = serie.every((x) => x.data <= date);
    let erro = '';
    if (prev && km < prev.km)
      erro = `KM menor que o registro anterior (${prev.rotulo}: ${formatNumber(prev.km)} km).`;
    else if (next && km > next.km)
      erro = `KM maior que o registro seguinte (${next.rotulo}: ${formatNumber(next.km)} km).`;
    else if (isLatest && km < (Number(veh.kmAtual) || 0))
      erro = `KM menor que o hodômetro atual de ${veh.placa} (${formatNumber(veh.kmAtual)} km).`;
    return { erro, veh, km };
  };

  const handleCreateFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const litros = Number(fuelForm.litros);
    const unit = Number(fuelForm.valorUnit);
    if (!fuelForm.veiculoId || !(litros > 0) || !(unit > 0)) return;
    const { erro, veh, km } = checkFuelKm(fuelForm);
    if (erro || !veh) {
      showToast(erro || 'Veículo inválido', 'error');
      return;
    }
    const total = Math.round(litros * unit * 100) / 100;
    const nf = {
      id: 'ab-' + Date.now(),
      veiculoId: veh.id,
      tipo: fuelForm.tipo,
      data: fuelForm.data,
      litros,
      valorUnit: unit,
      valorTotal: total,
      km,
      fornecedor: fuelForm.fornecedor.trim() || 'Posto não informado',
    };
    setFuelings((p) => [nf, ...p]);

    let msg = `Abastecimento registrado: ${formatDec(litros)} L · ${formatCurrency(total)}.`;
    const delta = km - (Number(veh.kmAtual) || 0);
    if (delta > 0) {
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: km } : v)));
      const rolando = (t: typeof tires[0]) =>
        t.veiculoAtualId === veh.id && t.posicaoAtual !== 'ESTEPE-1';
      const qtd = tires.filter(rolando).length;
      if (qtd) {
        setTires((p) =>
          p.map((t) =>
            rolando(t)
              ? {
                  ...t,
                  kmTotal: (Number(t.kmTotal) || 0) + delta,
                  historicoVeiculos: [
                    ...(t.historicoVeiculos || []),
                    {
                      id: `h-${Date.now()}-${t.id}`,
                      placa: veh.placa,
                      modelo: veh.modelo,
                      kmRodados: delta,
                      data: fuelForm.data,
                      obs: 'Sincronizado com o hodômetro (abastecimento)',
                    },
                  ],
                }
              : t
          )
        );
      }
      msg += ` Hodômetro de ${veh.placa}: ${formatNumber(km)} km (+${formatNumber(
        delta
      )}); ${qtd} pneus montados somaram o mesmo KM.`;
    }
    const med = computeFuelMedias([nf, ...fuelings])[nf.id];
    if (med) msg += ` Média: ${formatDec(med.media)} km/l.`;
    setShowFuelModal(false);
    setFuelForm(emptyFuel());
    showToast(msg);
  };

  const handleCreateFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fineForm.veiculoId || !fineForm.motivo.trim() || !fineForm.valor) return;
    const ident = fineForm.identificado !== false;
    const base = Number(fineForm.valor) || 0;
    const nic = ident ? 0 : base * NIC_MULTIPLICADOR;
    const nf = {
      id: 'f-' + Date.now(),
      ait: fineForm.ait.toUpperCase().trim() || `AIT-${Math.floor(10000 + Math.random() * 90000)}`,
      veiculoId: fineForm.veiculoId,
      motivo: fineForm.motivo.trim(),
      identificado: ident,
      motorista: ident ? fineForm.motorista.trim() || 'Não informado' : 'Não identificado',
      status: fineForm.status,
      data: fineForm.data,
      pontos: ident ? Number(fineForm.pontos) || 4 : 0,
      valorOriginal: base,
      valorNIC: nic,
      valor: base + nic,
    };
    setFines((p) => [nf, ...p]);
    setShowFineModal(false);
    setFineForm(emptyFine());
    showToast(
      ident
        ? 'Multa lançada nas despesas do veículo!'
        : `Multa lançada com NIC: total ${formatCurrency(nf.valor)}.`
    );
  };

  const renderVehicleDrawer = () => {
    const v = vehicles.find((x) => x.id === detailVehicleId);
    if (!v) return null;
    const close = () => setDetailVehicleId(null);
    const totalSlots = 2 + (Math.max(2, Math.min(6, Number(v.eixos) || 3)) - 1) * 4;
    const mountedTires = tires.filter((t) => t.veiculoAtualId === v.id);
    const filled = mountedTires.filter((t) => t.posicaoAtual !== 'ESTEPE-1').length;
    const occ = Math.min(100, Math.round((filled / totalSlots) * 100));
    const events = [
      ...maintenances
        .filter((m) => m.veiculoId === v.id)
        .map((m) => ({
          k: 'm',
          id: m.id,
          data: m.data,
          titulo: `${m.tipo} · ${m.osNumero}`,
          texto: `${m.categoria ? m.categoria + ' · ' : ''}${
            m.km ? formatNumber(m.km) + ' km · ' : ''
          }${m.descricao}`,
          valor: m.valor,
        })),
      ...fines
        .filter((f) => f.veiculoId === v.id)
        .map((f) => ({
          k: 'f',
          id: f.id,
          data: f.data,
          titulo: `Multa · ${f.status}`,
          texto: f.motivo,
          valor: f.valor,
        })),
    ].sort((a, b) => String(b.data).localeCompare(String(a.data)));
    const total = events.reduce((a, e) => a + Number(e.valor || 0), 0);

    return (
      <Drawer onClose={close}>
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Plate v={v} />
                <Chip tone={v.status === 'Operando' ? 'teal' : 'amber'}>{v.status}</Chip>
              </div>
              <h2 className="ef-t20 font-semibold mt-2">{v.modelo}</h2>
              <div className="ef-t13" style={{ color: 'var(--mute)' }}>
                {v.categoria}
              </div>
            </div>
            <button aria-label="Fechar" onClick={close} className="icon-btn">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ['Hodômetro', `${formatNumber(v.kmAtual)} km`],
                ['Eixos', v.eixos],
                ['Despesas', formatCurrency(total)],
              ] as const
            ).map(([l, val]) => (
              <div key={l} className="card p-3">
                <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                  {l}
                </div>
                <div className="mono font-bold ef-t13_5 mt-1">{val}</div>
              </div>
            ))}
          </div>

          <div className="card p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="ef-t13 font-semibold">Posições com pneu</div>
                <div className="disp ef-t32 font-semibold leading-none mt-1">{occ}%</div>
              </div>
              <span className="mono ef-t12_5" style={{ color: 'var(--mute)' }}>
                {filled} de {totalSlots} posições
              </span>
            </div>
            <div className="h-3 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--soft)' }}>
              <div
                className="h-full rounded-full ef-grow"
                style={{ width: `${occ}%`, background: 'var(--teal)' }}
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <SectionHead title="Pneus montados" sub="Toque em um pneu para abri-lo no chassi" />
            {mountedTires.length === 0 ? (
              <Empty
                icon={Disc}
                title="Nenhum pneu montado"
                text="Monte pneus no chassi deste veículo."
              />
            ) : (
              <div className="px-5">
                {mountedTires.map((t, i) => {
                  const st = getTireRecapStyle(t.recapagens);
                  const lim = getTireLimits(t, company);
                  const pct = Math.min(100, ((Number(t.kmTotal) || 0) / (lim.kmSucatear || 1)) * 100);
                  const barC =
                    t.kmTotal >= lim.kmSucatear
                      ? 'var(--red)'
                      : t.kmTotal >= lim.kmRecapar
                      ? 'var(--amber)'
                      : 'var(--teal)';
                  const alerted = tireAlerts.some((a) => a.tire.id === t.id);
                  return (
                    <button
                      key={t.id}
                      className="w-full text-left flex items-center gap-3 py-3"
                      style={{ borderTop: i ? '1px solid var(--line2)' : 0 }}
                      onClick={() => {
                        setSelectedTireForActionId(t.id);
                        setSelectedChassisVehicleId(v.id);
                        close();
                        router.push('/pneus');
                      }}
                    >
                      <span
                        className="mono ef-t12 font-bold text-white ef-px2_5 py-1 rounded-md"
                        style={{ background: st.c }}
                      >
                        #{t.fogo}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="block ef-t13 font-medium truncate">{t.marca}</span>
                          {alerted && <Chip tone="amber">Ação pendente</Chip>}
                        </span>
                        <span
                          className="block ef-h1_5 rounded-full ef-mt1_5 overflow-hidden"
                          style={{ background: 'var(--line2)' }}
                        >
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${pct}%`, background: barC }}
                          />
                        </span>
                      </span>
                      <span className="mono ef-t12 text-right shrink-0">
                        <b>{t.posicaoAtual}</b>
                        <br />
                        {formatNumber(t.kmTotal)} km
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="ef-t16 font-semibold mb-3">Linha do tempo de despesas</h3>
            {events.length === 0 ? (
              <div className="ef-t13" style={{ color: 'var(--mute)' }}>
                Nenhuma manutenção ou multa lançada para este veículo.
              </div>
            ) : (
              <ol className="relative ef-ml1_5" style={{ borderLeft: '2px solid var(--line)' }}>
                {events.map((e) => (
                  <li key={e.id} className="pl-4 pb-4 relative">
                    <i
                      className="absolute top-1 w-3 h-3 rounded-full"
                      style={{
                        left: -7,
                        background: e.k === 'f' ? 'var(--red)' : 'var(--teal)',
                        boxShadow: '0 0 0 3px var(--card)',
                      }}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="ef-t13 font-semibold">{e.titulo}</div>
                        <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                          {e.data} · {e.texto}
                        </div>
                      </div>
                      <span className="mono ef-t12_5 font-bold shrink-0">
                        {formatCurrency(e.valor)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pb-2">
            <Btn
              v="primary"
              onClick={() => {
                setSelectedChassisVehicleId(v.id);
                close();
                router.push('/pneus');
              }}
            >
              Ver no chassi
            </Btn>
            <Btn
              onClick={() => {
                setMaintenanceForm({ ...emptyMaint(), veiculoId: v.id });
                setShowMaintenanceModal(true);
              }}
            >
              Lançar manutenção
            </Btn>
            <Btn
              onClick={() => {
                setFineForm({ ...emptyFine(), veiculoId: v.id });
                setShowFineModal(true);
              }}
            >
              Lançar multa
            </Btn>
          </div>
        </div>
      </Drawer>
    );
  };

  return (
    <>
      {renderVehicleDrawer()}

      {tireActionModal && (
        <Modal
          title={`Pneu Fogo #${tireActionModal.tire.fogo} · ${
            tireActionModal.targetAction === 'AddKm'
              ? 'Somar KM'
              : tireActionModal.targetAction === 'Mount'
              ? `Montar em ${tireActionModal.targetSlotCode}`
              : tireActionModal.targetAction
          }`}
          onClose={() => setTireActionModal(null)}
        >
          <form onSubmit={handleConfirmTireOperation} className="space-y-4">
            <Field label="Quantos KM este pneu rodou neste trecho? (soma automática)">
              <input
                type="number"
                min="0"
                className="inp mono"
                placeholder="Ex: 12000"
                autoFocus
                value={actionKmInput}
                onChange={(e) => setActionKmInput(e.target.value)}
              />
            </Field>
            {tireActionModal.targetAction === 'Estocar' && (
              <Field label="Local no estoque">
                <input
                  className="inp"
                  value={actionStockLocInput}
                  onChange={(e) => setActionStockLocInput(e.target.value)}
                />
              </Field>
            )}
            {tireActionModal.targetAction === 'Recapar' && (
              <>
                <Field label="Pneus (tipo de banda)">
                  <select
                    required
                    className="inp"
                    value={actionBandaInput}
                    onChange={(e) => setActionBandaInput(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {BANDAS_PNEU.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fornecedor da reforma">
                    <input
                      required
                      className="inp"
                      value={actionFornecedorInput}
                      onChange={(e) => setActionFornecedorInput(e.target.value)}
                    />
                  </Field>
                  <Field label="Valor da reforma (R$)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="inp mono"
                      value={actionValorInput}
                      onChange={(e) => setActionValorInput(e.target.value)}
                    />
                  </Field>
                </div>
              </>
            )}
            <Field label="Observação">
              <input
                className="inp"
                value={actionObsInput}
                onChange={(e) => setActionObsInput(e.target.value)}
              />
            </Field>
            <FormActions
              onCancel={() => setTireActionModal(null)}
              label="Confirmar"
              v={tireActionModal.targetAction === 'Sucatear' ? 'danger' : 'dark'}
            />
          </form>
        </Modal>
      )}

      {historyModalTire && (
        <Modal
          wide
          title={`Histórico · Fogo #${historyModalTire.fogo} (${formatNumber(
            historyModalTire.kmTotal
          )} km)`}
          onClose={() => setHistoryModalTire(null)}
        >
          {(historyModalTire.historicoVeiculos || []).length === 0 ? (
            <Empty
              icon={History}
              title="Sem histórico"
              text="Este pneu ainda não rodou em nenhum veículo."
            />
          ) : (
            <ol
              className="relative ml-2 max-h-80 overflow-y-auto"
              style={{ borderLeft: '2px solid var(--line)' }}
            >
              {historyModalTire.historicoVeiculos.map((h) => (
                <li key={h.id} className="pl-5 pb-5 relative">
                  <i
                    className="absolute top-1 w-3 h-3 rounded-full"
                    style={{
                      left: -7,
                      background: 'var(--teal)',
                      boxShadow: '0 0 0 3px var(--card)',
                    }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="mono font-bold">{h.placa}</span>{' '}
                      <span style={{ color: 'var(--ink2)' }}>· {h.modelo}</span>
                      <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                        {h.data} · {h.obs}
                      </div>
                    </div>
                    <Chip tone="teal">+{formatNumber(h.kmRodados)} km</Chip>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {(historyModalTire.reformas || []).length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <h4 className="ef-t14 font-semibold mb-2">Reformas (recapagens)</h4>
              {historyModalTire.reformas?.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-3 ef-py1_5 ef-t13">
                  <div>
                    <b>{r.ciclo}ª recapagem</b> · banda {r.tipoBanda || '—'}
                    <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                      {r.data} · {r.fornecedor || 'Fornecedor não informado'}
                    </div>
                  </div>
                  <span className="mono font-bold shrink-0">{formatCurrency(r.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {showVehicleModal && (
        <Modal title="Cadastrar veículo" onClose={() => setShowVehicleModal(false)}>
          <form onSubmit={handleCreateVehicle} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Placa">
                  <input
                    required
                    className="inp mono"
                    placeholder="OPG-2469"
                    value={vehicleForm.placa}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, placa: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="UF">
                <input
                  maxLength={2}
                  className="inp mono"
                  value={vehicleForm.uf}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, uf: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Categoria">
              <input
                required
                className="inp"
                placeholder="Cavalo Trucado 3 Eixos"
                value={vehicleForm.categoria}
                onChange={(e) => setVehicleForm({ ...vehicleForm, categoria: e.target.value })}
              />
            </Field>
            <Field label="Marca / modelo">
              <input
                className="inp"
                value={vehicleForm.modelo}
                onChange={(e) => setVehicleForm({ ...vehicleForm, modelo: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Eixos (2 a 6)">
                <input
                  type="number"
                  min="2"
                  max="6"
                  required
                  className="inp mono"
                  value={vehicleForm.eixos}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, eixos: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="KM atual">
                <input
                  type="number"
                  min="0"
                  className="inp mono"
                  value={vehicleForm.kmAtual}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, kmAtual: e.target.value })}
                />
              </Field>
            </div>
            <FormActions onCancel={() => setShowVehicleModal(false)} label="Salvar veículo" />
          </form>
        </Modal>
      )}

      {showTireModal && (
        <Modal title="Cadastrar pneu" onClose={() => setShowTireModal(false)}>
          <form onSubmit={handleCreateTire} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº fogo">
                <input
                  required
                  className="inp mono"
                  placeholder="375"
                  value={tireForm.fogo}
                  onChange={(e) => setTireForm({ ...tireForm, fogo: e.target.value })}
                />
              </Field>
              <Field label="Medida">
                <input
                  className="inp mono"
                  value={tireForm.medida}
                  onChange={(e) => setTireForm({ ...tireForm, medida: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Marca / modelo">
              <input
                required
                className="inp"
                value={tireForm.marca}
                onChange={(e) => setTireForm({ ...tireForm, marca: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Sulco (mm)">
                <input
                  type="number"
                  step="0.1"
                  className="inp mono"
                  value={tireForm.sulcoMm}
                  onChange={(e) => setTireForm({ ...tireForm, sulcoMm: Number(e.target.value) })}
                />
              </Field>
              <Field label="Recapagens">
                <input
                  type="number"
                  min="0"
                  className="inp mono"
                  value={tireForm.recapagens}
                  onChange={(e) =>
                    setTireForm({ ...tireForm, recapagens: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="KM inicial">
                <input
                  type="number"
                  min="0"
                  className="inp mono"
                  value={tireForm.kmInicial}
                  onChange={(e) => setTireForm({ ...tireForm, kmInicial: Number(e.target.value) })}
                />
              </Field>
            </div>
            {tireForm.marca.trim() &&
              (() => {
                const lim = getTireLimits(
                  {
                    marca: tireForm.marca,
                    medida: tireForm.medida,
                    recapagens: tireForm.recapagens,
                  },
                  company
                );
                return lim.rule ? (
                  <div
                    className="ef-t12_5 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--teal-soft)', color: 'var(--teal-ink)' }}
                  >
                    Regra do modelo reconhecida: próximo aviso{' '}
                    {lim.etapa
                      ? `da ${lim.etapa}ª recapagem aos ${formatNumber(lim.kmRecapar)} km`
                      : 'apenas de sucata'}{' '}
                    · sucata aos {formatNumber(lim.kmSucatear)} km.
                  </div>
                ) : (
                  <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                    Nenhuma regra cadastrada para este modelo/tamanho: serão usados os limites
                    gerais.
                  </div>
                );
              })()}
            <Field label="Local no estoque">
              <input
                className="inp"
                value={tireForm.localEstoque}
                onChange={(e) => setTireForm({ ...tireForm, localEstoque: e.target.value })}
              />
            </Field>
            <FormActions onCancel={() => setShowTireModal(false)} label="Salvar pneu" v="primary" />
          </form>
        </Modal>
      )}

      {showMaintenanceModal && (
        <Modal wide title="Lançar manutenção" onClose={() => setShowMaintenanceModal(false)}>
          <form onSubmit={handleCreateMaintenance} className="space-y-3">
            <Field label="Veículo">
              <select
                required
                className="inp"
                value={maintenanceForm.veiculoId}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, veiculoId: e.target.value })
                }
              >
                <option value="">Selecione o veículo...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.modelo}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº da O.S. (opcional)">
                <input
                  className="inp mono"
                  value={maintenanceForm.osNumero}
                  onChange={(e) =>
                    setMaintenanceForm({ ...maintenanceForm, osNumero: e.target.value })
                  }
                />
              </Field>
              <Field label="Tipo">
                <select
                  className="inp"
                  value={maintenanceForm.tipo}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      tipo: e.target.value as TipoManutencao,
                    })
                  }
                >
                  <option>Preventiva</option>
                  <option>Corretiva</option>
                  <option>Pneus / Recapagem</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria da manutenção">
                <select
                  required
                  className="inp"
                  value={maintenanceForm.categoria}
                  onChange={(e) =>
                    setMaintenanceForm({ ...maintenanceForm, categoria: e.target.value })
                  }
                >
                  <option value="">Selecione...</option>
                  {CATEGORIAS_MANUTENCAO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="KM do veículo nesta manutenção">
                <input
                  type="number"
                  min="0"
                  required
                  className="inp mono"
                  value={maintenanceForm.km}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, km: e.target.value })}
                />
              </Field>
            </div>
            {(() => {
              const vv = vehicles.find((v) => v.id === maintenanceForm.veiculoId);
              if (!vv) return null;
              const chk = maintenanceForm.km !== '' ? checkMaintenanceKm(maintenanceForm) : null;
              if (chk && chk.erro)
                return (
                  <div
                    role="alert"
                    className="ef-t12_5 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--red-soft)', color: 'var(--red-ink)' }}
                  >
                    {chk.erro}
                  </div>
                );
              return (
                <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                  Hodômetro atual de {vv.placa}: {formatNumber(vv.kmAtual)} km. O KM informado
                  atualiza o hodômetro e os pneus montados.
                </div>
              );
            })()}
            <datalist id="ef-pecas">
              {[
                ...new Set(
                  (company.regrasManutencao || [])
                    .filter(
                      (r) => !maintenanceForm.categoria || r.categoria === maintenanceForm.categoria
                    )
                    .map((r) => r.peca)
                ),
              ].map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
            <Field label="Peça / item da preventiva (opcional)">
              <input
                list="ef-pecas"
                className="inp"
                placeholder="Ex: Pastilhas de freio"
                value={maintenanceForm.peca}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, peca: e.target.value })}
              />
            </Field>
            <Field label="Descrição do serviço">
              <input
                required
                className="inp"
                value={maintenanceForm.descricao}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, descricao: e.target.value })
                }
              />
            </Field>
            <Field label="Oficina / fornecedor">
              <input
                className="inp"
                value={maintenanceForm.fornecedor}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, fornecedor: e.target.value })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data">
                <input
                  type="date"
                  className="inp"
                  value={maintenanceForm.data}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, data: e.target.value })}
                />
              </Field>
              <Field label="Valor (R$)">
                <input
                  type="number"
                  step="0.01"
                  required
                  className="inp mono"
                  value={maintenanceForm.valor}
                  onChange={(e) =>
                    setMaintenanceForm({ ...maintenanceForm, valor: e.target.value })
                  }
                />
              </Field>
            </div>
            <FormActions
              onCancel={() => setShowMaintenanceModal(false)}
              label="Salvar manutenção"
            />
          </form>
        </Modal>
      )}

      {showFuelModal && (
        <Modal wide title="Lançar abastecimento" onClose={() => setShowFuelModal(false)}>
          <form onSubmit={handleCreateFuel} className="space-y-3">
            <Field label="Veículo abastecido">
              <select
                required
                className="inp"
                value={fuelForm.veiculoId}
                onChange={(e) => setFuelForm({ ...fuelForm, veiculoId: e.target.value })}
              >
                <option value="">Selecione o veículo...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.modelo}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Combustível">
                <select
                  className="inp"
                  value={fuelForm.tipo}
                  onChange={(e) =>
                    setFuelForm({ ...fuelForm, tipo: e.target.value as TipoCombustivel })
                  }
                >
                  {TIPOS_COMBUSTIVEL.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Data do abastecimento">
                <input
                  type="date"
                  required
                  className="inp"
                  value={fuelForm.data}
                  onChange={(e) => setFuelForm({ ...fuelForm, data: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Litros">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="inp mono"
                  value={fuelForm.litros}
                  onChange={(e) => setFuelForm({ ...fuelForm, litros: e.target.value })}
                />
              </Field>
              <Field label="Valor unitário (R$/L)">
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  required
                  className="inp mono"
                  value={fuelForm.valorUnit}
                  onChange={(e) => setFuelForm({ ...fuelForm, valorUnit: e.target.value })}
                />
              </Field>
              <Field label="Valor total (R$)">
                <input
                  readOnly
                  tabIndex={-1}
                  className="inp mono"
                  value={
                    Number(fuelForm.litros) > 0 && Number(fuelForm.valorUnit) > 0
                      ? formatCurrency(
                          Math.round(Number(fuelForm.litros) * Number(fuelForm.valorUnit) * 100) /
                            100
                        )
                      : ''
                  }
                />
              </Field>
            </div>
            <Field label="KM do veículo neste abastecimento">
              <input
                type="number"
                min="0"
                required
                className="inp mono"
                value={fuelForm.km}
                onChange={(e) => setFuelForm({ ...fuelForm, km: e.target.value })}
              />
            </Field>
            {(() => {
              const vv = vehicles.find((v) => v.id === fuelForm.veiculoId);
              if (!vv) return null;
              const chk = fuelForm.km !== '' ? checkFuelKm(fuelForm) : null;
              if (chk && chk.erro)
                return (
                  <div
                    role="alert"
                    className="ef-t12_5 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--red-soft)', color: 'var(--red-ink)' }}
                  >
                    {chk.erro}
                  </div>
                );
              const comb = fuelings
                .filter((f) => f.veiculoId === vv.id && f.tipo !== 'Arla' && f.data <= fuelForm.data)
                .sort(cmpFuel);
              const ant = comb[comb.length - 1];
              const km = Number(fuelForm.km);
              const lt = Number(fuelForm.litros);
              const media =
                fuelForm.tipo !== 'Arla' && ant && km > Number(ant.km) && lt > 0
                  ? (km - Number(ant.km)) / lt
                  : null;
              return (
                <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                  Hodômetro atual de {vv.placa}: {formatNumber(vv.kmAtual)} km.{' '}
                  {ant
                    ? `Último abastecimento de combustível: ${formatNumber(ant.km)} km (${
                        ant.data
                      }).`
                    : 'Primeiro abastecimento de combustível deste veículo: a média começa no próximo.'}
                  {fuelForm.tipo === 'Arla'
                    ? ' Arla não entra no cálculo de média.'
                    : media !== null
                    ? ` Média deste abastecimento: ${formatDec(media)} km/l.`
                    : ''}
                </div>
              );
            })()}
            <Field label="Fornecedor (posto)">
              <input
                className="inp"
                value={fuelForm.fornecedor}
                onChange={(e) => setFuelForm({ ...fuelForm, fornecedor: e.target.value })}
              />
            </Field>
            <FormActions
              onCancel={() => setShowFuelModal(false)}
              label="Salvar abastecimento"
              v="primary"
            />
          </form>
        </Modal>
      )}

      {showFineModal && (
        <Modal wide title="Lançar multa" onClose={() => setShowFineModal(false)}>
          <form onSubmit={handleCreateFine} className="space-y-3">
            <Field label="Veículo">
              <select
                required
                className="inp"
                value={fineForm.veiculoId}
                onChange={(e) => setFineForm({ ...fineForm, veiculoId: e.target.value })}
              >
                <option value="">Selecione o veículo...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.modelo}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº do AIT (opcional)">
                <input
                  className="inp mono"
                  value={fineForm.ait}
                  onChange={(e) => setFineForm({ ...fineForm, ait: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <select
                  className="inp"
                  value={fineForm.status}
                  onChange={(e) =>
                    setFineForm({ ...fineForm, status: e.target.value as StatusMulta })
                  }
                >
                  <option>Pendente</option>
                  <option>Paga</option>
                  <option>Em Recurso</option>
                </select>
              </Field>
            </div>
            <Field label="Motivo da infração">
              <input
                required
                className="inp"
                value={fineForm.motivo}
                onChange={(e) => setFineForm({ ...fineForm, motivo: e.target.value })}
              />
            </Field>
            <div>
              <span className="lbl">Condutor da infração</span>
              <div className="seg">
                <button
                  type="button"
                  className={fineForm.identificado ? 'on' : ''}
                  onClick={() => setFineForm({ ...fineForm, identificado: true })}
                >
                  Motorista identificado
                </button>
                <button
                  type="button"
                  className={!fineForm.identificado ? 'on' : ''}
                  onClick={() => setFineForm({ ...fineForm, identificado: false })}
                >
                  Não identificado
                </button>
              </div>
            </div>
            {fineForm.identificado && (
              <Field label="Motorista">
                <input
                  required
                  className="inp"
                  value={fineForm.motorista}
                  onChange={(e) => setFineForm({ ...fineForm, motorista: e.target.value })}
                />
              </Field>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Data">
                <input
                  type="date"
                  className="inp"
                  value={fineForm.data}
                  onChange={(e) => setFineForm({ ...fineForm, data: e.target.value })}
                />
              </Field>
              <Field label="Pontos">
                <input
                  type="number"
                  min="0"
                  disabled={!fineForm.identificado}
                  className="inp mono"
                  value={fineForm.identificado ? fineForm.pontos : 0}
                  onChange={(e) => setFineForm({ ...fineForm, pontos: Number(e.target.value) })}
                />
              </Field>
              <Field
                label={fineForm.identificado ? 'Valor (R$)' : 'Valor da multa original (R$)'}
              >
                <input
                  type="number"
                  step="0.01"
                  required
                  className="inp mono"
                  value={fineForm.valor}
                  onChange={(e) => setFineForm({ ...fineForm, valor: e.target.value })}
                />
              </Field>
            </div>
            {!fineForm.identificado && (
              <div
                className="ef-t13 px-3 ef-py2_5 rounded-lg"
                style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}
              >
                Sem identificar o condutor, a empresa recebe a multa NIC. Original{' '}
                {formatCurrency(Number(fineForm.valor) || 0)} + NIC (×{NIC_MULTIPLICADOR}){' '}
                {formatCurrency((Number(fineForm.valor) || 0) * NIC_MULTIPLICADOR)} ={' '}
                <b>{formatCurrency((Number(fineForm.valor) || 0) * (1 + NIC_MULTIPLICADOR))}</b>. Não
                gera pontos na CNH.
              </div>
            )}
            <FormActions onCancel={() => setShowFineModal(false)} label="Salvar multa" v="danger" />
          </form>
        </Modal>
      )}
    </>
  );
};
