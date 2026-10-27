import { Manutencao, Multa, Veiculo } from '@/types/frotawise';

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

export const getVehicleChassisSlots = (eixosCount: number) => {
  const n = Math.max(2, Math.min(6, Number(eixosCount) || 3));
  const axles = [
    {
      axleNumber: 1,
      leftSlots: [{ code: 'E1-ESQ', label: '1º Eixo Esq.' }],
      rightSlots: [{ code: 'E1-DIR', label: '1º Eixo Dir.' }],
    },
  ];
  for (let i = 2; i <= n; i++) {
    axles.push({
      axleNumber: i,
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
};


import { Abastecimento, RegraManutencaoPreventiva } from '@/types/frotawise';
import { normTxt } from './pneusService';

export const cmpFuel = (a: Abastecimento, b: Abastecimento) =>
  a.data < b.data ? -1 : a.data > b.data ? 1 : Number(a.km) - Number(b.km);

export const computeFuelMedias = (fuelings: Abastecimento[]) => {
  const map: Record<
    string,
    { media: number; dist: number; litros: number; kmAnterior: number }
  > = {};
  const byVeh: Record<string, Abastecimento[]> = {};
  fuelings.forEach((f) => {
    (byVeh[f.veiculoId] = byVeh[f.veiculoId] || []).push(f);
  });
  Object.values(byVeh).forEach((list) => {
    const comb = list.filter((f) => f.tipo !== 'Arla').sort(cmpFuel);
    comb.forEach((f, i) => {
      if (i === 0) return;
      const dist = Number(f.km) - Number(comb[i - 1].km);
      const litros = Number(f.litros) || 0;
      if (dist > 0 && litros > 0) {
        map[f.id] = {
          media: dist / litros,
          dist,
          litros,
          kmAnterior: Number(comb[i - 1].km),
        };
      }
    });
  });
  return map;
};

export const matchesPreventiveRule = (
  m: { categoria?: string; peca?: string; descricao: string },
  rule: RegraManutencaoPreventiva
) => {
  if (m.categoria !== rule.categoria) return false;
  const alvo = normTxt(rule.peca);
  if (!alvo) return true;
  return (
    normTxt(m.peca) === alvo ||
    normTxt(m.peca).includes(alvo) ||
    normTxt(m.descricao).includes(alvo)
  );
};
