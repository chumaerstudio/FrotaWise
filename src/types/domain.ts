import type {
  ClassificacaoPneu,
  PapelUsuario,
  StatusAlertaPreventiva,
  StatusMulta,
  StatusVeiculo,
  TipoCombustivel,
  TipoManutencao,
} from './frotawise';

export interface UserCapabilities {
  canManageVehicles: boolean;
  canManageTires: boolean;
  canManageMalha: boolean;
  canManagePreventiveRules: boolean;
  canManageFuelings: boolean;
  canManageMaintenances: boolean;
  canManageFines: boolean;
  canImportData: boolean;
  canExportData: boolean;
}

export interface AuthenticatedUserDTO {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  tenantId: string;
  nomeEmpresa: string;
  capabilities: UserCapabilities;
}

export interface PneuApiDTO {
  id: string;
  fogo: string;
  marca: string;
  medida: string;
  sulcoMm: number;
  recapagens: number;
  kmTotal: number;
  classificacao: ClassificacaoPneu;
  veiculoAtualId: string | null;
  posicaoAtual: string | null;
  localEstoque: string;
  tipoBanda: string | null;
  updatedAt?: string;
}

export interface VeiculoApiDTO {
  id: string;
  placa: string;
  uf: string;
  modelo: string;
  categoria: string;
  eixos: number;
  kmAtual: number;
  kmBase: number | null;
  status: StatusVeiculo;
  ultimoHodometro?: {
    km: number;
    data: string;
    origem: 'manutencao' | 'abastecimento' | 'operacao' | 'kmBase';
  } | null;
  updatedAt?: string;
}

export interface AbastecimentoApiDTO {
  id: string;
  veiculoId: string;
  tipo: TipoCombustivel;
  data: string;
  litros: number;
  valorUnit: string;
  valorTotal: string;
  km: number;
  fornecedor: string;
  mediaKmLitroCalculada?: number | null;
  updatedAt?: string;
}

export interface AlertaPreventivaApiDTO {
  veiculoId: string;
  regraId: string;
  ultimaManutencaoId: string | null;
  ultimaManutencaoKm: number | null;
  ultimaManutencaoData: string | null;
  kmAtual: number;
  kmAtualData: string;
  kmAtualOrigem: 'manutencao' | 'abastecimento' | 'operacao' | 'kmBase';
  proximoLimiteKm: number;
  restanteKm: number;
  status: StatusAlertaPreventiva;
}

export interface ManutencaoApiDTO {
  id: string;
  osNumero: string;
  veiculoId: string;
  tipo: TipoManutencao;
  categoria: string | null;
  peca: string | null;
  km: number | null;
  descricao: string;
  fornecedor: string;
  data: string;
  valor: string;
  updatedAt?: string;
}

export interface MultaApiDTO {
  id: string;
  ait: string;
  veiculoId: string;
  motivo: string;
  identificado: boolean;
  motorista: string;
  status: StatusMulta;
  data: string;
  pontos: number;
  valorOriginal: string | null;
  valorNIC: string | null;
  valor: string;
  updatedAt?: string;
}

export interface DashboardResumoApiDTO {
  pneus: {
    total: number;
    rodando: number;
    estoque: number;
    recapagem: number;
    sucata: number;
  };
  financeiro: {
    custoManutencoesPeriodo: string;
    custoMultasPeriodo: string;
    custoCombustivelPeriodo: string;
  };
  fuelStats: {
    totalLitrosCombustivel: number;
    totalLitrosArla: number;
    gastoTotalCombustivel: string;
    gastoTotalArla: string;
    totalLancamentos: number;
    mediaKmLitroFrota: number | null;
    veiculosComAmostraValida: number;
  };
}
