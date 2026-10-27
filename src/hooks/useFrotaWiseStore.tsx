'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Abastecimento,
  AlertaPreventivaItem,
  AlertaRemold,
  EmpresaConfig,
  Manutencao,
  Multa,
  Pneu,
  TipoManutencao,
  TipoOperacaoPneu,
  Veiculo,
} from '@/types/frotawise';
import { INITIAL_COMPANY, INITIAL_TIRES, getTireLimits, normTxt } from '@/services/pneusService';
import {
  INITIAL_FINES,
  INITIAL_MAINTENANCES,
  INITIAL_VEHICLES,
  cmpFuel,
  computeFuelMedias,
  matchesPreventiveRule,
} from '@/services/veiculosService';
import { CATEGORIAS_MANUTENCAO, formatNumber, today } from '@/services/api';

interface TireActionModalState {
  tire: Pneu;
  targetAction: TipoOperacaoPneu;
  targetVehicleId: string;
  targetSlotCode: string;
}

export interface MaintenancePrefill {
  veiculoId?: string;
  categoria?: string;
  peca?: string;
  tipo?: TipoManutencao;
}

interface FrotaWiseContextValue {
  company: EmpresaConfig;
  setCompany: React.Dispatch<React.SetStateAction<EmpresaConfig>>;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  vehicles: Veiculo[];
  setVehicles: React.Dispatch<React.SetStateAction<Veiculo[]>>;
  tires: Pneu[];
  setTires: React.Dispatch<React.SetStateAction<Pneu[]>>;
  maintenances: Manutencao[];
  setMaintenances: React.Dispatch<React.SetStateAction<Manutencao[]>>;
  fines: Multa[];
  setFines: React.Dispatch<React.SetStateAction<Multa[]>>;
  fuelings: Abastecimento[];
  setFuelings: React.Dispatch<React.SetStateAction<Abastecimento[]>>;
  toast: { message: string; type: 'success' | 'error'; k: number } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  tireAlerts: AlertaRemold[];
  totalMaintenanceCost: number;
  totalFinesCost: number;
  totalStockTires: Pneu[];
  expensesByVehicleData: { placa: string; Manutencao: number; Multas: number }[];
  fuelMedias: Record<string, { media: number; dist: number; litros: number; kmAnterior: number }>;
  fuelRows: Abastecimento[];
  fuelStats: {
    porVeiculo: {
      v: Veiculo;
      media: number;
      ultima: number | null;
      dist: number;
      litros: number;
      qtd: number;
    }[];
    frota: number | null;
    litrosTotal: number;
    gastoTotal: number;
  };
  maintByCategory: { categoria: string; valor: number; qtd: number }[];
  preventiveList: AlertaPreventivaItem[];
  preventiveAlerts: AlertaPreventivaItem[];
  selectedChassisVehicleId: string;
  setSelectedChassisVehicleId: React.Dispatch<React.SetStateAction<string>>;
  selectedTireForActionId: string | null;
  setSelectedTireForActionId: React.Dispatch<React.SetStateAction<string | null>>;
  draggedTireId: string | null;
  setDraggedTireId: React.Dispatch<React.SetStateAction<string | null>>;
  tireActionModal: TireActionModalState | null;
  setTireActionModal: React.Dispatch<React.SetStateAction<TireActionModalState | null>>;
  openTireOperationModal: (
    tire: Pneu,
    targetAction: TipoOperacaoPneu,
    targetVehicleId?: string,
    targetSlotCode?: string
  ) => void;
  handleCompleteRecap: (tire: Pneu) => void;
  historyModalTire: Pneu | null;
  setHistoryModalTire: React.Dispatch<React.SetStateAction<Pneu | null>>;
  detailVehicleId: string | null;
  setDetailVehicleId: React.Dispatch<React.SetStateAction<string | null>>;
  showVehicleModal: boolean;
  setShowVehicleModal: React.Dispatch<React.SetStateAction<boolean>>;
  showTireModal: boolean;
  setShowTireModal: React.Dispatch<React.SetStateAction<boolean>>;
  showMaintenanceModal: boolean;
  setShowMaintenanceModal: React.Dispatch<React.SetStateAction<boolean>>;
  maintenancePrefill: MaintenancePrefill | null;
  setMaintenancePrefill: React.Dispatch<React.SetStateAction<MaintenancePrefill | null>>;
  showFineModal: boolean;
  setShowFineModal: React.Dispatch<React.SetStateAction<boolean>>;
  showFuelModal: boolean;
  setShowFuelModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportBackup: () => void;
}

