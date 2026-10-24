import { EmpresaConfig, Pneu, RegraModeloPneu } from '@/types/frotawise';

export const INITIAL_COMPANY: EmpresaConfig = {
  nomeEmpresa: 'EcoFrota Logística & Transportes Ltda',
  cnpj: '12.345.678/0001-90',
  logoUrl: '',
  regrasModelos: [],
  regrasPneus: {
    kmEstocar: 40000,
    kmRecapar: 75000,
    kmSucatear: 130000,
    msgEstocar: 'Retirar do veículo e enviar ao almoxarifado para reserva/rodízio.',
    msgRecapar: 'Enviar carcaça para recapadora credenciada e atualizar ciclo.',
    msgSucatear: 'Descarte técnico obrigatório. Carcaça no limite de segurança.',
  },
};

const T = (
  id: string,
  fogo: string,
  marca: string,
  sulcoMm: number,
  recapagens: number,
  kmTotal: number,
  classificacao: Pneu['classificacao'],
  veiculoAtualId: string,
  posicaoAtual: string,
  localEstoque: string,
  historicoVeiculos: Pneu['historicoVeiculos']
): Pneu => ({
  id,
  fogo,
  marca,
  medida: '295/80 R22.5',
  sulcoMm,
  recapagens,
  kmTotal,
  classificacao,
  veiculoAtualId,
  posicaoAtual,
  localEstoque,
  historicoVeiculos,
  tipoBanda: '',
  reformas: [],
});

const H = (id: string, placa: string, modelo: string, kmRodados: number, data: string, obs: string) => ({
  id,
  placa,
  modelo,
  kmRodados,
  data,
  obs,
});

export const INITIAL_TIRES: Pneu[] = [
  T('t1', '233', 'Michelin X Multi Z', 8.5, 1, 78500, 'Rodando', 'v1', 'E2-EE', '', [
    H('h1', 'BRA-8E19', 'Volvo FH 540', 48500, '2025-11-10', '1ª vida completa'),
    H('h2', 'OPG-2469', 'Scania R450 Plus', 30000, '2026-04-15', 'Após 1ª recapagem'),
  ]),
  T('t2', '232', 'Michelin X Multi Z', 8.2, 1, 76200, 'Recapar', 'v1', 'E2-EI', '', [
    H('h3', 'OPG-2469', 'Scania R450 Plus', 76200, '2026-05-01', 'Rodagem contínua'),
  ]),
  T('t3', '230', 'Bridgestone R268', 9.0, 1, 64000, 'Rodando', 'v1', 'E2-DI', '', [
    H('h4', 'OPG-2469', 'Scania R450 Plus', 64000, '2026-02-12', 'Eixo tração'),
  ]),
  T('t4', '231', 'Bridgestone R268', 8.8, 1, 64000, 'Rodando', 'v1', 'E2-DE', '', [
    H('h5', 'OPG-2469', 'Scania R450 Plus', 64000, '2026-02-12', 'Eixo tração'),
  ]),
  T('t5', '217', 'Goodyear KMax S', 7.4, 1, 81200, 'Rodando', 'v1', 'E3-EE', '', [
    H('h6', 'GTR-9A11', 'MB Atego 2430', 41200, '2025-09-20', 'Rodou no toco'),
    H('h7', 'OPG-2469', 'Scania R450 Plus', 40000, '2026-03-18', 'Transferido para truck'),
  ]),
  T('t6', '216', 'Goodyear KMax S', 7.5, 1, 80900, 'Rodando', 'v1', 'E3-EI', '', [
    H('h8', 'OPG-2469', 'Scania R450 Plus', 80900, '2026-03-18', '3º Eixo'),
  ]),
  T('t7', '214', 'Goodyear KMax S', 7.1, 1, 82400, 'Rodando', 'v1', 'E3-DI', '', [
    H('h9', 'OPG-2469', 'Scania R450 Plus', 82400, '2026-03-18', '3º Eixo'),
  ]),
  T('t8', '215', 'Goodyear KMax S', 3.1, 3, 136500, 'Sucatear', 'v1', 'E3-DE', '', [
    H('h10', 'BRA-8E19', 'Volvo FH 540', 86500, '2025-10-10', 'Duas vidas no Volvo'),
    H('h11', 'OPG-2469', 'Scania R450 Plus', 50000, '2026-04-02', 'Final de vida'),
  ]),
  T('t9', '369', 'Pirelli FR01', 14.5, 0, 12400, 'Rodando', 'v1', 'E1-DIR', '', [
    H('h12', 'OPG-2469', 'Scania R450 Plus', 12400, '2026-06-01', 'Direcional Novo'),
  ]),
  T('t10', '370', 'Pirelli FR01', 15.0, 0, 0, 'Estocar', '', '', 'Prateleira A-01', []),
  T('t11', '405', 'Continental HSR2', 11.2, 2, 94000, 'Estocar', '', '', 'Prateleira B-04', [
    H('h13', 'BRA-8E19', 'Volvo FH 540', 54000, '2025-08-19', '1ª vida'),
    H('h14', 'GTR-9A11', 'MB Atego 2430', 40000, '2026-01-25', 'Retornado de recapagem'),
  ]),
];

export const getTireRecapStyle = (recapagens: number) => {
  const c = Number(recapagens) || 0;
  if (c === 0) return { c: '#1C2524', label: 'Novo' };
  if (c === 1) return { c: '#715116', label: '1ª Recapagem' };
  if (c === 2) return { c: '#B77A04', label: '2ª Recapagem' };
  if (c === 3) return { c: '#E0560C', label: '3ª Recapagem' };
  return { c: '#C8372D', label: 'Mais Recapagens' };
};

export const normTxt = (v?: string) => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
export const normMedida = (v?: string) => String(v || '').toLowerCase().replace(/\s+/g, '');

export const findTireRule = (
  tire: Pick<Pneu, 'marca' | 'medida'>,
  regras?: RegraModeloPneu[]
): RegraModeloPneu | null =>
  (regras || [])
    .filter(
      (r) =>
        r.marca &&
        normTxt(tire.marca).includes(normTxt(r.marca)) &&
        (!r.medida || normMedida(r.medida) === normMedida(tire.medida))
    )
    .sort(
      (a, b) =>
        (b.medida ? 1000 : 0) + b.marca.length - ((a.medida ? 1000 : 0) + a.marca.length)
    )[0] || null;

export const getTireLimits = (
  tire: Pick<Pneu, 'marca' | 'medida' | 'recapagens'>,
  company: EmpresaConfig
) => {
  const g = company.regrasPneus;
  const rule = findTireRule(tire, company.regrasModelos);
  if (!rule) return { kmRecapar: g.kmRecapar, kmSucatear: g.kmSucatear, etapa: null, rule: null };
  const rc = Number(tire.recapagens) || 0;
  const alvo = Number([rule.km1, rule.km2, rule.km3][rc]);
  return {
    kmRecapar: rc >= 3 ? Infinity : alvo > 0 ? alvo : g.kmRecapar,
    kmSucatear: Number(rule.kmSucata) > 0 ? Number(rule.kmSucata) : g.kmSucatear,
    etapa: rc < 3 ? rc + 1 : null,
    rule,
  };
};

export const pneusService = {
  listarPneus(): Pneu[] {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('ecofrota_v3_tires');
      if (s) return JSON.parse(s);
    }
    return INITIAL_TIRES;
  },
};
