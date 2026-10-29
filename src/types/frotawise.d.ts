export type StatusVeiculo = 'Ativo' | 'Manutencao' | 'Inativo';

export type ClassificacaoPneu = 'Rodando' | 'Estocar' | 'Recapar' | 'Sucatear';

export type TipoOperacaoPneu =
  | 'Mount'
  | 'Estocar'
  | 'Recapar'
  | 'Sucatear'
  | 'AddKm';

export type TipoCombustivel = 'Diesel' | 'Gasolina' | 'Arla';

export type TipoManutencao = 'Preventiva' | 'Corretiva' | 'Preditiva';

export type StatusMulta = 'Pendente' | 'Paga' | 'Recorrida' | 'Cancelada';

export type PapelUsuario = 'ADMIN' | 'OPERADOR' | 'DIRETOR';

export interface RegraModeloPneu {
  id: string;
  marca: string;
  medida: string;
  km1: number;
  km2: number;
  km3: number;
  kmSucata: number;
}

export interface RegrasGeraisPneu {
  sulcoMinimoMm: number;
  maxRecapagens: number;
  alertaProximidadeKm: number;
}

export interface RegraManutencaoPreventiva {
  id: string;
  modelo: string;
  categoria: string;
  peca: string;
  km: number;
}

export interface EmpresaConfig {
  nomeEmpresa: string;
  cnpj: string;
  logoUrl: string;
  regrasModelos: RegraModeloPneu[];
  regrasPneus: RegrasGeraisPneu;
  regrasManutencao: RegraManutencaoPreventiva[];
}

export interface HistoricoPneu {
  id?: string;
  veiculoId: string;
  placa?: string;
  posicao: string;
  dataMontagem: string;
  dataRetirada?: string | null;
  kmInstalacao?: number;
  kmRetirada?: number | null;
  kmRodado: number;
  motivo?: string;
  autorId?: string;
}

export interface ReformaPneu {
  id?: string;
  ciclo: number;
  dataEnvio: string;
  dataRetorno?: string | null;
  fornecedor: string;
  tipoBanda: string;
  valor: number;
  kmNoEnvio: number;
  concluida: boolean;
}

export interface Pneu {
  id: string;
  fogo: string;
  marca: string;
  medida: string;
  sulcoMm: number;
  recapagens: number;
  kmTotal: number;
  classificacao: ClassificacaoPneu;
  veiculoAtualId: string;
  posicaoAtual: string;
  localEstoque: string;
  tipoBanda?: string;
  historicoVeiculos: HistoricoPneu[];
  reformas?: ReformaPneu[];
}

export interface Veiculo {
  id: string;
  placa: string;
  uf: string;
  modelo: string;
  categoria: string;
  eixos: number;
  kmAtual: number;
  kmBase?: number | null;
  status: StatusVeiculo;
}

export interface Manutencao {
  id: string;
  osNumero: string;
  veiculoId: string;
  tipo: TipoManutencao;
  categoria?: string;
  peca?: string;
  km?: number;
  descricao: string;
  fornecedor: string;
  data: string;
  valor: number;
}

export interface Multa {
  id: string;
  ait: string;
  veiculoId: string;
  motivo: string;
  identificado?: boolean;
  motorista: string;
  status: StatusMulta;
  data: string;
  pontos: number;
  valorOriginal?: number;
  valorNIC?: number;
  valor: number;
}

export interface Abastecimento {
  id: string;
  veiculoId: string;
  tipo: TipoCombustivel;
  data: string;
  litros: number;
  valorUnit: number;
  valorTotal: number;
  km: number;
  fornecedor: string;
}

export interface KmAtualLancado {
  km: number;
  data: string;
  origem: 'manutencao' | 'abastecimento' | 'operacao' | 'kmBase';
}

export type StatusAlertaPreventiva = 'sem' | 'vencida' | 'proxima' | 'ok';

export interface AlertaPreventivaItem {
  v: Veiculo;
  r: RegraManutencaoPreventiva;
  ultimo: Manutencao | null;
  proximo: number;
  restante: number;
  atual: KmAtualLancado;
  status: StatusAlertaPreventiva;
}

export interface AlertaRemold {
  tire: Pneu;
  tipo: 'recapar' | 'sucatear' | 'atencao';
  localLabel: string;
  instrucao: string;
  motivo: string;
}
