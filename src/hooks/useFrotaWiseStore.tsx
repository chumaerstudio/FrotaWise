'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AlertaRemold,
  EmpresaConfig,
  Manutencao,
  Multa,
  Pneu,
  TipoOperacaoPneu,
  Veiculo,
} from '@/types/frotawise';
import { INITIAL_COMPANY, INITIAL_TIRES, getTireLimits } from '@/services/pneusService';
import {
  INITIAL_FINES,
  INITIAL_MAINTENANCES,
  INITIAL_VEHICLES,
} from '@/services/veiculosService';
import { formatNumber, today } from '@/services/api';

interface TireActionModalState {
  tire: Pneu;
  targetAction: TipoOperacaoPneu;
  targetVehicleId: string;
  targetSlotCode: string;
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
  toast: { message: string; type: 'success' | 'error'; k: number } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  tireAlerts: AlertaRemold[];
  totalMaintenanceCost: number;
  totalFinesCost: number;
  totalStockTires: Pneu[];
  expensesByVehicleData: { placa: string; Manutencao: number; Multas: number }[];
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
  showFineModal: boolean;
  setShowFineModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportBackup: () => void;
}

const FrotaWiseContext = createContext<FrotaWiseContextValue | null>(null);

function useLocalState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setState(JSON.parse(raw));
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
  const [company, setCompany] = useLocalState<EmpresaConfig>('ecofrota_v3_company', INITIAL_COMPANY);
  const [theme, setTheme] = useLocalState<'light' | 'dark'>('ecofrota_v3_theme', 'light');
  const [vehicles, setVehicles] = useLocalState<Veiculo[]>('ecofrota_v3_vehicles', INITIAL_VEHICLES);
  const [tires, setTires] = useLocalState<Pneu[]>('ecofrota_v3_tires', INITIAL_TIRES);
  const [maintenances, setMaintenances] = useLocalState<Manutencao[]>(
    'ecofrota_v3_maintenances',
    INITIAL_MAINTENANCES
  );
  const [fines, setFines] = useLocalState<Multa[]>('ecofrota_v3_fines', INITIAL_FINES);

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
  const [showFineModal, setShowFineModal] = useState(false);

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
      versao: '3.3.0',
      schema: 1,
      dataExportacao: new Date().toISOString(),
      company,
      vehicles,
      tires,
      maintenances,
      fines,
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
        toast,
        showToast,
        tireAlerts,
        totalMaintenanceCost,
        totalFinesCost,
        totalStockTires,
        expensesByVehicleData,
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
        showFineModal,
        setShowFineModal,
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
