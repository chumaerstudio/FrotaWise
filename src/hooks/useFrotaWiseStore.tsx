'use client';

<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
=======
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
import {
  Abastecimento,
  AlertaPreventivaItem,
  AlertaRemold,
  EmpresaConfig,
  KmAtualLancado,
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
  applyOdometer,
  cmpFuel,
  computeFuelMediaDetails,
  odometerFrom,
  vehicleLaunchKms,
} from '@/services/veiculosService';
import { CATEGORIAS_MANUTENCAO, KM_AVISO_PREVENTIVA, formatCurrency, formatDec, formatNumber, today } from '@/services/api';
import { normalizeStoredValue } from '@/lib/storage';
<<<<<<< HEAD
import { httpClient } from '@/lib/http/client';
import { getClientEnv } from '@/config/env';
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2

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
  editingTireId: string | null;
  setEditingTireId: React.Dispatch<React.SetStateAction<string | null>>;
  startEditTire: (t: Pneu) => void;
  handleDeleteTire: (t: Pneu) => void;
  showMaintenanceModal: boolean;
  setShowMaintenanceModal: React.Dispatch<React.SetStateAction<boolean>>;
  editingMaintId: string | null;
  setEditingMaintId: React.Dispatch<React.SetStateAction<string | null>>;
  startEditMaint: (m: Manutencao) => void;
  handleDeleteMaintenance: (m: Manutencao) => void;
  maintenancePrefill: MaintenancePrefill | null;
  setMaintenancePrefill: React.Dispatch<React.SetStateAction<MaintenancePrefill | null>>;
  showFineModal: boolean;
  setShowFineModal: React.Dispatch<React.SetStateAction<boolean>>;
  editingFineId: string | null;
  setEditingFineId: React.Dispatch<React.SetStateAction<string | null>>;
  startEditFine: (f: Multa) => void;
  handleDeleteFine: (f: Multa) => void;
  showFuelModal: boolean;
  setShowFuelModal: React.Dispatch<React.SetStateAction<boolean>>;
  editingFuelId: string | null;
  setEditingFuelId: React.Dispatch<React.SetStateAction<string | null>>;
  startEditFuel: (f: Abastecimento) => void;
  handleDeleteFuel: (f: Abastecimento) => void;
  syncOdometers: (
    vehIds: string[],
    nextFuelings: Abastecimento[],
    nextMaints: Manutencao[],
    label: string
  ) => string[];
  handleExportBackup: () => void;
<<<<<<< HEAD
  liveMode: boolean;
  isLoadingLiveData: boolean;
  liveError: string | null;
  refreshLiveData: () => Promise<void>;
  runLiveMutation: (method: 'post'|'put'|'patch'|'delete', path: string, payload?: unknown, success?: string, idempotent?: boolean) => Promise<boolean>;
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
}

const FrotaWiseContext = createContext<FrotaWiseContextValue | null>(null);

function useLocalState<T>(
  key: string,
  initial: T,
  normalize?: (val: any) => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
<<<<<<< HEAD
  const isLive = getClientEnv().appMode === 'API' && key !== 'ecofrota_v3_theme';

  useEffect(() => {
    if (isLive) { setHydrated(true); return; }
=======

  useEffect(() => {
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        setState(normalizeStoredValue(parsed, initial, normalize));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
<<<<<<< HEAD
  }, [key, isLive]);

  useEffect(() => {
    if (hydrated && !isLive) {
=======
  }, [key]);

  useEffect(() => {
    if (hydrated) {
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // ignore
      }
    }
<<<<<<< HEAD
  }, [key, state, hydrated, isLive]);
=======
  }, [key, state, hydrated]);
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2

  return [state, setState];
}