const FrotaWiseContext = createContext<FrotaWiseContextValue | null>(null);

function useLocalState<T>(
  key: string,
  initial: T,
  normalize?: (val: any) => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(normalize ? normalize(parsed) : parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // ignore
      }
    }
  }, [key, state, hydrated]);

  return [state, setState];
}

export function FrotaWiseProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useLocalState<EmpresaConfig>(
    'ecofrota_v3_company',
    INITIAL_COMPANY,
    (c) => ({
      ...INITIAL_COMPANY,
      ...c,
      regrasPneus: { ...INITIAL_COMPANY.regrasPneus, ...(c?.regrasPneus || {}) },
      regrasModelos: Array.isArray(c?.regrasModelos) ? c.regrasModelos : [],
      regrasManutencao: Array.isArray(c?.regrasManutencao) ? c.regrasManutencao : [],
    })
  );
  const [theme, setTheme] = useLocalState<'light' | 'dark'>('ecofrota_v3_theme', 'light');
  const [vehicles, setVehicles] = useLocalState<Veiculo[]>('ecofrota_v3_vehicles', INITIAL_VEHICLES);
  const [tires, setTires] = useLocalState<Pneu[]>('ecofrota_v3_tires', INITIAL_TIRES);
  const [maintenances, setMaintenances] = useLocalState<Manutencao[]>(
    'ecofrota_v3_maintenances',
    INITIAL_MAINTENANCES,
    (arr) => (Array.isArray(arr) ? arr.map((m) => ({ categoria: '', peca: '', km: null, ...m })) : INITIAL_MAINTENANCES)
  );
  const [fines, setFines] = useLocalState<Multa[]>('ecofrota_v3_fines', INITIAL_FINES);
  const [fuelings, setFuelings] = useLocalState<Abastecimento[]>(
    'ecofrota_v3_fuelings',
    [],
    (arr) => (Array.isArray(arr) ? arr.map((f) => ({ tipo: 'Diesel', fornecedor: '', ...f })) : [])
  );

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; k: number } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, k: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  const [selectedChassisVehicleId, setSelectedChassisVehicleId] = useState<string>('v1');
  const [selectedTireForActionId, setSelectedTireForActionId] = useState<string | null>(null);
  const [draggedTireId, setDraggedTireId] = useState<string | null>(null);
  const [tireActionModal, setTireActionModal] = useState<TireActionModalState | null>(null);
  const [historyModalTire, setHistoryModalTire] = useState<Pneu | null>(null);
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showTireModal, setShowTireModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenancePrefill, setMaintenancePrefill] = useState<MaintenancePrefill | null>(null);
  const [showFineModal, setShowFineModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);

  const tireAlerts = useMemo<AlertaRemold[]>(() => {
    const alerts: AlertaRemold[] = [];
    const r = company.regrasPneus;
    tires.forEach((t) => {
      const lim = getTireLimits(t, company);
      const veh = vehicles.find((v) => v.id === t.veiculoAtualId);
      const localLabel = veh
        ? `${veh.placa} (${t.posicaoAtual || 'Montado'})`
        : t.localEstoque || 'Almoxarifado';
      if (t.classificacao === 'Sucatear' || t.kmTotal >= lim.kmSucatear) {
        alerts.push({
          tire: t,
          tipo: 'Sucatear',
          localLabel,
          instrucao: r.msgSucatear,
          motivo:
            t.classificacao === 'Sucatear'
              ? 'Classificado para Sucateamento'
              : `Atingiu ${formatNumber(t.kmTotal)} km (Limite${
                  lim.rule ? ' do modelo' : ''
                }: ${formatNumber(lim.kmSucatear)} km)`,
        });
      } else if (t.classificacao === 'Recapar' || t.kmTotal >= lim.kmRecapar) {
        alerts.push({
          tire: t,
          tipo: 'Recapar',
          localLabel,
          instrucao: r.msgRecapar,
          motivo:
            t.classificacao === 'Recapar'
              ? 'Marcado para envio à Recapagem'
              : `Atingiu ${formatNumber(t.kmTotal)} km (Meta${
                  lim.etapa && lim.rule ? ` da ${lim.etapa}ª recapagem` : ''
                }: ${formatNumber(lim.kmRecapar)} km)`,
        });
      } else if (t.classificacao === 'Estocar' && t.veiculoAtualId) {
        alerts.push({
          tire: t,
          tipo: 'Estocar',
          localLabel,
          instrucao: r.msgEstocar,
          motivo: 'Classificado para retirada e estocagem no almoxarifado',
        });
      }
    });
    return alerts;
  }, [tires, vehicles, company]);

  const totalMaintenanceCost = useMemo(
    () => maintenances.reduce((a, m) => a + (Number(m.valor) || 0), 0),
    [maintenances]
  );

  const totalFinesCost = useMemo(
    () => fines.reduce((a, f) => a + (Number(f.valor) || 0), 0),
    [fines]
  );

  const totalStockTires = useMemo(
    () => tires.filter((t) => !t.veiculoAtualId && t.classificacao !== 'Sucatear'),
    [tires]
  );

  const expensesByVehicleData = useMemo(
    () =>
      vehicles.map((v) => ({
        placa: v.placa,
        Manutencao: maintenances
          .filter((m) => m.veiculoId === v.id)
          .reduce((s, m) => s + Number(m.valor || 0), 0),
        Multas: fines
          .filter((f) => f.veiculoId === v.id)
          .reduce((s, f) => s + Number(f.valor || 0), 0),
      })),
    [vehicles, maintenances, fines]
  );

  const fuelMedias = useMemo(() => computeFuelMedias(fuelings), [fuelings]);

  const fuelRows = useMemo(
    () =>
      [...fuelings].sort((a, b) =>
        a.data < b.data ? 1 : a.data > b.data ? -1 : Number(b.km) - Number(a.km)
      ),
    [fuelings]
  );

  const fuelStats = useMemo(() => {
    const porVeiculo = vehicles
      .map((v) => {
        const comMedia = fuelings
          .filter((f) => f.veiculoId === v.id && f.tipo !== 'Arla' && fuelMedias[f.id])
          .sort(cmpFuel);
        const dist = comMedia.reduce((a, f) => a + fuelMedias[f.id].dist, 0);
        const litros = comMedia.reduce((a, f) => a + fuelMedias[f.id].litros, 0);
        return {
          v,
          media: litros > 0 ? dist / litros : null,
          ultima: comMedia.length ? fuelMedias[comMedia[comMedia.length - 1].id].media : null,
          dist,
          litros,
          qtd: comMedia.length,
        };
      })
      .filter((x): x is typeof x & { media: number } => x.media !== null);

    const dist = porVeiculo.reduce((a, x) => a + x.dist, 0);
    const litros = porVeiculo.reduce((a, x) => a + x.litros, 0);
    return {
      porVeiculo,
      frota: litros > 0 ? dist / litros : null,
      litrosTotal: fuelings.reduce((a, f) => a + (Number(f.litros) || 0), 0),
      gastoTotal: fuelings.reduce((a, f) => a + (Number(f.valorTotal) || 0), 0),
    };
  }, [fuelings, fuelMedias, vehicles]);

  const maintByCategory = useMemo(() => {
    const base = CATEGORIAS_MANUTENCAO.map((k) => ({ categoria: k, valor: 0, qtd: 0 }));
    let sem: { categoria: string; valor: number; qtd: number } | null = null;
    maintenances.forEach((m) => {
      let alvo = base.find((b) => b.categoria === m.categoria);
      if (!alvo) {
        sem = sem || { categoria: 'Sem categoria', valor: 0, qtd: 0 };
        alvo = sem;
      }
      alvo.valor += Number(m.valor) || 0;
      alvo.qtd += 1;
    });
    return sem ? [...base, sem] : base;
  }, [maintenances]);

  const preventiveList = useMemo<AlertaPreventivaItem[]>(() => {
    const out: AlertaPreventivaItem[] = [];
    vehicles.forEach((v) =>
      (company.regrasManutencao || []).forEach((r) => {
        if (r.modelo && normTxt(r.modelo) !== normTxt(v.modelo)) return;
        const feitos = maintenances.filter(
          (m) =>
            m.veiculoId === v.id &&
            m.km !== null &&
            m.km !== undefined &&
            Number.isFinite(Number(m.km)) &&
            matchesPreventiveRule(m, r)
        );
        const ultimo = feitos.reduce<Manutencao | null>(
          (a, m) => (!a || Number(m.km) > Number(a.km) ? m : a),
          null
        );
        if (!ultimo) {
          out.push({ v, r, ultimo: null, proximo: null, restante: null, status: 'sem' });
          return;
        }
        const proximo = Number(ultimo.km) + Number(r.km);
        const restante = proximo - (Number(v.kmAtual) || 0);
        const aviso = Math.max(500, Math.round(Number(r.km) * 0.1));
        out.push({
          v,
          r,
          ultimo,
          proximo,
          restante,
          status: restante <= 0 ? 'vencida' : restante <= aviso ? 'proxima' : 'ok',
        });
      })
    );
    return out;
  }, [vehicles, maintenances, company.regrasManutencao]);

  const preventiveAlerts = useMemo(
    () =>
      preventiveList
        .filter((x) => x.status === 'vencida' || x.status === 'proxima')
        .sort((a, b) => (a.restante || 0) - (b.restante || 0)),
    [preventiveList]
  );

  const openTireOperationModal = (
    tire: Pneu,
    targetAction: TipoOperacaoPneu,
    targetVehicleId = '',
    targetSlotCode = ''
  ) => {
    setTireActionModal({ tire, targetAction, targetVehicleId, targetSlotCode });
  };

  const handleCompleteRecap = (tire: Pneu) => {
    setTires((prev) =>
      prev.map((t) =>
        t.id === tire.id
          ? {
              ...t,
              recapagens: (Number(t.recapagens) || 0) + 1,
              sulcoMm: 14.0,
              classificacao: 'Estocar',
              veiculoAtualId: '',
              posicaoAtual: '',
              localEstoque: 'Prateleira Recapados',
            }
          : t
      )
    );
    showToast(`Pneu #${tire.fogo} retornou da recapagem (+1 ciclo) para o estoque!`);
  };

  const handleExportBackup = () => {
    const payload = {
      sistema: 'FrotaWise Enterprise Offline',
      versao: '3.4.0',
      schema: 1,
      dataExportacao: new Date().toISOString(),
      company,
      vehicles,
      tires,
      maintenances,
      fines,
      fuelings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FrotaWise_Backup_${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo de Backup gerado! Salve no seu Pen Drive.');
  };

  return (
    <FrotaWiseContext.Provider
      value={{
        company,
        setCompany,
        theme,
        setTheme,
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
        toast,
        showToast,
        tireAlerts,
        totalMaintenanceCost,
        totalFinesCost,
        totalStockTires,
        expensesByVehicleData,
        fuelMedias,
        fuelRows,
        fuelStats,
        maintByCategory,
        preventiveList,
        preventiveAlerts,
        selectedChassisVehicleId,
        setSelectedChassisVehicleId,
        selectedTireForActionId,
        setSelectedTireForActionId,
        draggedTireId,
        setDraggedTireId,
        tireActionModal,
        setTireActionModal,
        openTireOperationModal,
        handleCompleteRecap,
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
        handleExportBackup,
      }}
    >
      {children}
    </FrotaWiseContext.Provider>
  );
}

export function useEstoquePneus() {
  const ctx = useContext(FrotaWiseContext);
  if (!ctx) {
    throw new Error('useEstoquePneus deve ser usado dentro de FrotaWiseProvider');
  }
  return ctx;
}
