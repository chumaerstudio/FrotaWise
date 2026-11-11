'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import {
  aplicarAjusteKm,
  calcularKmMovimentacao,
  cancelarMovimentacao,
  editarKmFinalMovimentacao,
  kmInicialDaProximaMovimentacao,
  registrarMovimentacao,
  ultimaMovimentacaoEditavel,
} from '@/services/pneuKmService';
import { getClassificacaoTone, getVeiculoStatusTone } from '@/services/statusTones';
import { sincronizarDespesaAbastecimento } from '@/services/viagensService';
import {
  ehNic,
  gerarCodigoMulta,
  multasVinculaveis,
  normPlaca,
} from '@/services/multasService';
import {
  cmpFuel,
  computeFuelMedias,
  odometerFrom,
  vehicleLaunchKms,
} from '@/services/veiculosService';
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
import type {
  Multa,
  Pneu,
  PagamentoPlano,
  StatusMulta,
  TipoCombustivel,
  TipoManutencao,
  TipoOperacaoPneu,
} from '@/types/frotawise';

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
    trips,
    setTrips,
    pagamentos,
    setPagamentos,
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
    editingTireId,
    setEditingTireId,
    showMaintenanceModal,
    setShowMaintenanceModal,
    editingMaintId,
    setEditingMaintId,
    maintenancePrefill,
    setMaintenancePrefill,
    showFineModal,
    setShowFineModal,
    editingFineId,
    setEditingFineId,
    showFuelModal,
    setShowFuelModal,
    editingFuelId,
    setEditingFuelId,
    syncOdometers,
    liveMode, runLiveMutation,
  } = useEstoquePneus();

  // Helper único; dados só são atualizados após confirmação do FastAPI.
  const awaitLive = runLiveMutation;
  const [actionKmInput, setActionKmInput] = useState('');
  const [actionObsInput, setActionObsInput] = useState('');
  const [actionStockLocInput, setActionStockLocInput] = useState('Prateleira A-01');
  const [actionBandaInput, setActionBandaInput] = useState('');
  const [actionFornecedorInput, setActionFornecedorInput] = useState('');
  const [actionValorInput, setActionValorInput] = useState('');
  const [actionKmVeiculoInput, setActionKmVeiculoInput] = useState('');
  // Chave de idempotência da movimentação: nova a cada abertura do modal.
  const [actionMovId, setActionMovId] = useState('');
  const movimentosEnviados = useRef(new Set<string>());
  const [historyEdit, setHistoryEdit] = useState<{ id: string; kmFinal: string } | null>(null);

  useEffect(() => {
    if (tireActionModal) {
      setActionMovId(`mov-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
      setActionKmVeiculoInput('');
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
    sulcoMm: '15',
    recapagens: '0',
    kmInicial: '0',
    localEstoque: 'Prateleira A-01',
  };
  const [tireForm, setTireForm] = useState(emptyTire);

  useEffect(() => {
    if (showTireModal && editingTireId) {
      const t = tires.find((x) => x.id === editingTireId);
      if (t) {
        setTireForm({
          fogo: t.fogo,
          marca: t.marca,
          medida: t.medida,
          sulcoMm: String(t.sulcoMm),
          recapagens: String(t.recapagens),
          kmInicial: String(t.kmTotal),
          localEstoque: t.localEstoque || '',
        });
      }
    } else if (!showTireModal) {
      setTireForm(emptyTire);
    }
  }, [showTireModal, editingTireId, tires]);

  const emptyMaint = () => ({
    integrarFinanceiro: false,
    pgForma: 'avista' as 'avista' | 'parcelado',
    pgParcelas: '2',
    pgVenc: '',
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
    if (showMaintenanceModal && editingMaintId) {
      const m = maintenances.find((x) => x.id === editingMaintId);
      if (m) {
        setMaintenanceForm({
          osNumero: m.osNumero || '',
          veiculoId: m.veiculoId,
          tipo: m.tipo,
          categoria: m.categoria || '',
          peca: m.peca || '',
          km: m.km !== null && m.km !== undefined ? String(m.km) : '',
          descricao: m.descricao || '',
          fornecedor: m.fornecedor || '',
          data: m.data,
          valor: String(m.valor),
          integrarFinanceiro: m.integrarFinanceiro !== false,
          pgForma: pagamentos.find((p) => p.origem === 'manutencao' && p.origemId === m.id)?.forma || 'avista',
          pgParcelas: String(pagamentos.find((p) => p.origem === 'manutencao' && p.origemId === m.id)?.parcelas || 2),
          pgVenc: pagamentos.find((p) => p.origem === 'manutencao' && p.origemId === m.id)?.vencimento || m.data,
        });
      }
    } else if (showMaintenanceModal && maintenancePrefill) {
      setMaintenanceForm((prev) => ({
        ...prev,
        veiculoId: maintenancePrefill.veiculoId ?? prev.veiculoId,
        categoria: maintenancePrefill.categoria ?? prev.categoria,
        peca: maintenancePrefill.peca ?? prev.peca,
        tipo: maintenancePrefill.tipo ?? prev.tipo,
      }));
      setMaintenancePrefill(null);
    } else if (!showMaintenanceModal) {
      setMaintenanceForm(emptyMaint());
    }
  }, [showMaintenanceModal, editingMaintId, maintenancePrefill, maintenances, pagamentos, setMaintenancePrefill]);

  const emptyFine = () => ({
    integrarFinanceiro: false,
    pgForma: 'avista' as 'avista' | 'parcelado',
    pgParcelas: '2',
    pgVenc: '',
    ait: '',
    veiculoId: '',
    motivo: '',
    identificado: true,
    motorista: '',
    status: 'Pendente' as StatusMulta,
    data: today(),
    pontos: 4,
    valor: '',
    tipoLancamento: 'Multa' as 'Multa' | 'NIC',
    multaOrigemId: '',
    buscaOrigem: '',
  });
  const [fineForm, setFineForm] = useState(emptyFine());

  useEffect(() => {
    if (showFineModal && editingFineId) {
      const f = fines.find((x) => x.id === editingFineId);
      if (f) {
        setFineForm({
          ait: f.ait || '',
          veiculoId: f.veiculoId,
          motivo: f.motivo || '',
          identificado: f.identificado !== false,
          motorista: f.identificado === false ? '' : f.motorista || '',
          status: f.status,
          data: f.data,
          pontos: f.pontos ?? 4,
          valor: String(ehNic(f) ? f.valor : f.valorOriginal ?? f.valor),
          tipoLancamento: ehNic(f) ? 'NIC' : 'Multa',
          multaOrigemId: f.multaOrigemId || '',
          buscaOrigem: '',
          integrarFinanceiro: f.integrarFinanceiro !== false,
          pgForma: pagamentos.find((p) => p.origem === 'multa' && p.origemId === f.id)?.forma || 'avista',
          pgParcelas: String(pagamentos.find((p) => p.origem === 'multa' && p.origemId === f.id)?.parcelas || 2),
          pgVenc: pagamentos.find((p) => p.origem === 'multa' && p.origemId === f.id)?.vencimento || f.data,
        });
      }
    } else if (!showFineModal) {
      setFineForm(emptyFine());
    }
  }, [showFineModal, editingFineId, fines, pagamentos]);

  const emptyFuel = () => ({
    veiculoId: '',
    tipo: 'Diesel' as TipoCombustivel,
    data: today(),
    litros: '',
    valorUnit: '',
    km: '',
    fornecedor: '',
    viagemId: '',
  });
  const [fuelForm, setFuelForm] = useState(emptyFuel());

  useEffect(() => {
    if (showFuelModal && editingFuelId) {
      const f = fuelings.find((x) => x.id === editingFuelId);
      if (f) {
        setFuelForm({
          veiculoId: f.veiculoId,
          tipo: f.tipo,
          data: f.data,
          litros: String(f.litros),
          valorUnit: String(f.valorUnit),
          km: String(f.km),
          fornecedor: f.fornecedor || '',
          viagemId: f.viagemId || '',
        });
      }
    } else if (!showFuelModal) {
      setFuelForm(emptyFuel());
    }
  }, [showFuelModal, editingFuelId, fuelings]);

  const closeTireModal = () => {
    setShowTireModal(false);
    setEditingTireId(null);
    setTireForm(emptyTire);
  };

  const closeMaintenanceModal = () => {
    setShowMaintenanceModal(false);
    setEditingMaintId(null);
    setMaintenanceForm(emptyMaint());
  };

  const closeFineModal = () => {
    setShowFineModal(false);
    setEditingFineId(null);
    setFineForm(emptyFine());
  };

  const closeFuelModal = () => {
    setShowFuelModal(false);
    setEditingFuelId(null);
    setFuelForm(emptyFuel());
  };

  const upsertPaymentPlan = (origem: PagamentoPlano['origem'], origemId: string, form: { pgForma: 'avista' | 'parcelado'; pgParcelas: string; pgVenc: string }, data: string) => {
    const parcelado = form.pgForma === 'parcelado';
    const parcelas = parcelado ? Math.round(Number(form.pgParcelas)) : 1;
    const atual = pagamentos.find((p) => p.origem === origem && p.origemId === origemId);
    const next: PagamentoPlano = {
      id: atual?.id || `pg-${Date.now()}`,
      origem,
      origemId,
      forma: parcelado ? 'parcelado' : 'avista',
      parcelas,
      vencimento: form.pgVenc || data,
      pagas: Object.fromEntries(Object.entries(atual?.pagas || {}).filter(([index]) => Number(index) < parcelas)),
    };
    setPagamentos((prev) => {
      const index = prev.findIndex((p) => p.origem === origem && p.origemId === origemId);
      if (index < 0) return [...prev, next];
      return prev.map((p, i) => (i === index ? next : p));
    });
  };

  const removePaymentPlan = (origem: PagamentoPlano['origem'], origemId: string) => {
    setPagamentos((prev) => prev.filter((p) => !(p.origem === origem && p.origemId === origemId)));
  };

  const validatePaymentPlan = (form: { integrarFinanceiro: boolean; pgForma: 'avista' | 'parcelado'; pgParcelas: string; pgVenc: string; data: string }) => {
    if (!form.integrarFinanceiro) return true;
    if (form.pgForma === 'parcelado') {
      const count = Math.round(Number(form.pgParcelas));
      if (!(count >= 2 && count <= 48)) {
        showToast('Informe de 2 a 48 parcelas para integrar com o financeiro.', 'error');
        return false;
      }
    }
    if (!(form.pgVenc || form.data)) {
      showToast('Informe o vencimento para integrar com o financeiro.', 'error');
      return false;
    }
    return true;
  };

  const sufixoKm = (mud: string[]) =>
    mud.length ? ` Hodômetro ajustado (${mud.join('; ')}).` : '';

  /** Leitura derivada do modal de movimentação (KM inicial vem sempre do próprio pneu). */
  const tireActionInfo = () => {
    if (!tireActionModal) return null;
    const { tire, targetAction, targetVehicleId } = tireActionModal;
    const tireNow = tires.find((t) => t.id === tire.id) ?? tire;
    const kmInicial = kmInicialDaProximaMovimentacao(tireNow);
    const kmFinal = actionKmInput === '' ? null : Number(actionKmInput);
    const calc = calcularKmMovimentacao(kmInicial, kmFinal);
    const veiculoId = tireNow.veiculoAtualId || (targetAction === 'Mount' ? targetVehicleId : '');
    const veiculo = vehicles.find((v) => v.id === veiculoId);
    return { tireNow, kmInicial, kmFinal, calc, veiculo };
  };

  const applyTireOperation = (
    t: Pneu,
    action: TipoOperacaoPneu,
    targetVehicleId: string,
    targetSlotCode: string
  ): Pneu => {
    if (action === 'Mount')
      return {
        ...t,
        classificacao: 'Rodando',
        veiculoAtualId: targetVehicleId,
        posicaoAtual: targetSlotCode,
        localEstoque: '',
      };
    if (action === 'Estocar')
      return {
        ...t,
        classificacao: 'Estocar',
        veiculoAtualId: '',
        posicaoAtual: '',
        localEstoque: actionStockLocInput || 'Almoxarifado Geral',
      };
    if (action === 'Recapar')
      return {
        ...t,
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
    if (action === 'Sucatear')
      return {
        ...t,
        classificacao: 'Sucatear',
        veiculoAtualId: '',
        posicaoAtual: '',
        localEstoque: 'Baixa / Sucata',
      };
    return t;
  };

  const handleConfirmTireOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const info = tireActionInfo();
    if (!tireActionModal || !info) return;
    const { tire, targetAction, targetVehicleId, targetSlotCode } = tireActionModal;
    const { tireNow, kmInicial, kmFinal, calc, veiculo } = info;
    if (!calc.ok) {
      showToast(calc.erro, 'error');
      return;
    }
    const kmVeic = actionKmVeiculoInput === '' ? null : Number(actionKmVeiculoInput);
    if (kmVeic !== null) {
      if (!Number.isFinite(kmVeic) || kmVeic < 0) {
        showToast('Informe um KM do veículo válido.', 'error');
        return;
      }
      if (veiculo && kmVeic < (Number(veiculo.kmAtual) || 0)) {
        showToast(
          `KM do veículo menor que o hodômetro atual de ${veiculo.placa} (${formatNumber(veiculo.kmAtual)} km).`,
          'error'
        );
        return;
      }
    }

    if (liveMode) {
      // Contrato do backend: kmRodados = KM final − KM inicial (o KM inicial é o último KM do pneu).
      const ok = awaitLive('post', `/pneus/${tire.id}/operacao`, {
        targetAction,
        targetVehicleId: targetAction === 'Mount' ? targetVehicleId : null,
        targetSlotCode: targetAction === 'Mount' ? targetSlotCode : null,
        kmRodados: kmFinal === null ? null : calc.km,
        localEstoque: actionStockLocInput || 'Almoxarifado Geral',
        tipoBanda: actionBandaInput || null,
        fornecedor: actionFornecedorInput || null,
        valor: Math.max(0, Number(actionValorInput) || 0),
        obs: actionObsInput,
      }, 'Operação do pneu concluída.', true);
      void ok.then(success => { if (success) { setTireActionModal(null); setSelectedTireForActionId(null); }});
      return;
    }

    // Duplo clique/novo envio da mesma movimentação: ignora (não soma KM duas vezes).
    if (movimentosEnviados.current.has(actionMovId)) return;
    movimentosEnviados.current.add(actionMovId);

    const currentVehicle = vehicles.find((v) => v.id === tireNow.veiculoAtualId);
    const targetVehicle = vehicles.find((v) => v.id === targetVehicleId);
    const refVeh = currentVehicle ?? targetVehicle;
    const mov = registrarMovimentacao(tireNow, {
      movId: actionMovId,
      tipo: targetAction,
      data: today(),
      kmFinal,
      placa: refVeh ? refVeh.placa : 'AVULSO',
      modelo: refVeh ? refVeh.modelo : 'Lançamento Manual',
      veiculoId: refVeh?.id,
      kmVeiculo: kmVeic,
      obs:
        actionObsInput.trim() ||
        (targetAction === 'AddKm'
          ? 'Lançamento de KM do pneu'
          : `Operação (${targetAction}) na posição ${tireNow.posicaoAtual || 'Estoque'}`),
    });
    if (mov.erro || mov.duplicada) {
      if (mov.erro) showToast(mov.erro, 'error');
      return;
    }
    // O KM entra no próprio pneu (inclusive estepe) por esta movimentação, em qualquer posição.
    const nextTires = tires.map((t) =>
      t.id === tire.id ? applyTireOperation(mov.tire, targetAction, targetVehicleId, targetSlotCode) : t
    );
    setTires(nextTires);
    const mud =
      kmVeic !== null && refVeh
        ? syncOdometers([refVeh.id], fuelings, maintenances, 'movimentação de pneu', trips, nextTires)
        : [];

    setSelectedTireForActionId(null);
    setTireActionModal(null);
    showToast(
      `Pneu Fogo #${tire.fogo} atualizado: ${formatNumber(kmInicial)} → ${formatNumber(
        calc.kmFinal
      )} km (+${formatNumber(calc.km)} km).` + sufixoKm(mud)
    );
  };

  const handleEditTireMovement = (tireId: string, movId: string) => {
    if (!historyEdit) return;
    const t = tires.find((x) => x.id === tireId);
    if (!t) return;
    const res = editarKmFinalMovimentacao(t, movId, Number(historyEdit.kmFinal));
    if (res.erro) {
      showToast(res.erro, 'error');
      return;
    }
    if (res.duplicada) {
      setHistoryEdit(null);
      return;
    }
    const nextTires = tires.map((x) => (x.id === tireId ? res.tire : x));
    setTires(nextTires);
    const ids = Array.from(new Set((t.historicoVeiculos || []).map((h) => h.veiculoId).filter(Boolean) as string[]));
    const mud = syncOdometers(ids, fuelings, maintenances, 'edição de movimentação de pneu', trips, nextTires);
    setHistoryEdit(null);
    showToast(`Movimentação atualizada: pneu com ${formatNumber(res.tire.kmTotal)} km.` + sufixoKm(mud));
  };

  const handleCancelTireMovement = (tireId: string, movId: string) => {
    const t = tires.find((x) => x.id === tireId);
    if (!t) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        'Cancelar esta movimentação? O KM dela será estornado do pneu. A posição/local atual do pneu não é alterada.'
      )
    )
      return;
    const res = cancelarMovimentacao(t, movId, today());
    if (res.erro) {
      showToast(res.erro, 'error');
      return;
    }
    const nextTires = tires.map((x) => (x.id === tireId ? res.tire : x));
    setTires(nextTires);
    const ids = Array.from(new Set((t.historicoVeiculos || []).map((h) => h.veiculoId).filter(Boolean) as string[]));
    const mud = syncOdometers(ids, fuelings, maintenances, 'cancelamento de movimentação de pneu', trips, nextTires);
    showToast(`Movimentação cancelada: pneu volta a ${formatNumber(res.tire.kmTotal)} km.` + sufixoKm(mud));
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveMode) {
      if (!vehicleForm.placa.trim() || !vehicleForm.categoria.trim()) return;
      void awaitLive('post', '/veiculos', {
        placa: vehicleForm.placa.toUpperCase().trim(), uf: vehicleForm.uf.toUpperCase().trim() || 'MG',
        modelo: vehicleForm.modelo.trim() || vehicleForm.categoria.trim(),
        categoria: vehicleForm.categoria.trim(), eixos: Number(vehicleForm.eixos),
        kmAtual: Math.max(0, Number(vehicleForm.kmAtual) || 0),
        kmBase: Math.max(0, Number(vehicleForm.kmAtual) || 0), status: 'Operando',
      }, 'Veículo cadastrado.').then(ok => {
        if (ok) {setShowVehicleModal(false); setVehicleForm(emptyVehicle);}
      });
      return;
    }
    if (!vehicleForm.placa.trim() || !vehicleForm.categoria.trim()) return;
    const nv = {
      id: 'v-' + Date.now(),
      placa: vehicleForm.placa.toUpperCase().trim(),
      uf: vehicleForm.uf.toUpperCase().trim() || 'SP',
      modelo: vehicleForm.modelo.trim() || vehicleForm.categoria.trim(),
      categoria: vehicleForm.categoria.trim(),
      eixos: Math.max(2, Math.min(6, Number(vehicleForm.eixos) || 3)),
      kmAtual: Number(vehicleForm.kmAtual) || 0,
      kmBase: Number(vehicleForm.kmAtual) || 0,
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
    if (liveMode) {
      if (!tireForm.fogo.trim() || !tireForm.marca.trim()) return;
      void awaitLive('post', '/pneus', {
        fogo: tireForm.fogo.toUpperCase().trim(), marca: tireForm.marca.trim(),
        medida: tireForm.medida.trim() || '295/80 R22.5',
        sulcoMm: Number(tireForm.sulcoMm), recapagens: Number(tireForm.recapagens),
        kmInicial: Math.max(0, Number(tireForm.kmInicial) || 0),
        localEstoque: tireForm.localEstoque || 'Prateleira A-01',
      }, 'Pneu cadastrado.').then(ok => {if (ok) closeTireModal();});
      return;
    }
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
                tipo: 'Cadastro' as const,
                kmInicial: 0,
                kmFinal: kmIni,
                data: today(),
                obs: 'Quilometragem inicial no cadastro',
              },
            ]
          : [],
    };
    setTires((p) => [...p, nt]);
    closeTireModal();
    showToast(`Pneu Fogo #${nt.fogo} cadastrado no estoque!`);
  };

  const handleUpdateTire = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveMode) {
      const old = tires.find(t => t.id === editingTireId);
      if (!old) return;
      if (old.fogo !== tireForm.fogo.toUpperCase().trim() || old.recapagens !== Number(tireForm.recapagens) || old.kmTotal !== Number(tireForm.kmInicial)) {
        showToast('O backend não permite alterar fogo, recapagens ou KM histórico pela edição. Use as operações de pneu.', 'error');
        return;
      }
      void awaitLive('patch', `/pneus/${old.id}`, {
        marca: tireForm.marca.trim(), medida: tireForm.medida.trim(),
        sulcoMm: Number(tireForm.sulcoMm), localEstoque: tireForm.localEstoque,
      }, 'Pneu atualizado.').then(ok => {if (ok) closeTireModal();});
      return;
    }
    if (!tireForm.fogo.trim() || !tireForm.marca.trim()) return;
    setTires((p) =>
      p.map((t) =>
        t.id === editingTireId
          ? // Alteração manual do KM acumulado vira um lançamento de ajuste no histórico,
            // para o KM do pneu continuar igual à soma das suas movimentações.
            aplicarAjusteKm(
              {
                ...t,
                fogo: tireForm.fogo.toUpperCase().trim(),
                marca: tireForm.marca.trim(),
                medida: tireForm.medida.trim() || t.medida,
                sulcoMm: tireForm.sulcoMm === '' ? t.sulcoMm : Number(tireForm.sulcoMm),
                recapagens: Math.max(0, Number(tireForm.recapagens) || 0),
                localEstoque: tireForm.localEstoque.trim() || t.localEstoque,
              },
              Math.max(0, Number(tireForm.kmInicial) || 0),
              `aj-${Date.now()}`,
              today()
            )
          : t
      )
    );
    closeTireModal();
    showToast('Pneu atualizado!');
  };

  const checkMaintenanceKm = (form: typeof maintenanceForm, excludeId?: string | null) => {
    const veh = vehicles.find((v) => v.id === form.veiculoId);
    const km = Math.round(Number(form.km));
    if (!veh) return { erro: '', veh, km };
    if (form.km === '' || !Number.isFinite(km) || km < 0)
      return { erro: 'Informe a quilometragem do veículo nesta manutenção.', veh, km };
    const date = form.data;
    const daVeiculo = maintenances.filter((m) => m.veiculoId === veh.id && m.id !== excludeId);
    const baseOdo = excludeId
      ? odometerFrom(
          veh,
          vehicleLaunchKms(
            veh.id,
            fuelings,
            maintenances.filter((m) => m.id !== excludeId),
            trips,
            tires
          )
        )
      : Number(veh.kmAtual) || 0;
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
    else if (isLatest && km < baseOdo)
      erro = `KM menor que o hodômetro atual de ${veh.placa} (${formatNumber(baseOdo)} km).`;
    return { erro, veh, km };
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (maintenanceForm.tipo === 'Pneus / Recapagem') {
      showToast('Pneus e recapagens são lançados em Pneus e estoque, pelas movimentações do pneu.', 'error');
      return;
    }
    if (!liveMode && !validatePaymentPlan(maintenanceForm)) return;
    if (liveMode) {
      if (!maintenanceForm.veiculoId || !maintenanceForm.descricao.trim() || !maintenanceForm.categoria) return;
      const item = {
        veiculoId: maintenanceForm.veiculoId, osNumero: maintenanceForm.osNumero.trim(),
        tipo: maintenanceForm.tipo, categoria: maintenanceForm.categoria,
        peca: maintenanceForm.peca.trim(), km: maintenanceForm.km === '' ? null : Number(maintenanceForm.km),
        descricao: maintenanceForm.descricao.trim(),
        fornecedor: maintenanceForm.fornecedor.trim() || 'Oficina Credenciada',
        data: maintenanceForm.data, valor: Number(maintenanceForm.valor),
      };
      void awaitLive('post', '/manutencoes', item, 'Manutenção registrada.', true)
        .then(ok => {if (ok) closeMaintenanceModal();});
      return;
    }
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
      integrarFinanceiro: !!maintenanceForm.integrarFinanceiro,
    };
    setMaintenances((p) => [nm, ...p]);
    if (nm.integrarFinanceiro) upsertPaymentPlan('manutencao', nm.id, maintenanceForm, date);

    let msg = 'Despesa de manutenção registrada!';
    const delta = km - (Number(veh.kmAtual) || 0);
    if (delta > 0) {
      // A manutenção atualiza só o hodômetro do veículo (leitura absoluta).
      // O KM dos pneus continua vindo das movimentações individuais de cada pneu.
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: km } : v)));
      msg = `Manutenção registrada. Hodômetro de ${veh.placa}: ${formatNumber(
        km
      )} km (+${formatNumber(delta)}).`;
    }
    closeMaintenanceModal();
    showToast(msg);
  };

  const handleUpdateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveMode && !validatePaymentPlan(maintenanceForm)) return;
    if (liveMode) {
      const old = maintenances.find(m => m.id === editingMaintId);
      if (!old) return;
      if (old.veiculoId !== maintenanceForm.veiculoId || Number(old.km) !== Number(maintenanceForm.km) || old.data !== maintenanceForm.data) {
        showToast('KM, data e veículo são imutáveis após o lançamento no backend. Faça uma conciliação administrativa.', 'error');
        return;
      }
      void awaitLive('patch', `/manutencoes/${old.id}`, {
        osNumero: maintenanceForm.osNumero, tipo: maintenanceForm.tipo,
        categoria: maintenanceForm.categoria, peca: maintenanceForm.peca,
        descricao: maintenanceForm.descricao.trim(),
        fornecedor: maintenanceForm.fornecedor.trim() || 'Oficina Credenciada',
        valor: Number(maintenanceForm.valor),
      }, 'Manutenção atualizada.').then(ok => {if (ok) closeMaintenanceModal();});
      return;
    }
    const old = maintenances.find((m) => m.id === editingMaintId);
    if (
      !old ||
      !maintenanceForm.veiculoId ||
      !maintenanceForm.descricao.trim() ||
      !maintenanceForm.valor ||
      !maintenanceForm.categoria
    )
      return;
    const { erro, veh, km } = checkMaintenanceKm(maintenanceForm, editingMaintId);
    if (erro || !veh) {
      showToast(erro || 'Veículo inválido', 'error');
      return;
    }
    const upd = {
      ...old,
      osNumero: maintenanceForm.osNumero.trim() || old.osNumero,
      veiculoId: veh.id,
      tipo: maintenanceForm.tipo,
      categoria: maintenanceForm.categoria,
      peca: (maintenanceForm.peca || '').trim(),
      km,
      descricao: maintenanceForm.descricao.trim(),
      fornecedor: maintenanceForm.fornecedor.trim() || 'Oficina Credenciada',
      data: maintenanceForm.data,
      valor: Number(maintenanceForm.valor) || 0,
      integrarFinanceiro: !!maintenanceForm.integrarFinanceiro,
    };
    const next = maintenances.map((m) => (m.id === old.id ? upd : m));
    if (upd.integrarFinanceiro) upsertPaymentPlan('manutencao', old.id, maintenanceForm, upd.data);
    else removePaymentPlan('manutencao', old.id);
    setMaintenances(next);
    const mud = syncOdometers([old.veiculoId, veh.id], fuelings, next, 'edição de manutenção');
    closeMaintenanceModal();
    showToast('Manutenção atualizada!' + sufixoKm(mud));
  };

  /**
   * Validação de KM do abastecimento.
   * A referência é a quilometragem das VIAGENS (e dos abastecimentos anteriores do veículo),
   * não mais a das manutenções. A viagem é opcional: sem viagem vinculada vale o hodômetro
   * atual do veículo, e a ausência de viagem nunca bloqueia o lançamento.
   */
  const checkFuelKm = (form: typeof fuelForm, excludeId?: string | null) => {
    const veh = vehicles.find((v) => v.id === form.veiculoId);
    const km = Math.round(Number(form.km));
    if (!veh) return { erro: '', veh, km };
    if (form.km === '' || !Number.isFinite(km) || km < 0)
      return { erro: 'Informe a quilometragem do veículo neste abastecimento.', veh, km };
    const date = form.data;
    const viagem = form.viagemId ? trips.find((t) => t.id === form.viagemId) : undefined;
    if (form.viagemId && !viagem) return { erro: 'Viagem selecionada não encontrada.', veh, km };
    if (viagem && viagem.veiculoId !== veh.id)
      return { erro: `A viagem nº ${viagem.numero} pertence a outro veículo.`, veh, km };

    const baseOdo = excludeId
      ? odometerFrom(
          veh,
          vehicleLaunchKms(
            veh.id,
            fuelings.filter((f) => f.id !== excludeId),
            maintenances,
            trips,
            tires
          )
        )
      : Number(veh.kmAtual) || 0;
    const serie = fuelings
      .filter((f) => f.veiculoId === veh.id && f.id !== excludeId)
      .map((f) => ({ data: f.data, km: Number(f.km), rotulo: `abastecimento de ${f.data}` }));
    const prev = serie
      .filter((x) => x.data <= date)
      .reduce<typeof serie[0] | null>(
        (a, x) => (!a || x.data > a.data || (x.data === a.data && x.km > a.km) ? x : a),
        null
      );
    const next = serie
      .filter((x) => x.data > date)
      .reduce<typeof serie[0] | null>((a, x) => (!a || x.data < a.data ? x : a), null);
    let erro = '';
    if (prev && km < prev.km)
      erro = `KM menor que o registro anterior (${prev.rotulo}: ${formatNumber(prev.km)} km).`;
    else if (next && km > next.km)
      erro = `KM maior que o registro seguinte (${next.rotulo}: ${formatNumber(next.km)} km).`;

    if (!erro && viagem) {
      // Com viagem: o KM precisa estar dentro do trecho da viagem.
      const ini = Number(viagem.kmInicial);
      const fim = viagem.kmFinal !== null && viagem.kmFinal !== undefined ? Number(viagem.kmFinal) : null;
      if (km < ini)
        erro = `KM menor que o KM inicial da viagem nº ${viagem.numero} (${formatNumber(ini)} km).`;
      else if (fim !== null && km > fim)
        erro = `KM maior que o KM final da viagem nº ${viagem.numero} (${formatNumber(fim)} km).`;
    } else if (!erro) {
      // Sem viagem: referência = viagens do veículo em datas diferentes + hodômetro atual.
      const dasViagens = trips.filter((t) => t.veiculoId === veh.id);
      const anterior = dasViagens
        .filter((t) => t.data < date && t.kmFinal !== null && t.kmFinal !== undefined)
        .reduce<typeof dasViagens[0] | null>(
          (a, t) => (!a || Number(t.kmFinal) > Number(a.kmFinal) ? t : a),
          null
        );
      const seguinte = dasViagens
        .filter((t) => t.data > date)
        .reduce<typeof dasViagens[0] | null>(
          (a, t) => (!a || Number(t.kmInicial) < Number(a.kmInicial) ? t : a),
          null
        );
      const isLatest =
        serie.every((x) => x.data <= date) && dasViagens.every((t) => t.data <= date);
      if (anterior && km < Number(anterior.kmFinal))
        erro = `KM menor que o KM final da viagem nº ${anterior.numero} (${formatNumber(
          Number(anterior.kmFinal)
        )} km em ${anterior.data}).`;
      else if (seguinte && km > Number(seguinte.kmInicial))
        erro = `KM maior que o KM inicial da viagem nº ${seguinte.numero} (${formatNumber(
          Number(seguinte.kmInicial)
        )} km em ${seguinte.data}).`;
      else if (isLatest && km < baseOdo)
        erro = `KM menor que o hodômetro atual de ${veh.placa} (${formatNumber(baseOdo)} km).`;
    }
    return { erro, veh, km };
  };

  const handleCreateFuel = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveMode) {
      if (!fuelForm.veiculoId || Number(fuelForm.litros) <= 0) return;
      void awaitLive('post', '/abastecimentos', {
        veiculoId: fuelForm.veiculoId, tipo: fuelForm.tipo, data: fuelForm.data,
        litros: Number(fuelForm.litros), valorUnit: Number(fuelForm.valorUnit),
        km: Number(fuelForm.km), fornecedor: fuelForm.fornecedor.trim() || 'Posto não informado'
      }, 'Abastecimento registrado.', true).then(ok => {if (ok) closeFuelModal();});
      return;
    }
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
      viagemId: fuelForm.viagemId || null,
    };
    setFuelings((p) => [nf, ...p]);
    // Com viagem: gera a despesa (id determinístico = sem duplicar). Sem viagem: nada a fazer.
    const nextTrips = nf.viagemId ? sincronizarDespesaAbastecimento(trips, nf) : trips;
    if (nf.viagemId) setTrips(nextTrips);

    let msg = `Abastecimento registrado: ${formatDec(litros)} L · ${formatCurrency(total)}.`;
    const viagem = nf.viagemId ? trips.find((t) => t.id === nf.viagemId) : undefined;
    if (viagem) msg += ` Despesa lançada na viagem nº ${viagem.numero}.`;
    const delta = km - (Number(veh.kmAtual) || 0);
    if (delta > 0) {
      // O abastecimento atualiza só o hodômetro do veículo (leitura absoluta).
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: km } : v)));
      msg += ` Hodômetro de ${veh.placa}: ${formatNumber(km)} km (+${formatNumber(delta)}).`;
    }
    const med = computeFuelMedias([nf, ...fuelings])[nf.id];
    if (med !== null && med !== undefined) msg += ` Média: ${formatDec(med)} km/l.`;
    closeFuelModal();
    showToast(msg);
  };

  const handleUpdateFuel = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveMode) {
      const old = fuelings.find(f => f.id === editingFuelId);
      if (!old) return;
      if (old.veiculoId !== fuelForm.veiculoId || old.km !== Number(fuelForm.km) || old.data !== fuelForm.data) {
        showToast('O backend não permite editar veículo, data ou hodômetro do abastecimento. É preciso conciliação.', 'error'); return;
      }
      void awaitLive('patch', `/abastecimentos/${old.id}`, {
        tipo: fuelForm.tipo, litros: Number(fuelForm.litros),
        valorUnit: Number(fuelForm.valorUnit), fornecedor: fuelForm.fornecedor.trim() || 'Posto não informado',
      }, 'Abastecimento atualizado.').then(ok => {if (ok) closeFuelModal();});
      return;
    }
    const old = fuelings.find((f) => f.id === editingFuelId);
    const litros = Number(fuelForm.litros);
    const unit = Number(fuelForm.valorUnit);
    if (!old || !fuelForm.veiculoId || !(litros > 0) || !(unit > 0)) return;
    const { erro, veh, km } = checkFuelKm(fuelForm, editingFuelId);
    if (erro || !veh) {
      showToast(erro || 'Veículo inválido', 'error');
      return;
    }
    const upd = {
      ...old,
      veiculoId: veh.id,
      tipo: fuelForm.tipo,
      data: fuelForm.data,
      litros,
      valorUnit: unit,
      valorTotal: Math.round(litros * unit * 100) / 100,
      km,
      fornecedor: fuelForm.fornecedor.trim() || 'Posto não informado',
      viagemId: fuelForm.viagemId || null,
    };
    const next = fuelings.map((f) => (f.id === old.id ? upd : f));
    setFuelings(next);
    // Remove a despesa antiga deste abastecimento (de qualquer viagem) e recria na viagem atual,
    // se houver. Despesas manuais da viagem não são tocadas.
    const nextTrips = sincronizarDespesaAbastecimento(trips, upd);
    setTrips(nextTrips);
    const mud = syncOdometers([old.veiculoId, veh.id], next, maintenances, 'edição de abastecimento', nextTrips);
    closeFuelModal();
    showToast('Abastecimento atualizado!' + sufixoKm(mud));
  };

  const handleCreateFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveMode && !validatePaymentPlan(fineForm)) return;
    if (liveMode) {
      if (!fineForm.veiculoId || !fineForm.motivo.trim() || !fineForm.valor) return;
      void awaitLive('post', '/multas', {
        veiculoId: fineForm.veiculoId, ait: fineForm.ait.trim(), motivo: fineForm.motivo.trim(),
        identificado: fineForm.identificado, motorista: fineForm.motorista || 'Não informado',
        status: fineForm.status, data: fineForm.data, pontos: Number(fineForm.pontos),
        valorOriginal: Number(fineForm.valor),
      }, 'Multa registrada.', true).then(ok => {if (ok) closeFineModal();});
      return;
    }
    if (!fineForm.veiculoId || !fineForm.motivo.trim() || !fineForm.valor) return;
    if (fineForm.tipoLancamento === 'NIC') {
      // NIC = lançamento próprio, vinculado (por ID) a uma multa original já cadastrada.
      const original = fines.find((x) => x.id === fineForm.multaOrigemId);
      if (!original || ehNic(original)) {
        showToast('Selecione a multa original à qual esta NIC pertence.', 'error');
        return;
      }
      const valorNic = Number(fineForm.valor) || 0;
      if (!(valorNic > 0)) {
        showToast('Informe o valor da NIC.', 'error');
        return;
      }
      const nicRec: Multa = {
        id: 'f-' + Date.now(),
        codigo: gerarCodigoMulta(fines, fineForm.data),
        tipoLancamento: 'NIC',
        multaOrigemId: original.id,
        ait: fineForm.ait.toUpperCase().trim() || original.ait,
        veiculoId: original.veiculoId,
        motivo: fineForm.motivo.trim(),
        identificado: original.identificado,
        motorista: original.motorista,
        status: fineForm.status,
        data: fineForm.data,
        pontos: 0,
        valorOriginal: 0,
        valorNIC: valorNic,
        valor: valorNic,
        integrarFinanceiro: !!fineForm.integrarFinanceiro,
      };
      setFines((p) => [nicRec, ...p]);
      if (nicRec.integrarFinanceiro) upsertPaymentPlan('multa', nicRec.id, fineForm, nicRec.data);
      closeFineModal();
      showToast(`NIC ${nicRec.codigo} lançada e vinculada à multa ${original.codigo || original.ait}.`);
      return;
    }
    const ident = fineForm.identificado !== false;
    const base = Number(fineForm.valor) || 0;
    const nic = ident ? 0 : base * NIC_MULTIPLICADOR;
    const nf: Multa = {
      id: 'f-' + Date.now(),
      // ID único gerado pelo sistema (o usuário não digita).
      codigo: gerarCodigoMulta(fines, fineForm.data),
      tipoLancamento: 'Multa',
      multaOrigemId: null,
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
      integrarFinanceiro: !!fineForm.integrarFinanceiro,
    };
    setFines((p) => [nf, ...p]);
    if (nf.integrarFinanceiro) upsertPaymentPlan('multa', nf.id, fineForm, nf.data);
    closeFineModal();
    showToast(
      ident
        ? `Multa ${nf.codigo} lançada nas despesas do veículo!`
        : `Multa ${nf.codigo} lançada com NIC: total ${formatCurrency(nf.valor)}.`
    );
  };

  const handleUpdateFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveMode && !validatePaymentPlan(fineForm)) return;
    if (liveMode) {
      const old = fines.find(f => f.id === editingFineId);
      if (!old) return;
      if (old.veiculoId !== fineForm.veiculoId || old.motivo !== fineForm.motivo.trim() || old.data !== fineForm.data || (old.valorOriginal ?? old.valor) !== Number(fineForm.valor) || old.ait !== fineForm.ait.trim() || old.identificado !== fineForm.identificado || (old.motorista || '') !== (fineForm.identificado ? fineForm.motorista || '' : 'Não identificado') || old.pontos !== (fineForm.identificado ? Number(fineForm.pontos) : 0)) {
        showToast('O backend permite alterar somente o status da multa. Os demais dados não serão sobrescritos.', 'error'); return;
      }
      void awaitLive('patch', `/multas/${old.id}/status`, {status: fineForm.status}, 'Status da multa atualizado.')
        .then(ok => {if (ok) closeFineModal();});
      return;
    }
    const old = fines.find((f) => f.id === editingFineId);
    if (!old || !fineForm.veiculoId || !fineForm.motivo.trim() || !fineForm.valor) return;
    if (ehNic(old)) {
      // A NIC continua um lançamento próprio: só dados dela mudam; a multa original não é tocada.
      const valorNic = Number(fineForm.valor) || 0;
      const updNic: Multa = {
        ...old,
        ait: fineForm.ait.toUpperCase().trim() || old.ait,
        motivo: fineForm.motivo.trim(),
        status: fineForm.status,
        data: fineForm.data,
        valorNIC: valorNic,
        valor: valorNic,
        integrarFinanceiro: !!fineForm.integrarFinanceiro,
      };
      setFines((p) => p.map((f) => (f.id === old.id ? updNic : f)));
      if (updNic.integrarFinanceiro) upsertPaymentPlan('multa', old.id, fineForm, updNic.data);
      else removePaymentPlan('multa', old.id);
      closeFineModal();
      showToast('NIC atualizada!');
      return;
    }
    const ident = fineForm.identificado !== false;
    const base = Number(fineForm.valor) || 0;
    const nic = ident ? 0 : base * NIC_MULTIPLICADOR;
    const upd = {
      ...old,
      ait: fineForm.ait.toUpperCase().trim() || old.ait,
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
      integrarFinanceiro: !!fineForm.integrarFinanceiro,
    };
    setFines((p) => p.map((f) => (f.id === old.id ? upd : f)));
    if (upd.integrarFinanceiro) upsertPaymentPlan('multa', old.id, fineForm, upd.data);
    else removePaymentPlan('multa', old.id);
    closeFineModal();
    showToast('Multa atualizada!');
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
                <Chip tone={getVeiculoStatusTone(v.status)}>{v.status}</Chip>
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
                setMaintenancePrefill({ veiculoId: v.id });
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
              ? 'Lançar KM'
              : tireActionModal.targetAction === 'Mount'
              ? `Montar em ${tireActionModal.targetSlotCode}`
              : tireActionModal.targetAction
          }`}
          onClose={() => setTireActionModal(null)}
        >
          <form onSubmit={handleConfirmTireOperation} className="space-y-4">
            {(() => {
              const info = tireActionInfo();
              if (!info) return null;
              const { kmInicial, calc, veiculo } = info;
              return (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="KM inicial do pneu (automático)">
                      <input
                        readOnly
                        tabIndex={-1}
                        className="inp mono"
                        value={`${formatNumber(kmInicial)} km`}
                        title="Último KM rodado registrado neste pneu"
                      />
                    </Field>
                    <Field label="KM final do pneu">
                      <input
                        type="number"
                        min={kmInicial}
                        className="inp mono"
                        placeholder={String(kmInicial)}
                        autoFocus
                        value={actionKmInput}
                        onChange={(e) => setActionKmInput(e.target.value)}
                      />
                    </Field>
                    <Field label="KM da movimentação">
                      <input
                        readOnly
                        tabIndex={-1}
                        className="inp mono"
                        style={calc.ok ? undefined : { borderColor: 'var(--red)', color: 'var(--red-ink)' }}
                        value={calc.ok ? `+${formatNumber(calc.km)} km` : 'Inválido'}
                      />
                    </Field>
                  </div>
                  {!calc.ok && (
                    <div className="ef-t12_5" style={{ color: 'var(--red-ink)' }}>
                      {calc.erro}
                    </div>
                  )}
                  {(veiculo || tireActionModal.targetVehicleId) && (
                    <Field
                      label={`KM do veículo${veiculo ? ` ${veiculo.placa}` : ''} (opcional · hodômetro atual ${
                        veiculo ? formatNumber(veiculo.kmAtual) : '—'
                      } km)`}
                    >
                      <input
                        type="number"
                        min={veiculo ? Number(veiculo.kmAtual) || 0 : 0}
                        className="inp mono"
                        placeholder="Leitura do hodômetro, se quiser atualizar o veículo"
                        value={actionKmVeiculoInput}
                        onChange={(e) => setActionKmVeiculoInput(e.target.value)}
                      />
                    </Field>
                  )}
                </>
              );
            })()}
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

      {historyModalTire && (() => {
        // Sempre o pneu atual do estado (nunca o instantâneo de quando o modal abriu),
        // para KM, status e cor refletirem a última movimentação.
        const hTire = tires.find((x) => x.id === historyModalTire.id) ?? historyModalTire;
        const ultimaEditavel = ultimaMovimentacaoEditavel(hTire);
        return (
        <Modal
          wide
          title={`Histórico · Fogo #${hTire.fogo} (${formatNumber(hTire.kmTotal)} km)`}
          onClose={() => {
            setHistoryEdit(null);
            setHistoryModalTire(null);
          }}
        >
          <div className="flex items-center gap-2 mb-3 ef-t13">
            <Chip tone={getClassificacaoTone(hTire.classificacao)}>{hTire.classificacao}</Chip>
            <span style={{ color: 'var(--mute)' }}>
              KM acumulado do pneu = soma das movimentações válidas abaixo
            </span>
          </div>
          {(hTire.historicoVeiculos || []).length === 0 ? (
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
              {[...hTire.historicoVeiculos].reverse().map((h) => (
                <li key={h.id} className="pl-5 pb-5 relative" style={h.cancelada ? { opacity: 0.55 } : undefined}>
                  <i
                    className="absolute top-1 w-3 h-3 rounded-full"
                    style={{
                      left: -7,
                      background: h.cancelada ? 'var(--line4)' : 'var(--teal)',
                      boxShadow: '0 0 0 3px var(--card)',
                    }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="mono font-bold">{h.placa}</span>{' '}
                      <span style={{ color: 'var(--ink2)' }}>· {h.modelo}</span>
                      <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                        {h.data} · {h.obs}
                        {h.tipo ? ` · ${h.tipo === 'AddKm' ? 'Lançamento de KM' : h.tipo}` : ''}
                      </div>
                      {h.kmInicial !== undefined && h.kmFinal !== undefined && (
                        <div className="mono ef-t12_5" style={{ color: 'var(--ink2)' }}>
                          KM {formatNumber(h.kmInicial)} → {formatNumber(h.kmFinal)}
                          {h.kmVeiculo != null ? ` · hodômetro do veículo ${formatNumber(h.kmVeiculo)} km` : ''}
                        </div>
                      )}
                      {ultimaEditavel?.id === h.id && !h.cancelada && (
                        <div className="mt-2">
                          {historyEdit?.id === h.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={h.kmInicial}
                                className="inp mono"
                                style={{ width: 130 }}
                                value={historyEdit.kmFinal}
                                onChange={(e) => setHistoryEdit({ id: h.id, kmFinal: e.target.value })}
                              />
                              <Btn sm v="primary" onClick={() => handleEditTireMovement(hTire.id, h.id)}>
                                Salvar KM final
                              </Btn>
                              <Btn sm onClick={() => setHistoryEdit(null)}>
                                Voltar
                              </Btn>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Btn sm onClick={() => setHistoryEdit({ id: h.id, kmFinal: String(h.kmFinal ?? '') })}>
                                Editar KM final
                              </Btn>
                              <Btn sm className="ef-del" onClick={() => handleCancelTireMovement(hTire.id, h.id)}>
                                Cancelar movimentação
                              </Btn>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {h.cancelada ? (
                      <Chip tone="gray">Cancelada</Chip>
                    ) : (
                      <Chip tone={h.kmRodados != null && h.kmRodados < 0 ? 'red' : 'teal'}>
                        {h.kmRodados == null
                          ? 'Km não informado'
                          : `${h.kmRodados < 0 ? '' : '+'}${formatNumber(h.kmRodados)} km`}
                      </Chip>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {(hTire.reformas || []).length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <h4 className="ef-t14 font-semibold mb-2">Reformas (recapagens)</h4>
              {hTire.reformas?.map((r) => (
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
        );
      })()}

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
        <Modal title={editingTireId ? 'Editar pneu' : 'Cadastrar pneu'} onClose={closeTireModal}>
          <form onSubmit={editingTireId ? handleUpdateTire : handleCreateTire} className="space-y-3">
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
                  list="ef-medidas-regras"
                  className="inp mono"
                  value={tireForm.medida}
                  onChange={(e) => setTireForm({ ...tireForm, medida: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Marca / modelo">
              <input
                required
                list="ef-marcas-regras"
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
                  onChange={(e) => setTireForm({ ...tireForm, sulcoMm: e.target.value })}
                />
              </Field>
              <Field label="Recapagens">
                <input
                  type="number"
                  min="0"
                  className="inp mono"
                  value={tireForm.recapagens}
                  onChange={(e) => setTireForm({ ...tireForm, recapagens: e.target.value })}
                />
              </Field>
              <Field label={editingTireId ? 'KM acumulado' : 'KM inicial'}>
                <input
                  type="number"
                  min="0"
                  className="inp mono"
                  value={tireForm.kmInicial}
                  onChange={(e) => setTireForm({ ...tireForm, kmInicial: e.target.value })}
                />
              </Field>
            </div>
            <datalist id="ef-marcas-regras">
              {[
                ...new Set([
                  ...(company.regrasModelos || []).map((r) => r.marca),
                  ...tires.map((t) => t.marca),
                ]),
              ].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <datalist id="ef-medidas-regras">
              {[
                ...new Set([
                  ...(company.regrasModelos || []).map((r) => r.medida).filter(Boolean),
                  ...tires.map((t) => t.medida),
                ]),
              ].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            {tireForm.marca.trim() &&
              (() => {
                const lim = getTireLimits(
                  {
                    marca: tireForm.marca,
                    medida: tireForm.medida,
                    recapagens: Number(tireForm.recapagens) || 0,
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
            <FormActions
              onCancel={closeTireModal}
              label={editingTireId ? 'Salvar alterações' : 'Salvar pneu'}
              v="primary"
            />
          </form>
        </Modal>
      )}

      {showMaintenanceModal && (
        <Modal
          wide
          title={editingMaintId ? 'Editar manutenção' : 'Lançar manutenção'}
          onClose={closeMaintenanceModal}
        >
          <form
            onSubmit={editingMaintId ? handleUpdateMaintenance : handleCreateMaintenance}
            className="space-y-3"
          >
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
                  {/* Pneus/Recapagem saiu dos novos lançamentos (use Pneus e estoque).
                      A opção só aparece ao editar um registro histórico que já a usa. */}
                  {maintenanceForm.tipo === 'Pneus / Recapagem' && editingMaintId && (
                    <option>Pneus / Recapagem</option>
                  )}
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
              const chk =
                maintenanceForm.km !== ''
                  ? checkMaintenanceKm(maintenanceForm, editingMaintId)
                  : null;
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
            {!liveMode && (
              <div className="ef-finopts space-y-3">
                <label className="ef-check">
                  <input type="checkbox" checked={maintenanceForm.integrarFinanceiro} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, integrarFinanceiro: e.target.checked })} />
                  <span><b>Integrar com o financeiro</b><span className="block ef-t12_5" style={{ color: 'var(--mute)' }}>Lança esta ordem de serviço na área Financeiro, com parcelas e vencimento.</span></span>
                </label>
                {maintenanceForm.integrarFinanceiro && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Forma de pagamento">
                      <select className="inp" value={maintenanceForm.pgForma} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, pgForma: e.target.value as 'avista' | 'parcelado' })}>
                        <option value="avista">À vista</option><option value="parcelado">Parcelado</option>
                      </select>
                    </Field>
                    <Field label="Quantidade de parcelas">
                      <input type="number" min="2" max="48" disabled={maintenanceForm.pgForma !== 'parcelado'} className="inp mono" value={maintenanceForm.pgForma === 'parcelado' ? maintenanceForm.pgParcelas : 1} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, pgParcelas: e.target.value })} />
                    </Field>
                    <div className="col-span-2">
                      <Field label={maintenanceForm.pgForma === 'parcelado' ? 'Vencimento da 1ª parcela' : 'Vencimento'}>
                        <input type="date" required className="inp" value={maintenanceForm.pgVenc || maintenanceForm.data} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, pgVenc: e.target.value })} />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            )}
            <FormActions
              onCancel={closeMaintenanceModal}
              label={editingMaintId ? 'Salvar alterações' : 'Salvar manutenção'}
            />
          </form>
        </Modal>
      )}

      {showFuelModal && (
        <Modal
          wide
          title={editingFuelId ? 'Editar abastecimento' : 'Lançar abastecimento'}
          onClose={closeFuelModal}
        >
          <form onSubmit={editingFuelId ? handleUpdateFuel : handleCreateFuel} className="space-y-3">
            <Field label="Veículo abastecido">
              <select
                required
                className="inp"
                value={fuelForm.veiculoId}
                onChange={(e) => setFuelForm({ ...fuelForm, veiculoId: e.target.value, viagemId: '' })}
              >
                <option value="">Selecione o veículo...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.modelo}
                  </option>
                ))}
              </select>
            </Field>
            {!liveMode && (
              <Field label="Viagem (opcional)">
                <select
                  className="inp"
                  disabled={!fuelForm.veiculoId}
                  value={fuelForm.viagemId}
                  onChange={(e) => setFuelForm({ ...fuelForm, viagemId: e.target.value })}
                >
                  <option value="">Sem viagem — abastecimento avulso</option>
                  {trips
                    .filter((t) => t.veiculoId === fuelForm.veiculoId)
                    .sort((a, b) => b.numero - a.numero)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Viagem nº {t.numero} · {t.data}
                        {t.kmFinal === null ? ' · em andamento' : ''}
                      </option>
                    ))}
                </select>
                <span className="block ef-t12 mt-1" style={{ color: 'var(--mute)' }}>
                  {fuelForm.viagemId
                    ? 'O valor total será lançado como despesa de abastecimento desta viagem.'
                    : 'Sem viagem, o abastecimento é salvo normalmente no histórico do veículo.'}
                </span>
              </Field>
            )}
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
              const chk = fuelForm.km !== '' ? checkFuelKm(fuelForm, editingFuelId) : null;
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
                .filter(
                  (f) =>
                    f.veiculoId === vv.id &&
                    f.id !== editingFuelId &&
                    f.tipo !== 'Arla' &&
                    f.data <= fuelForm.data
                )
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
              onCancel={closeFuelModal}
              label={editingFuelId ? 'Salvar alterações' : 'Salvar abastecimento'}
              v="primary"
            />
          </form>
        </Modal>
      )}

      {showFineModal && (
        <Modal
          wide
          title={
            editingFineId
              ? fineForm.tipoLancamento === 'NIC'
                ? 'Editar NIC'
                : 'Editar multa'
              : fineForm.tipoLancamento === 'NIC'
              ? 'Lançar NIC'
              : 'Lançar multa'
          }
          onClose={closeFineModal}
        >
          <form onSubmit={editingFineId ? handleUpdateFine : handleCreateFine} className="space-y-3">
            {!liveMode && !editingFineId && (
              <div>
                <span className="lbl">Tipo de lançamento</span>
                <div className="seg">
                  <button
                    type="button"
                    className={fineForm.tipoLancamento === 'Multa' ? 'on' : ''}
                    onClick={() => setFineForm({ ...emptyFine(), tipoLancamento: 'Multa', veiculoId: fineForm.veiculoId })}
                  >
                    Multa
                  </button>
                  <button
                    type="button"
                    className={fineForm.tipoLancamento === 'NIC' ? 'on' : ''}
                    onClick={() => setFineForm({ ...emptyFine(), tipoLancamento: 'NIC' })}
                  >
                    NIC (vincular a uma multa)
                  </button>
                </div>
              </div>
            )}
            {fineForm.tipoLancamento === 'NIC' && (() => {
              const original = fines.find((x) => x.id === fineForm.multaOrigemId);
              const q = normPlaca(fineForm.buscaOrigem);
              const qTxt = fineForm.buscaOrigem.trim().toLowerCase();
              const candidatas = multasVinculaveis(fines)
                .filter((m) => {
                  if (!qTxt) return true;
                  const veh = vehicles.find((v) => v.id === m.veiculoId);
                  return (
                    (m.codigo || '').toLowerCase().includes(qTxt) ||
                    m.ait.toLowerCase().includes(qTxt) ||
                    (q && normPlaca(veh?.placa).includes(q)) ||
                    m.motivo.toLowerCase().includes(qTxt)
                  );
                })
                .slice(0, 6);
              return (
                <div className="space-y-2">
                  <Field label="Multa original (busque pelo ID, AIT ou placa)">
                    <input
                      className="inp"
                      placeholder="Ex.: MUL-2026-0001, AIT ou placa"
                      disabled={!!editingFineId}
                      value={fineForm.buscaOrigem}
                      onChange={(e) => setFineForm({ ...fineForm, buscaOrigem: e.target.value })}
                    />
                  </Field>
                  {!editingFineId && (
                    <div className="card overflow-hidden" role="listbox" aria-label="Multas encontradas">
                      {candidatas.length === 0 ? (
                        <div className="p-3 ef-t13" style={{ color: 'var(--mute)' }}>
                          Nenhuma multa encontrada.
                        </div>
                      ) : (
                        candidatas.map((m) => {
                          const veh = vehicles.find((v) => v.id === m.veiculoId);
                          const on = m.id === fineForm.multaOrigemId;
                          return (
                            <button
                              type="button"
                              role="option"
                              aria-selected={on}
                              key={m.id}
                              className="w-full text-left flex items-center justify-between gap-3 px-3 ef-py2_5"
                              style={{
                                background: on ? 'var(--teal-wash)' : 'transparent',
                                borderBottom: '1px solid var(--line2)',
                              }}
                              onClick={() =>
                                setFineForm({
                                  ...fineForm,
                                  multaOrigemId: m.id,
                                  veiculoId: m.veiculoId,
                                  ait: m.ait,
                                  motivo: fineForm.motivo || `NIC · ${m.motivo}`,
                                  valor:
                                    fineForm.valor ||
                                    String(Math.round((m.valorOriginal ?? m.valor) * NIC_MULTIPLICADOR * 100) / 100),
                                })
                              }
                            >
                              <span className="min-w-0">
                                <span className="mono font-bold ef-t13">{m.codigo || m.id}</span>{' '}
                                <span className="mono ef-t12_5">{veh?.placa || 'N/A'}</span>
                                <span className="block ef-t12 truncate" style={{ color: 'var(--mute)' }}>
                                  {m.ait} · {m.data} · {m.motivo}
                                </span>
                              </span>
                              <span className="mono ef-t12_5 font-bold shrink-0">{formatCurrency(m.valorOriginal ?? m.valor)}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                  {original && (
                    <div className="ef-t12_5" style={{ color: 'var(--teal-ink)' }}>
                      Vinculada à multa <b>{original.codigo || original.id}</b> · {original.ait}. O valor sugerido é a multa original × {NIC_MULTIPLICADOR}; ajuste se necessário.
                    </div>
                  )}
                </div>
              );
            })()}
            <Field label="Veículo">
              <select
                required
                className="inp"
                disabled={fineForm.tipoLancamento === 'NIC'}
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
            {fineForm.tipoLancamento !== 'NIC' && (
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
            )}
            {fineForm.identificado && fineForm.tipoLancamento !== 'NIC' && (
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
                  disabled={!fineForm.identificado || fineForm.tipoLancamento === 'NIC'}
                  className="inp mono"
                  value={fineForm.identificado && fineForm.tipoLancamento !== 'NIC' ? fineForm.pontos : 0}
                  onChange={(e) => setFineForm({ ...fineForm, pontos: Number(e.target.value) })}
                />
              </Field>
              <Field
                label={
                  fineForm.tipoLancamento === 'NIC'
                    ? 'Valor da NIC (R$)'
                    : fineForm.identificado
                    ? 'Valor (R$)'
                    : 'Valor da multa original (R$)'
                }
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
            {!fineForm.identificado && fineForm.tipoLancamento !== 'NIC' && (
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
            {!liveMode && (
              <div className="ef-finopts space-y-3">
                <label className="ef-check">
                  <input type="checkbox" checked={fineForm.integrarFinanceiro} onChange={(e) => setFineForm({ ...fineForm, integrarFinanceiro: e.target.checked })} />
                  <span><b>Integrar com o financeiro</b><span className="block ef-t12_5" style={{ color: 'var(--mute)' }}>Lança esta multa na área Financeiro, com parcelas e vencimento.</span></span>
                </label>
                {fineForm.integrarFinanceiro && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Forma de pagamento">
                      <select className="inp" value={fineForm.pgForma} onChange={(e) => setFineForm({ ...fineForm, pgForma: e.target.value as 'avista' | 'parcelado' })}>
                        <option value="avista">À vista</option><option value="parcelado">Parcelado</option>
                      </select>
                    </Field>
                    <Field label="Quantidade de parcelas">
                      <input type="number" min="2" max="48" disabled={fineForm.pgForma !== 'parcelado'} className="inp mono" value={fineForm.pgForma === 'parcelado' ? fineForm.pgParcelas : 1} onChange={(e) => setFineForm({ ...fineForm, pgParcelas: e.target.value })} />
                    </Field>
                    <div className="col-span-2">
                      <Field label={fineForm.pgForma === 'parcelado' ? 'Vencimento da 1ª parcela' : 'Vencimento'}>
                        <input type="date" required className="inp" value={fineForm.pgVenc || fineForm.data} onChange={(e) => setFineForm({ ...fineForm, pgVenc: e.target.value })} />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            )}
            <FormActions
              onCancel={closeFineModal}
              label={editingFineId ? 'Salvar alterações' : fineForm.tipoLancamento === 'NIC' ? 'Salvar NIC' : 'Salvar multa'}
              v="danger"
            />
          </form>
        </Modal>
      )}
    </>
  );
};
