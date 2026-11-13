import type {
  Abastecimento,
  AlertaPreventivaItem,
  KmAtualLancado,
  Manutencao,
  Multa,
  Pneu,
  RegraManutencaoPreventiva,
  Veiculo,
  Viagem,
} from '@/types/frotawise';
import type { VeiculoApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import { mapVeiculoDtoToViewModel } from '@/lib/mappers';

export const INITIAL_VEHICLES: Veiculo[] = [
  {
    id: 'v1',
    placa: 'OPG-2469',
    uf: 'MG',
    modelo: 'Scania R450 Plus',
    categoria: 'Cavalo Trucado 3 Eixos',
    eixos: 3,
    kmAtual: 184500,
    status: 'Operando',
  },
  {
    id: 'v2',
    placa: 'BRA-8E19',
    uf: 'SP',
    modelo: 'Volvo FH 540',
    categoria: 'Cavalo Mecânico 3 Eixos',
    eixos: 3,
    kmAtual: 242100,
    status: 'Operando',
  },
  {
    id: 'v3',
    placa: 'GTR-9A11',
    uf: 'PR',
    modelo: 'Mercedes-Benz Atego 2430',
    categoria: 'Caminhão Toco 2 Eixos',
    eixos: 2,
    kmAtual: 98300,
    status: 'Manutenção',
  },
];

export const INITIAL_MAINTENANCES: Manutencao[] = [
  {
    id: 'm1',
    osNumero: 'OS-2026-014',
    veiculoId: 'v1',
    tipo: 'Preventiva',
    categoria: 'Motor',
    peca: '',
    km: 180000,
    descricao: 'Troca de kit filtros, óleo motor sintético e revisão freios',
    fornecedor: 'Oficina Rede Diesel Sul',
    data: '2026-05-12',
    valor: 3480.0,
  },
  {
    id: 'm2',
    osNumero: 'OS-2026-019',
    veiculoId: 'v2',
    tipo: 'Corretiva',
    categoria: 'Freio',
    peca: '',
    km: 240000,
    descricao: 'Substituição de válvula APU e alinhamento de 3 eixos',
    fornecedor: 'TruckCenter BR-116',
    data: '2026-05-28',
    valor: 2150.0,
  },
  {
    id: 'm3',
    osNumero: 'OS-2026-022',
    veiculoId: 'v3',
    tipo: 'Pneus / Recapagem',
    categoria: 'Suspensão',
    peca: '',
    km: 95000,
    descricao: 'Reforma de 2 carcaças 295/80 banda Vipal',
    fornecedor: 'Recapadora Nacional',
    data: '2026-06-02',
    valor: 1680.0,
  },
];

export const INITIAL_FINES: Multa[] = [
  {
    id: 'f1',
    codigo: 'MUL-2026-0001',
    tipoLancamento: 'Multa',
    multaOrigemId: null,
    ait: 'AIT-998123-MG',
    veiculoId: 'v1',
    motivo: 'Excesso de velocidade até 20% na BR-381',
    identificado: true,
    motorista: 'Carlos Eduardo Silva',
    status: 'Pendente',
    data: '2026-05-19',
    pontos: 4,
    valorOriginal: 130.16,
    valorNIC: 0,
    valor: 130.16,
  },
  {
    id: 'f2',
    codigo: 'MUL-2026-0002',
    tipoLancamento: 'Multa',
    multaOrigemId: null,
    ait: 'AIT-445102-SP',
    veiculoId: 'v2',
    motivo: 'Transitar em horário/local não permitido (Rodízio Pesados)',
    identificado: true,
    motorista: 'Roberto Almeida',
    status: 'Paga',
    data: '2026-05-04',
    pontos: 4,
    valorOriginal: 130.16,
    valorNIC: 0,
    valor: 130.16,
  },
  {
    id: 'f3',
    codigo: 'MUL-2026-0003',
    tipoLancamento: 'Multa',
    multaOrigemId: null,
    ait: 'AIT-771920-PR',
    veiculoId: 'v1',
    motivo: 'Evasão de balança obrigatória ANTT',
    identificado: true,
    motorista: 'Carlos Eduardo Silva',
    status: 'Em Recurso',
    data: '2026-06-01',
    pontos: 5,
    valorOriginal: 195.23,
    valorNIC: 0,
    valor: 195.23,
  },
];

export interface ChassisSlot {
  code: string;
  label: string;
}

export interface ChassisAxleLayout {
  axleNumber: number;
  leftSlots: ChassisSlot[];
  rightSlots: ChassisSlot[];
  /** true = um pneu por lado (eixo simples); false = rodado duplo. */
  single: boolean;
}

export interface VehicleChassisLayout {
  spareSlot: ChassisSlot;
  axles: ChassisAxleLayout[];
}

/**
 * Quantos eixos dianteiros têm um pneu por lado (eixo simples).
 * Bitruck (4 eixos): os DOIS eixos dianteiros são simples e os dois traseiros são duplos.
 * Demais configurações: só o 1º eixo é simples.
 */
export const singleAxleCount = (eixos: number): number => (Math.trunc(Number(eixos)) === 4 ? 2 : 1);

/** Retorna o mapa visual do chassi usado pela tela de pneus. */
export function getVehicleChassisSlots(eixos: number): VehicleChassisLayout {
  const n = Math.max(2, Math.min(6, Math.trunc(Number(eixos) || 3)));
  const singles = singleAxleCount(n);
  const axles: ChassisAxleLayout[] = [];

  for (let i = 1; i <= n; i++) {
    if (i <= singles) {
      axles.push({
        axleNumber: i,
        single: true,
        leftSlots: [{ code: `E${i}-ESQ`, label: `${i}º Eixo Esq.` }],
        rightSlots: [{ code: `E${i}-DIR`, label: `${i}º Eixo Dir.` }],
      });
      continue;
    }
    axles.push({
      axleNumber: i,
      single: false,
      leftSlots: [
        { code: `E${i}-EE`, label: `${i}º Eixo Ext. Esq.` },
        { code: `E${i}-EI`, label: `${i}º Eixo Int. Esq.` },
      ],
      rightSlots: [
        { code: `E${i}-DI`, label: `${i}º Eixo Int. Dir.` },
        { code: `E${i}-DE`, label: `${i}º Eixo Ext. Dir.` },
      ],
    });
  }

  return { spareSlot: { code: 'ESTEPE-1', label: 'Estepe Chassi' }, axles };
}

function getValidSlotCodes(layout: VehicleChassisLayout): Set<string> {
  return new Set([
    layout.spareSlot.code,
    ...layout.axles.flatMap((axle) => [
      ...axle.leftSlots.map((slot) => slot.code),
      ...axle.rightSlots.map((slot) => slot.code),
    ]),
  ]);
}

/**
 * Corrige dados antigos: antes o 2º eixo do Bitruck (4 eixos) era desenhado como duplo.
 * Pneus em E2-EE / E2-DE passam para E2-ESQ / E2-DIR; os internos (E2-EI / E2-DI) não têm
 * mais posição e voltam ao estoque (sem alterar o KM). Nada é apagado.
 */
export function migrarPosicoesLegadasBitruck(
  vehicles: Veiculo[],
  tires: Pneu[]
): { tires: Pneu[]; remapeados: Pneu[]; estocados: Pneu[] } {
  const bitrucks = new Set(vehicles.filter((v) => singleAxleCount(v.eixos) === 2).map((v) => v.id));
  const remap: Record<string, string> = { 'E2-EE': 'E2-ESQ', 'E2-DE': 'E2-DIR' };
  const orfaos = new Set(['E2-EI', 'E2-DI']);
  const remapeados: Pneu[] = [];
  const estocados: Pneu[] = [];
  const out = tires.map((t) => {
    if (!bitrucks.has(t.veiculoAtualId)) return t;
    if (remap[t.posicaoAtual]) {
      const n = { ...t, posicaoAtual: remap[t.posicaoAtual] };
      remapeados.push(n);
      return n;
    }
    if (orfaos.has(t.posicaoAtual)) {
      const n: Pneu = {
        ...t,
        classificacao: 'Estocar',
        veiculoAtualId: '',
        posicaoAtual: '',
        localEstoque: 'Almoxarifado Geral',
      };
      estocados.push(n);
      return n;
    }
    return t;
  });
  return { tires: remapeados.length || estocados.length ? out : tires, remapeados, estocados };
}

export function findOrphanedTiresOnAxleChange(
  veiculoId: string,
  novosEixos: number,
  tires: Pneu[]
): Pneu[] {
  const validSlots = getValidSlotCodes(getVehicleChassisSlots(novosEixos));
  return tires.filter(
    (t) =>
      t.veiculoAtualId === veiculoId &&
      Boolean(t.posicaoAtual) &&
      !validSlots.has(t.posicaoAtual)
  );
}

export function matchesPreventiveRule(
  veiculo: Veiculo,
  regra: RegraManutencaoPreventiva,
  manutencao?: Manutencao
): boolean {
  const catMatch =
    veiculo.categoria.trim().toUpperCase() ===
    regra.categoria.trim().toUpperCase();
  const modelMatch =
    !regra.modelo.trim() ||
    veiculo.modelo.trim().toUpperCase() === regra.modelo.trim().toUpperCase();

  if (!catMatch || !modelMatch) return false;
  if (!manutencao) return true;

  const pecaRegra = regra.peca.trim().toUpperCase();
  const pecaManut = (manutencao.peca ?? '').trim().toUpperCase();
  return pecaManut === pecaRegra;
}

export function computePreventiveAlertsPreview(
  vehicles: Veiculo[],
  rules: RegraManutencaoPreventiva[],
  maintenances: Manutencao[],
  avisoProximidadeKm = 500
): AlertaPreventivaItem[] {
  const items: AlertaPreventivaItem[] = [];

  for (const v of vehicles) {
    for (const r of rules) {
      if (!matchesPreventiveRule(v, r)) continue;

      const historicoCompativel = maintenances
        .filter(
          (m) => m.veiculoId === v.id && matchesPreventiveRule(v, r, m)
        )
        .sort((a, b) => (b.km ?? 0) - (a.km ?? 0));

      const ultimo = historicoCompativel[0] ?? null;
      const atual: KmAtualLancado = {
        km: v.kmAtual,
        data: new Date().toISOString().slice(0, 10),
        origem: 'operacao',
      };

      if (!ultimo || ultimo.km === undefined || ultimo.km === null) {
        const marcoInicial = v.kmBase ?? 0;
        const proximo = marcoInicial + r.km;
        const restante = proximo - v.kmAtual;
        items.push({
          v,
          r,
          ultimo: null,
          proximo,
          restante,
          atual,
          status:
            restante <= 0
              ? 'vencida'
              : restante <= avisoProximidadeKm
                ? 'proxima'
                : 'sem',
        });
        continue;
      }

      const proximo = ultimo.km + r.km;
      const restante = proximo - v.kmAtual;
      const status =
        restante <= 0
          ? 'vencida'
          : restante <= avisoProximidadeKm
            ? 'proxima'
            : 'ok';

      items.push({
        v,
        r,
        ultimo,
        proximo,
        restante,
        atual,
        status,
      });
    }
  }

  return items;
}

export const cmpFuel = (a: Abastecimento, b: Abastecimento) =>
  a.data < b.data ? -1 : a.data > b.data ? 1 : Number(a.km) - Number(b.km);

/** Média de km/l por abastecimento. ARLA e primeiro abastecimento não geram média. */
export function computeFuelMedias(
  input: Abastecimento[] = []
): Record<string, number | null> {
  const medias: Record<string, number | null> = {};
  const porVeiculo = new Map<string, Abastecimento[]>();
  const fuelings = Array.isArray(input) ? input.filter(Boolean) : [];

  for (const fuel of fuelings) {
    if (fuel.tipo === 'Arla') {
      medias[fuel.id] = null;
      continue;
    }
    const lista = porVeiculo.get(fuel.veiculoId) ?? [];
    lista.push(fuel);
    porVeiculo.set(fuel.veiculoId, lista);
  }

  for (const lista of Array.from(porVeiculo.values())) {
    const ordenados = [...lista].sort((a, b) => Number(a.km) - Number(b.km));
    for (let i = 0; i < ordenados.length; i++) {
      const atual = ordenados[i];
      if (i === 0 || Number(atual.litros) <= 0) {
        medias[atual.id] = null;
        continue;
      }
      const anterior = ordenados[i - 1];
      const distancia = Number(atual.km) - Number(anterior.km);
      medias[atual.id] =
        distancia > 0
          ? Number((distancia / Number(atual.litros)).toFixed(2))
          : null;
    }
  }

  return medias;
}

/** Detalhes adicionais usados pelo resumo de abastecimentos da interface. */
export function computeFuelMediaDetails(
  input: Abastecimento[] = []
): Record<string, { media: number; dist: number; litros: number; kmAnterior: number }> {
  const details: Record<string, { media: number; dist: number; litros: number; kmAnterior: number }> = {};
  const fuelings = Array.isArray(input) ? input.filter(Boolean) : [];
  const porVeiculo = new Map<string, Abastecimento[]>();

  for (const fuel of fuelings) {
    if (fuel.tipo === 'Arla') continue;
    const lista = porVeiculo.get(fuel.veiculoId) ?? [];
    lista.push(fuel);
    porVeiculo.set(fuel.veiculoId, lista);
  }

  for (const lista of Array.from(porVeiculo.values())) {
    const ordenados = [...lista].sort((a, b) => Number(a.km) - Number(b.km));
    for (let i = 1; i < ordenados.length; i++) {
      const atual = ordenados[i];
      const anterior = ordenados[i - 1];
      const media = computeFuelMedias([anterior, atual])[atual.id];
      if (media === null || media === undefined) continue;
      details[atual.id] = {
        media,
        dist: Number(atual.km) - Number(anterior.km),
        litros: Number(atual.litros) || 0,
        kmAnterior: Number(anterior.km),
      };
    }
  }

  return details;
}

/**
 * Leituras ABSOLUTAS de hodômetro lançadas para o veículo (nunca são somadas):
 * abastecimentos, manutenções, viagens (KM inicial/final) e movimentações de
 * pneus que informaram o KM do veículo. O hodômetro atual é a maior leitura.
 * Multas não entram: não movimentam quilometragem.
 */
export const vehicleLaunchKms = (
  vehId: string,
  fuelings: Abastecimento[] = [],
  maintenances: Manutencao[] = [],
  trips: Viagem[] = [],
  tires: Pneu[] = []
): number[] => [
  ...(Array.isArray(fuelings) ? fuelings : [])
    .filter((f) => f?.veiculoId === vehId)
    .map((f) => Number(f.km)),
  ...(Array.isArray(maintenances) ? maintenances : [])
    .filter((m) => m?.veiculoId === vehId && m.km !== null && m.km !== undefined)
    .map((m) => Number(m.km)),
  ...(Array.isArray(trips) ? trips : [])
    .filter((t) => t?.veiculoId === vehId)
    .flatMap((t) => [
      Number(t.kmInicial),
      t.kmFinal !== null && t.kmFinal !== undefined ? Number(t.kmFinal) : NaN,
    ]),
  ...(Array.isArray(tires) ? tires : []).flatMap((t) =>
    (t?.historicoVeiculos || [])
      .filter(
        (h) =>
          !h.cancelada &&
          h.veiculoId === vehId &&
          h.kmVeiculo !== null &&
          h.kmVeiculo !== undefined
      )
      .map((h) => Number(h.kmVeiculo))
  ),
].filter((n) => Number.isFinite(n));

export const baseKmOf = (v: Veiculo): number | null =>
  v.kmBase !== undefined && v.kmBase !== null
    ? Number(v.kmBase)
    : INITIAL_VEHICLES.find((x) => x.id === v.id)?.kmAtual ?? null;

export const odometerFrom = (v: Veiculo, kms: number[]): number => {
  const base = baseKmOf(v);
  const values = Array.isArray(kms) ? kms.filter(Number.isFinite) : [];
  const all = base === null ? values : [...values, base];
  return all.length ? Math.max(...all) : Number(v.kmAtual) || 0;
};

export const applyOdometer = (
  vehs: Veiculo[],
  tirs: Pneu[],
  vehId: string,
  novo: number,
  obs: string,
  data: string
): { vehs: Veiculo[]; tirs: Pneu[] } => {
  const safeVehicles = Array.isArray(vehs) ? vehs : [];
  const safeTires = Array.isArray(tirs) ? tirs : [];
  const veh = safeVehicles.find((v) => v.id === vehId);
  if (!veh) return { vehs: safeVehicles, tirs: safeTires };
  const delta = novo - (Number(veh.kmAtual) || 0);
  if (!delta) return { vehs: safeVehicles, tirs: safeTires };
  // O KM do veículo NÃO é repassado aos pneus: cada pneu só acumula KM pelas
  // suas próprias movimentações (ver pneuKmService). Os parâmetros `obs` e
  // `data` permanecem na assinatura por compatibilidade.
  void obs;
  void data;
  return {
    vehs: safeVehicles.map((v) => (v.id === vehId ? { ...v, kmAtual: novo } : v)),
    tirs: safeTires,
  };
};

export interface FuelKmDiff {
  /** Diferença de KM para o abastecimento anterior do mesmo veículo (null = não se aplica). */
  diff: number | null;
  kmAnterior: number | null;
  /** True quando o KM atual é menor que o do abastecimento anterior (divergência). */
  divergente: boolean;
}

/**
 * MÉDIA DE KM = KM do abastecimento atual − KM do abastecimento imediatamente
 * anterior do MESMO veículo (ordem por data e KM). Não é o consumo em km/l.
 * Arla fica fora da sequência, igual à média km/l. O primeiro abastecimento do
 * veículo e KM menor que o anterior não geram valor.
 */
export function computeFuelKmDiffs(input: Abastecimento[] = []): Record<string, FuelKmDiff> {
  const out: Record<string, FuelKmDiff> = {};
  const lista = (Array.isArray(input) ? input : []).filter(Boolean);
  const porVeiculo = new Map<string, Abastecimento[]>();
  for (const f of lista) {
    if (f.tipo === 'Arla') {
      out[f.id] = { diff: null, kmAnterior: null, divergente: false };
      continue;
    }
    const arr = porVeiculo.get(f.veiculoId) ?? [];
    arr.push(f);
    porVeiculo.set(f.veiculoId, arr);
  }
  for (const arr of Array.from(porVeiculo.values())) {
    const ord = [...arr].sort(cmpFuel);
    ord.forEach((f, i) => {
      if (i === 0) {
        out[f.id] = { diff: null, kmAnterior: null, divergente: false };
        return;
      }
      const ant = Number(ord[i - 1].km);
      const diff = Number(f.km) - ant;
      out[f.id] =
        diff < 0
          ? { diff: null, kmAnterior: ant, divergente: true }
          : { diff, kmAnterior: ant, divergente: false };
    });
  }
  return out;
}

export const veiculosService = {
  async list(): Promise<Veiculo[]> {
    try {
      const response = await httpClient.get<VeiculoApiDTO[]>('/veiculos');
      return response.data.map(mapVeiculoDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(payload: Omit<Veiculo, 'id'>): Promise<Veiculo> {
    if (payload.eixos < 2 || payload.eixos > 6) {
      throw new Error(
        'A configuração homologada no Snapshot 3.5.0 suporta de 2 a 6 eixos.'
      );
    }
    try {
      const response = await httpClient.post<VeiculoApiDTO>(
        '/veiculos',
        payload
      );
      return mapVeiculoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    id: string,
    payload: Partial<Omit<Veiculo, 'id'>>,
    mountedTires: Pneu[] = []
  ): Promise<Veiculo> {
    if (payload.eixos !== undefined) {
      const orfaos = findOrphanedTiresOnAxleChange(
        id,
        payload.eixos,
        mountedTires
      );
      if (orfaos.length > 0) {
        throw new Error(
          'Não é possível reduzir para ' +
            payload.eixos +
            ' eixos: há ' +
            orfaos.length +
            ' pneu(s) montado(s) em posições que deixariam de existir (' +
            orfaos.map((p) => p.posicaoAtual).join(', ') +
            '). Retire ou remaneje os pneus antes.'
        );
      }
    }

    try {
      const response = await httpClient.patch<VeiculoApiDTO>(
        '/veiculos/' + encodeURIComponent(id),
        payload
      );
      return mapVeiculoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