export function FrotaWiseProvider({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const liveMode = getClientEnv().appMode === 'API';
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(liveMode);
  const [liveError, setLiveError] = useState<string | null>(null);
  const liveMutationInFlight = useRef(new Set<string>());
  const [remotePreventiveList, setRemotePreventiveList] = useState<AlertaPreventivaItem[]>([]);
  const [remoteTireAlerts, setRemoteTireAlerts] = useState<AlertaRemold[]>([]);
  const [company, setCompany] = useLocalState<EmpresaConfig>(
    'ecofrota_v3_company',
    liveMode ? {...INITIAL_COMPANY, nomeEmpresa: 'Carregando empresa...', cnpj: ''} : INITIAL_COMPANY,
=======
  const [company, setCompany] = useLocalState<EmpresaConfig>(
    'ecofrota_v3_company',
    INITIAL_COMPANY,
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    (c) => ({
      ...INITIAL_COMPANY,
      ...c,
      regrasPneus: { ...INITIAL_COMPANY.regrasPneus, ...(c?.regrasPneus || {}) },
      regrasModelos: Array.isArray(c?.regrasModelos) ? c.regrasModelos : [],
      regrasManutencao: Array.isArray(c?.regrasManutencao) ? c.regrasManutencao : [],
    })
  );
  const [theme, setTheme] = useLocalState<'light' | 'dark'>('ecofrota_v3_theme', 'light');
<<<<<<< HEAD
  const [vehicles, setVehicles] = useLocalState<Veiculo[]>('ecofrota_v3_vehicles', liveMode ? [] : INITIAL_VEHICLES);
  const [tires, setTires] = useLocalState<Pneu[]>('ecofrota_v3_tires', liveMode ? [] : INITIAL_TIRES);
  const [maintenances, setMaintenances] = useLocalState<Manutencao[]>(
    'ecofrota_v3_maintenances',
    liveMode ? [] : INITIAL_MAINTENANCES,
=======
  const [vehicles, setVehicles] = useLocalState<Veiculo[]>('ecofrota_v3_vehicles', INITIAL_VEHICLES);
  const [tires, setTires] = useLocalState<Pneu[]>('ecofrota_v3_tires', INITIAL_TIRES);
  const [maintenances, setMaintenances] = useLocalState<Manutencao[]>(
    'ecofrota_v3_maintenances',
    INITIAL_MAINTENANCES,
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    (arr) =>
      Array.isArray(arr)
        ? arr.map((m) => ({ categoria: '', peca: '', km: null, ...m }))
        : INITIAL_MAINTENANCES
  );
<<<<<<< HEAD
  const [fines, setFines] = useLocalState<Multa[]>('ecofrota_v3_fines', liveMode ? [] : INITIAL_FINES);
=======
  const [fines, setFines] = useLocalState<Multa[]>('ecofrota_v3_fines', INITIAL_FINES);
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
  const [fuelings, setFuelings] = useLocalState<Abastecimento[]>(
    'ecofrota_v3_fuelings',
    [],
    (arr) => (Array.isArray(arr) ? arr.map((f) => ({ tipo: 'Diesel', fornecedor: '', ...f })) : [])
  );

<<<<<<< HEAD
  const refreshLiveData = async () => {
    if (!liveMode) return;
    try {
      const response = await httpClient.get<{
        company: EmpresaConfig; vehicles: Veiculo[]; tires: Pneu[];
        maintenances: Manutencao[]; fines: Multa[]; fuelings: Abastecimento[];
        preventiveList: AlertaPreventivaItem[]; tireAlerts: AlertaRemold[];
      }>('/bootstrap', {timeout: 30000});
      const d = response.data;
      setCompany(d.company); setVehicles(d.vehicles); setTires(d.tires);
      setMaintenances(d.maintenances); setFines(d.fines); setFuelings(d.fuelings);
      setRemotePreventiveList(d.preventiveList || []);
      setRemoteTireAlerts(d.tireAlerts || []);
      setSelectedChassisVehicleId(prev => d.vehicles.some(v => v.id === prev) ? prev : (d.vehicles[0]?.id || ''));
      setLiveError(null);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message || 'Falha ao carregar dados do servidor';
      setLiveError(String(msg));
      throw error;
    } finally { setIsLoadingLiveData(false); }
  };

  useEffect(() => {
    if (!liveMode) return;
    // Não carregar dados fictícios quando o backend não responder.
    const reload = () => { setIsLoadingLiveData(true); void refreshLiveData().catch(() => {}); };
    const clear = () => { setVehicles([]); setTires([]); setMaintenances([]); setFuelings([]);
      setFines([]); setRemotePreventiveList([]); setRemoteTireAlerts([]); };
    window.addEventListener('frotawise:session-changed', reload);
    window.addEventListener('frotawise:session-ended', clear);
    reload();
    return () => {window.removeEventListener('frotawise:session-changed',reload); window.removeEventListener('frotawise:session-ended',clear);};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMode]);

  const runLiveMutation = async (method: 'post'|'put'|'patch'|'delete', path: string, payload?: unknown, success?: string, idempotent=false): Promise<boolean> => {
    // Bloqueia duplo clique concorrente na mesma operação.
    const flightId = `${method}:${path}`;
    if (liveMutationInFlight.current.has(flightId)) return false;
    liveMutationInFlight.current.add(flightId);
    try {
      const headers = idempotent ? {'Idempotency-Key': crypto.randomUUID()} : undefined;
      await httpClient.request({method, url: path, data: payload, headers, timeout: 30000});
      await refreshLiveData();
      if (success) showToast(success);
      return true;
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Operação não concluída. Consulte os dados e tente novamente.', 'error');
      return false;
    } finally {liveMutationInFlight.current.delete(flightId);}
  };

=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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
  const [editingTireId, setEditingTireId] = useState<string | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingMaintId, setEditingMaintId] = useState<string | null>(null);
  const [maintenancePrefill, setMaintenancePrefill] = useState<MaintenancePrefill | null>(null);
  const [showFineModal, setShowFineModal] = useState(false);
  const [editingFineId, setEditingFineId] = useState<string | null>(null);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [editingFuelId, setEditingFuelId] = useState<string | null>(null);

<<<<<<< HEAD
  const locallyComputedTireAlerts = useMemo<AlertaRemold[]>(() => {
=======
  const tireAlerts = useMemo<AlertaRemold[]>(() => {
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    const alerts: AlertaRemold[] = [];
    if (!company || !company.regrasPneus || !Array.isArray(tires)) {
      return alerts;
    }
    const r = company.regrasPneus;

    tires.forEach((t) => {
      const lim = getTireLimits(t, company);
      const veh = (vehicles ?? []).find((v) => v.id === t.veiculoAtualId);
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
  () => (maintenances ?? []).reduce((a, m) => a + (Number(m.valor) || 0), 0),    [maintenances]
  );

  const totalFinesCost = useMemo(
  () => (fines ?? []).reduce((a, f) => a + (Number(f.valor) || 0), 0),    [fines]
  );

  const totalStockTires = useMemo(
  () => (tires ?? []).filter((t) => !t.veiculoAtualId && t.classificacao !== 'Sucatear'),    [tires]
  );

  const expensesByVehicleData = useMemo(
    () =>
      (Array.isArray(vehicles) ? vehicles : []).map((v) => ({
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

  const fuelMedias = useMemo(() => computeFuelMediaDetails(fuelings), [fuelings]);

  const fuelRows = useMemo(
    () =>
      [...(Array.isArray(fuelings) ? fuelings : [])].sort((a, b) =>
        a.data < b.data ? 1 : a.data > b.data ? -1 : Number(b.km) - Number(a.km)
      ),
    [fuelings]
  );

  const fuelStats = useMemo(() => {
    const porVeiculo = (Array.isArray(vehicles) ? vehicles : [])
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
    const base: { categoria: string; valor: number; qtd: number }[] = CATEGORIAS_MANUTENCAO.map((k) => ({ categoria: k, valor: 0, qtd: 0 }));
    let sem: { categoria: string; valor: number; qtd: number } | null = null;
    maintenances.forEach((m) => {
      let alvo = base.find((b) => b.categoria === m.categoria);
      if (!alvo) {
        sem = sem || { categoria: 'Sem categoria', valor: 0, qtd: 0 };
        alvo = sem;
      }
      if (alvo) {
        alvo.valor += Number(m.valor) || 0;
        alvo.qtd += 1;
      }
    });
    return sem ? [...base, sem] : base;
  }, [maintenances]);

<<<<<<< HEAD
  const locallyComputedPreventiveList = useMemo<AlertaPreventivaItem[]>(() => {
=======
  const preventiveList = useMemo<AlertaPreventivaItem[]>(() => {
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    const out: AlertaPreventivaItem[] = [];
    const kmAtualLancado = (v: Veiculo): KmAtualLancado => {
      const regs = [
        ...fuelings
          .filter((f) => f.veiculoId === v.id && Number.isFinite(Number(f.km)))
          .map((f) => ({ km: Number(f.km), data: f.data, origem: 'Abastecimento' as const })),
        ...maintenances
          .filter(
            (m) =>
              m.veiculoId === v.id &&
              m.km !== null &&
              m.km !== undefined &&
              Number.isFinite(Number(m.km))
          )
          .map((m) => ({ km: Number(m.km), data: m.data, origem: 'Manutenção' as const })),
      ];
      const ult = regs.reduce<KmAtualLancado | null>(
        (a, x) => (!a || (x.data || '') > (a.data || '') || (x.data === a.data && x.km > a.km) ? x : a),
        null
      );
      return ult || { km: Number(v.kmAtual) || 0, data: null, origem: 'Cadastro do veículo' as const };
    };

    (Array.isArray(vehicles) ? vehicles : []).forEach((v) =>
      (company?.regrasManutencao || []).forEach((r) => {
        if (r.modelo && normTxt(r.modelo) !== normTxt(v.modelo)) return;
        const alvoPeca = normTxt(r.peca);
        const feitos = maintenances.filter((m) => {
          if (
            m.veiculoId !== v.id ||
            m.km === null ||
            m.km === undefined ||
            !Number.isFinite(Number(m.km)) ||
            normTxt(m.categoria) !== normTxt(r.categoria)
          ) return false;
          if (!alvoPeca) return true;
          const peca = normTxt(m.peca);
          const descricao = normTxt(m.descricao);
          return peca === alvoPeca || peca.includes(alvoPeca) || descricao.includes(alvoPeca);
        });
        const ultimo = feitos.reduce<Manutencao | null>(
          (a, m) => (!a || Number(m.km) > Number(a.km) ? m : a),
          null
        );
        const atual = kmAtualLancado(v);
        if (!ultimo) {
          out.push({ v, r, ultimo: null, proximo: null, restante: null, atual, status: 'sem' });
          return;
        }
        const proximo = Number(ultimo.km) + Number(r.km);
        const restante = proximo - atual.km;
        out.push({
          v,
          r,
          ultimo,
          proximo,
          restante,
          atual,
          status:
            restante <= 0 ? 'vencida' : restante <= KM_AVISO_PREVENTIVA ? 'proxima' : 'ok',
        });
      })
    );
    return out;
  }, [vehicles, maintenances, fuelings, company.regrasManutencao]);

<<<<<<< HEAD
  const tireAlerts = liveMode ? remoteTireAlerts : locallyComputedTireAlerts;
  const preventiveList = liveMode ? remotePreventiveList : locallyComputedPreventiveList;
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
  const preventiveAlerts = useMemo(
    () =>
      preventiveList
        .filter((x) => x.status === 'vencida' || x.status === 'proxima')
        .sort((a, b) => (a.restante || 0) - (b.restante || 0)),
    [preventiveList]
  );

  const syncOdometers = (
    vehIds: string[],
    nextFuelings: Abastecimento[],
    nextMaints: Manutencao[],
    label: string
  ) => {
    let vs = vehicles;
    let ts = tires;
    const mudancas: string[] = [];
    Array.from(new Set(vehIds)).forEach((id) => {
      const v = vs.find((x) => x.id === id);
      if (!v) return;
      const antes = Number(v.kmAtual) || 0;
      const novo = odometerFrom(v, vehicleLaunchKms(id, nextFuelings, nextMaints));
      if (novo === antes) return;
      const r = applyOdometer(
        vs,
        ts,
        id,
        novo,
        `Sincronizado com o hodômetro (${label})`,
        today()
      );
      vs = r.vehs;
      ts = r.tirs;
      mudancas.push(`${v.placa}: ${formatNumber(antes)} → ${formatNumber(novo)} km`);
    });
    if (mudancas.length) {
      setVehicles(vs);
      setTires(ts);
    }
    return mudancas;
  };

  const sufixoKm = (mud: string[]) =>
    mud.length
      ? ` Hodômetro ajustado (${mud.join('; ')}); pneus montados acompanharam.`
      : '';

  const startEditFuel = (f: Abastecimento) => {
    setEditingFuelId(f.id);
    setShowFuelModal(true);
  };

  const handleDeleteFuel = (f: Abastecimento) => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Excluir o abastecimento de ${f.data} (${formatDec(f.litros)} L · ${formatCurrency(
          f.valorTotal
        )})?
O hodômetro e os pneus montados serão recalculados.`
      )
    )
      return;
<<<<<<< HEAD
    if (liveMode) { void runLiveMutation('delete', `/abastecimentos/${f.id}`, undefined, 'Abastecimento excluído.'); return; }
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    const next = fuelings.filter((x) => x.id !== f.id);
    setFuelings(next);
    const mud = syncOdometers(
      [f.veiculoId],
      next,
      maintenances,
      'exclusão de abastecimento'
    );
    showToast('Abastecimento excluído.' + sufixoKm(mud));
  };

  const startEditMaint = (m: Manutencao) => {
    setEditingMaintId(m.id);
    setShowMaintenanceModal(true);
  };

  const handleDeleteMaintenance = (m: Manutencao) => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Excluir a manutenção ${m.osNumero} (${m.descricao})?
O hodômetro e os pneus montados serão recalculados.`
      )
    )
      return;
<<<<<<< HEAD
    if (liveMode) { void runLiveMutation('delete', `/manutencoes/${m.id}`, undefined, 'Manutenção excluída.'); return; }
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    const next = maintenances.filter((x) => x.id !== m.id);
    setMaintenances(next);
    const mud = syncOdometers([m.veiculoId], fuelings, next, 'exclusão de manutenção');
    showToast('Manutenção excluído.' + sufixoKm(mud));
  };

  const startEditFine = (f: Multa) => {
    setEditingFineId(f.id);
    setShowFineModal(true);
  };

  const handleDeleteFine = (f: Multa) => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Excluir a multa ${f.ait} (${formatCurrency(f.valor)})?`)
    )
      return;
<<<<<<< HEAD
    if (liveMode) { void runLiveMutation('delete', `/multas/${f.id}`, undefined, 'Multa excluída.'); return; }
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    setFines((p) => p.filter((x) => x.id !== f.id));
    showToast('Multa excluída.');
  };

  const startEditTire = (t: Pneu) => {
    setEditingTireId(t.id);
    setShowTireModal(true);
  };

  const handleDeleteTire = (t: Pneu) => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Excluir o pneu Fogo #${t.fogo} (${t.marca})?
O histórico dele também será apagado.`
      )
    )
      return;
<<<<<<< HEAD
    if (liveMode) { void runLiveMutation('delete', `/pneus/${t.id}`, undefined, 'Pneu excluído.'); return; }
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    setTires((p) => p.filter((x) => x.id !== t.id));
    if (selectedTireForActionId === t.id) setSelectedTireForActionId(null);
    showToast(`Pneu Fogo #${t.fogo} excluído.`);
  };

  const openTireOperationModal = (
    tire: Pneu,
    targetAction: TipoOperacaoPneu,
    targetVehicleId = '',
    targetSlotCode = ''
  ) => {
    setTireActionModal({ tire, targetAction, targetVehicleId, targetSlotCode });
  };

  const handleCompleteRecap = (tire: Pneu) => {
<<<<<<< HEAD
    if (liveMode) { void runLiveMutation('post', `/pneus/${tire.id}/concluir-recapagem`, undefined, 'Recapagem concluída.'); return; }
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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
<<<<<<< HEAD
    if (liveMode) {
      void httpClient.get('/onboarding/exportar-backup').then(({data}) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `FrotaWise_Export_${today()}.json`; a.click(); URL.revokeObjectURL(url);
        showToast('Exportação realizada; não substitui backup do PostgreSQL.');
      }).catch(() => showToast('Sem permissão para exportar ou servidor indisponível.', 'error'));
      return;
    }
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
    const payload = {
      sistema: 'FrotaWise Enterprise Offline',
      versao: '3.5.0',
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
        editingTireId,
        setEditingTireId,
        startEditTire,
        handleDeleteTire,
        showMaintenanceModal,
        setShowMaintenanceModal,
        editingMaintId,
        setEditingMaintId,
        startEditMaint,
        handleDeleteMaintenance,
        maintenancePrefill,
        setMaintenancePrefill,
        showFineModal,
        setShowFineModal,
        editingFineId,
        setEditingFineId,
        startEditFine,
        handleDeleteFine,
        showFuelModal,
        setShowFuelModal,
        editingFuelId,
        setEditingFuelId,
        startEditFuel,
        handleDeleteFuel,
        syncOdometers,
        handleExportBackup,
<<<<<<< HEAD
        liveMode, isLoadingLiveData, liveError, refreshLiveData, runLiveMutation,
=======
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2
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

/** Alias legado mantido para evitar quebra de imports entre versões do frontend. */
export const useFrotaWiseStore = useEstoquePneus;
