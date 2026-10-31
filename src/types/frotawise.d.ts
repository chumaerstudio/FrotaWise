export type StatusVeiculo = 'Ativo' | 'Manutencao' | 'Inativo' | 'Operando' | 'Manutenção';

export type ClassificacaoPneu = 'Rodando' | 'Estocar' | 'Recapar' | 'Sucatear';

export type TipoOperacaoPneu =
  | 'Mount'
  | 'Estocar'
  | 'Recapar'
  | 'Sucatear'
  | 'AddKm';

export type TipoCombustivel = 'Diesel' | 'Gasolina' | 'Arla';

<<<<<<< HEAD
export type TipoManutencao = 'Preventiva' | 'Corretiva' | 'Pneus / Recapagem';

export type StatusMulta = 'Pendente' | 'Paga' | 'Em Recurso';
=======
export type TipoManutencao = 'Preventiva' | 'Corretiva' | 'Preditiva' | 'Pneus / Recapagem';

export type StatusMulta = 'Pendente' | 'Paga' | 'Recorrida' | 'Cancelada' | 'Em Recurso';
>>>>>>> bd617bf40e6aa8283013d5e6cf525d17e6e29ee2

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
  kmEstocar: number;
  kmRecapar: number;
  kmSucatear: number;
  msgEstocar: string;
  msgRecapar: string;
  msgSucatear: string;
  sulcoMinimoMm?: number;
  maxRecapagens?: number;
  alertaProximidadeKm?: number;
  kmRecaparPadrao?: number;
  kmSucatearPadrao?: number;
  [key: string]: unknown;
}

/** Nome plural mantido para compatibilidade com versões anteriores. */
export type RegrasGeraisPneus = RegrasGeraisPneu;

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
  veiculoId?: string;
  placa?: string;
  modelo?: string;
  posicao?: string;
  dataMontagem?: string;
  dataRetirada?: string | null;
  kmInstalacao?: number;
  kmRetirada?: number | null;
  kmRodado?: number;
  /** Campos do histórico legado ainda usados no modal de pneus. */
  kmRodados?: number;
  data?: string;
  obs?: string;
  motivo?: string;
  autorId?: string;
}

export type HistoricoVeiculoPneu = HistoricoPneu;

export interface ReformaPneu {
  id?: string;
  ciclo: number;
  dataEnvio?: string;
  dataRetorno?: string | null;
  /** Campo legado usado para exibir a data da recapagem. */
  data?: string;
  fornecedor: string;
  tipoBanda: string;
  valor: number;
  kmNoEnvio?: number;
  concluida?: boolean;
}

export interface Pneu {
  id: string;
  /** Aliases opcionais de versões anteriores da interface de pneus. */
  numeroFogo?: string;
  sulcoAtualMm?: number;
  veiculoId?: string;
  veiculoPlaca?: string;
  posicaoEixo?: string;
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
  km?: number | null;
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
  data: string | null;
  origem: 'manutencao' | 'abastecimento' | 'operacao' | 'kmBase' | 'Abastecimento' | 'Manutenção' | 'Cadastro do veículo';
}

export type StatusAlertaPreventiva = 'sem' | 'vencida' | 'proxima' | 'ok';

export interface AlertaPreventivaItem {
  v: Veiculo;
  r: RegraManutencaoPreventiva;
  ultimo: Manutencao | null;
  proximo: number | null;
  restante: number | null;
  atual: KmAtualLancado;
  status: StatusAlertaPreventiva;
}

export interface AlertaRemold {
  tire: Pneu;
  tipo: 'Sucatear' | 'Recapar' | 'Estocar' | 'Atencao' | 'sucatear' | 'recapar' | 'atencao';
  localLabel: string;
  instrucao: string;
  motivo: string;
}


/** Resumo agregado usado pelo gráfico de distribuição da frota de pneus. */
export interface ResumoDistribuicaoPneus {
  novosPrimeiraVida: number;
  emCicloRemold: number;
  sucataDescarte: number;
  emEstoquePronto: number;
  economiaGeradaRemoldReais: number;
  totalAtivos: number;
}

/** Contrato legado do modal de retirada, mantido para compatibilidade. */
export type MotivoRetiradaPneu =
  | 'ENVIO_REMOLD'
  | 'RODIZIO'
  | 'FURO_REPARO'
  | 'DESCARTE_SUCATA';

export interface PayloadRetiradaPneu {
  pneuId: string;
  veiculoId: string;
  odometroRetiradaKm: number;
  sulcoMedidoMm: number;
  motivo: MotivoRetiradaPneu;
  fornecedorDestino: string;
  observacoesTecnicas: string;
}
