export type StatusPneu = 'ESTOQUE' | 'EM_USO' | 'EM_REMOLD' | 'SUCATA' | 'MANUTENCAO';

export type EtapaVidaPneu = 'NOVO_1_VIDA' | 'REMOLD_1' | 'REMOLD_2' | 'REMOLD_3' | 'FIM_VIDA';

export type SeveridadeAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export type StatusVeiculo = 'OPERACIONAL' | 'MANUTENCAO' | 'EM_VIAGEM' | 'INATIVO';

export type MotivoRetiradaPneu = 'ENVIO_REMOLD' | 'FURO_REPARO' | 'RODIZIO' | 'DESCARTE_SUCATA' | 'TROCA_PREVENTIVA';

export interface TransportadoraTenant {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  unidadesAtivas: number;
  frotaTotal: number;
}

export interface UsuarioCorporativo {
  id: string;
  nome: string;
  email: string;
  cargo: 'DIRETOR_OPERACOES' | 'GESTOR_FROTA' | 'ENGENHEIRO_MANUTENCAO' | 'ANALISTA_CUSTOS';
  tenant: TransportadoraTenant;
  tokenJwt?: string;
}

export interface MalhaPneu {
  id: string;
  marca: string;
  modelo: string;
  medida: string; // Ex: 295/80 R22.5
  aro: string;
  indiceCarga: string;
  limiteKmNovo: number;
  limiteKmRemold1: number;
  limiteKmRemold2: number;
  sulcoMinimoSegurancaMm: number;
  custoMedioAquisicao: number;
}

export interface Pneu {
  id: string;
  numeroFogo: string; // Identificador único gravado a fogo no pneu
  dot: string;
  malhaId: string;
  marca: string;
  modelo: string;
  aro: string;
  medida: string;
  status: StatusPneu;
  etapaVida: EtapaVidaPneu;
  kmAcumuladoTotal: number;
  kmEtapaAtual: number;
  limiteKmEtapaAtual: number;
  sulcoAtualMm: number;
  pressaoAtualPsi: number;
  veiculoId?: string;
  veiculoPlaca?: string;
  posicaoEixo?: string; // Ex: '1E', '1D', '2EE', '2EI'
  custoAcumulado: number;
  ultimaInspecao: string;
}

export interface PosicaoPneuVeiculo {
  posicaoCodigo: string; // '1E', '1D', '2EE', '2EI', '2DE', '2DI', '3EE', '3EI', '3DE', '3DI'
  eixoNumero: number;
  lado: 'ESQUERDO' | 'DIREITO';
  rodado: 'SIMPLES' | 'DUPLO_EXTERNO' | 'DUPLO_INTERNO';
  pneuAlocado?: Pneu;
}

export interface Veiculo {
  id: string;
  placa: string;
  prefixoFrota: string;
  modeloCaminhao: string;
  fabricante: 'SCANIA' | 'VOLVO' | 'MERCEDES_BENZ' | 'DAF' | 'IVECO' | 'VW';
  tipoConfiguracao: 'CAVALO_MECANICO_6X2' | 'CAVALO_MECANICO_6X4' | 'BITREM_7_EIXOS' | 'RODOTREM_9_EIXOS';
  odometroAtualKm: number;
  status: StatusVeiculo;
  motoristaAtual: string;
  filialBase: string;
  totalPosicoesPneus: number;
  posicoesPneus: PosicaoPneuVeiculo[];
}

export interface AlertaRemold {
  id: string;
  pneuId: string;
  numeroFogo: string;
  veiculoPlaca: string;
  posicaoEixo: string;
  kmAtualEtapa: number;
  limiteKmEtapa: number;
  percentualDesgaste: number;
  sulcoAtualMm: number;
  severidade: SeveridadeAlerta;
  recomendacao: string;
  dataDeteccao: string;
}

export interface MultaTransito {
  id: string;
  autoInfracao: string;
  veiculoId: string;
  veiculoPlaca: string;
  motoristaNome: string;
  dataOcorrencia: string;
  orgaoAutuador: 'PRF' | 'DNIT' | 'DER' | 'ANTT' | 'MUNICIPAL';
  descricaoInfracao: string;
  gravidade: 'LEVE' | 'MEDIA' | 'GRAVE' | 'GRAVISSIMA';
  pontosCnh: number;
  valorOriginal: number;
  statusPagamento: 'PENDENTE' | 'PAGO_COM_DESCONTO' | 'EM_RECURSO' | 'VENCIDO';
  relacionadaPneuOuManutencao: boolean;
}

export interface HistoricoReparoKm {
  id: string;
  veiculoPlaca: string;
  numeroFogoPneu?: string;
  dataServico: string;
  odometroNoMomentoKm: number;
  tipoManutencao: 'RECAPAGEM_REMOLD' | 'VULCANIZACAO' | 'ALINHAMENTO_BALANCEAMENTO' | 'TROCA_VALVULA' | 'SUBSTITUICAO_SUCATA';
  fornecedorOficina: string;
  custoTotal: number;
  custoPorKmImpacto: number; // CPK calculado
  responsavelTecnico: string;
}

export interface ResumoDistribuicaoPneus {
  novosPrimeiraVida: number;
  emCicloRemold: number;
  sucataDescarte: number;
  emEstoquePronto: number;
  totalAtivos: number;
  economiaGeradaRemoldReais: number;
}

export interface PayloadAlocarPneu {
  pneuId: string;
  veiculoId: string;
  posicaoCodigo: string;
  odometroVeiculoKm: number;
  pressaoInicialPsi: number;
}

export interface PayloadRetiradaPneu {
  pneuId: string;
  veiculoId: string;
  odometroRetiradaKm: number;
  sulcoMedidoMm: number;
  motivo: MotivoRetiradaPneu;
  fornecedorDestino?: string;
  observacoesTecnicas: string;
}
