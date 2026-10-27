export type ClassificacaoPneu = 'Rodando' | 'Estocar' | 'Recapar' | 'Sucatear';

export type TipoOperacaoPneu = 'Mount' | 'Estocar' | 'Recapar' | 'Sucatear' | 'AddKm';

export type StatusVeiculo = 'Operando' | 'Manutenção';

export type StatusMulta = 'Pendente' | 'Paga' | 'Em Recurso';

export type TipoManutencao = 'Preventiva' | 'Corretiva' | 'Pneus / Recapagem';

export type TipoCombustivel = 'Gasolina' | 'Arla' | 'Diesel';

export interface RegraModeloPneu {
  id: string;
  marca: string;
  medida: string;
  km1: number;
  km2: number;
  km3: number;
  kmSucata: number;
}

export interface RegraManutencaoPreventiva {
  id: string;
  modelo: string;
  categoria: string;
  peca: string;
  km: number;
}

export interface RegrasGeraisPneus {
  kmEstocar: number;
  kmRecapar: number;
  kmSucatear: number;
  msgEstocar: string;
  msgRecapar: string;
  msgSucatear: string;
}

export interface EmpresaConfig {
  nomeEmpresa: string;
  cnpj: string;
  logoUrl: string;
  regrasModelos: RegraModeloPneu[];
  regrasManutencao: RegraManutencaoPreventiva[];
  regrasPneus: RegrasGeraisPneus;
}

export interface HistoricoVeiculoPneu {
  id: string;
  placa: string;
  modelo: string;
  kmRodados: number;
  data: string;
  obs: string;
}

export interface ReformaPneu {
  id: string;
  data: string;
  ciclo: number;
  tipoBanda: string;
  fornecedor: string;
  valor: number;
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
  historicoVeiculos: HistoricoVeiculoPneu[];
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
  status: StatusVeiculo;
}

export interface AlertaRemold {
  tire: Pneu;
  tipo: 'Sucatear' | 'Recapar' | 'Estocar';
  localLabel: string;
  instrucao: string;
  motivo: string;
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

export interface AlertaPreventivaItem {
  v: Veiculo;
  r: RegraManutencaoPreventiva;
  ultimo: Manutencao | null;
  proximo: number | null;
  restante: number | null;
  status: 'sem' | 'vencida' | 'proxima' | 'ok';
}
