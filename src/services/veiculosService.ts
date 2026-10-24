import api from './api';
import { HistoricoReparoKm, MultaTransito, Veiculo } from '@/types/frotawise';

const MOCK_VEICULOS: Veiculo[] = [
  {
    id: 'V-101',
    placa: 'RXK-4F92',
    prefixoFrota: 'FROTA-2041',
    modeloCaminhao: 'Scania R450 Plus 6x2',
    fabricante: 'SCANIA',
    tipoConfiguracao: 'CAVALO_MECANICO_6X2',
    odometroAtualKm: 284590,
    status: 'EM_VIAGEM',
    motoristaAtual: 'Carlos Eduardo Mendes',
    filialBase: 'Matriz Jundiaí - SP',
    totalPosicoesPneus: 10,
    posicoesPneus: [
      {
        posicaoCodigo: '1E',
        eixoNumero: 1,
        lado: 'ESQUERDO',
        rodado: 'SIMPLES',
        pneuAlocado: {
          id: 'PN-9001',
          numeroFogo: 'FW-2026-00142',
          dot: '1425',
          malhaId: 'ML-01',
          marca: 'Michelin',
          modelo: 'X Multi Z',
          aro: '22.5',
          medida: '295/80 R22.5',
          status: 'EM_USO',
          etapaVida: 'NOVO_1_VIDA',
          kmAcumuladoTotal: 78400,
          kmEtapaAtual: 78400,
          limiteKmEtapaAtual: 80000,
          sulcoAtualMm: 3.2,
          pressaoAtualPsi: 110,
          veiculoId: 'V-101',
          veiculoPlaca: 'RXK-4F92',
          posicaoEixo: '1E',
          custoAcumulado: 3450.0,
          ultimaInspecao: '2026-10-22',
        },
      },
      {
        posicaoCodigo: '1D',
        eixoNumero: 1,
        lado: 'DIREITO',
        rodado: 'SIMPLES',
        pneuAlocado: {
          id: 'PN-9002',
          numeroFogo: 'FW-2026-00143',
          dot: '1425',
          malhaId: 'ML-01',
          marca: 'Michelin',
          modelo: 'X Multi Z',
          aro: '22.5',
          medida: '295/80 R22.5',
          status: 'EM_USO',
          etapaVida: 'NOVO_1_VIDA',
          kmAcumuladoTotal: 42100,
          kmEtapaAtual: 42100,
          limiteKmEtapaAtual: 80000,
          sulcoAtualMm: 9.8,
          pressaoAtualPsi: 112,
          veiculoId: 'V-101',
          veiculoPlaca: 'RXK-4F92',
          posicaoEixo: '1D',
          custoAcumulado: 3450.0,
          ultimaInspecao: '2026-10-22',
        },
      },
      {
        posicaoCodigo: '2EE',
        eixoNumero: 2,
        lado: 'ESQUERDO',
        rodado: 'DUPLO_EXTERNO',
      },
      {
        posicaoCodigo: '2EI',
        eixoNumero: 2,
        lado: 'ESQUERDO',
        rodado: 'DUPLO_INTERNO',
      },
      {
        posicaoCodigo: '2DI',
        eixoNumero: 2,
        lado: 'DIREITO',
        rodado: 'DUPLO_INTERNO',
      },
      {
        posicaoCodigo: '2DE',
        eixoNumero: 2,
        lado: 'DIREITO',
        rodado: 'DUPLO_EXTERNO',
      },
    ],
  },
  {
    id: 'V-102',
    placa: 'QPL-9A11',
    prefixoFrota: 'FROTA-2088',
    modeloCaminhao: 'Volvo FH 540 Globetrotter 6x4',
    fabricante: 'VOLVO',
    tipoConfiguracao: 'CAVALO_MECANICO_6X4',
    odometroAtualKm: 412300,
    status: 'OPERACIONAL',
    motoristaAtual: 'Roberto Almeida Silva',
    filialBase: 'Hub Rondonópolis - MT',
    totalPosicoesPneus: 10,
    posicoesPneus: [],
  },
  {
    id: 'V-103',
    placa: 'MTR-8C40',
    prefixoFrota: 'FROTA-2104',
    modeloCaminhao: 'Mercedes-Benz Actros 2651 6x4',
    fabricante: 'MERCEDES_BENZ',
    tipoConfiguracao: 'CAVALO_MECANICO_6X4',
    odometroAtualKm: 198400,
    status: 'MANUTENCAO',
    motoristaAtual: 'Marcos Vinícius Souza',
    filialBase: 'Filial Paranaguá - PR',
    totalPosicoesPneus: 10,
    posicoesPneus: [],
  },
];

const MOCK_MULTAS: MultaTransito[] = [
  {
    id: 'MLT-701',
    autoInfracao: 'PRF-BR116-998123',
    veiculoId: 'V-101',
    veiculoPlaca: 'RXK-4F92',
    motoristaNome: 'Carlos Eduardo Mendes',
    dataOcorrencia: '2026-10-12',
    orgaoAutuador: 'PRF',
    descricaoInfracao: 'Conduzir veículo com equipamento obrigatório em desacordo (Sulco abaixo do TWI)',
    gravidade: 'GRAVE',
    pontosCnh: 5,
    valorOriginal: 195.23,
    statusPagamento: 'EM_RECURSO',
    relacionadaPneuOuManutencao: true,
  },
  {
    id: 'MLT-702',
    autoInfracao: 'ANTT-PESO-441209',
    veiculoId: 'V-102',
    veiculoPlaca: 'QPL-9A11',
    motoristaNome: 'Roberto Almeida Silva',
    dataOcorrencia: '2026-10-04',
    orgaoAutuador: 'ANTT',
    descricaoInfracao: 'Transitar com excesso de peso por eixo em balança rodoviária (BR-163)',
    gravidade: 'MEDIA',
    pontosCnh: 4,
    valorOriginal: 586.94,
    statusPagamento: 'PAGO_COM_DESCONTO',
    relacionadaPneuOuManutencao: true,
  },
  {
    id: 'MLT-703',
    autoInfracao: 'DNIT-VEL-119023',
    veiculoId: 'V-103',
    veiculoPlaca: 'MTR-8C40',
    motoristaNome: 'Marcos Vinícius Souza',
    dataOcorrencia: '2026-10-19',
    orgaoAutuador: 'DNIT',
    descricaoInfracao: 'Transitar em velocidade superior à máxima permitida em até 20%',
    gravidade: 'MEDIA',
    pontosCnh: 4,
    valorOriginal: 130.16,
    statusPagamento: 'PENDENTE',
    relacionadaPneuOuManutencao: false,
  },
];

const MOCK_REPAROS_KM: HistoricoReparoKm[] = [
  {
    id: 'REP-501',
    veiculoPlaca: 'RXK-4F92',
    numeroFogoPneu: 'FW-2025-00889',
    dataServico: '2026-10-10',
    odometroNoMomentoKm: 279100,
    tipoManutencao: 'RECAPAGEM_REMOLD',
    fornecedorOficina: 'Recapadora Vipal Sul - Matriz',
    custoTotal: 890.0,
    custoPorKmImpacto: 0.0148,
    responsavelTecnico: 'Eng. Ricardo Fontes',
  },
  {
    id: 'REP-502',
    veiculoPlaca: 'QPL-9A11',
    numeroFogoPneu: 'FW-2026-00142',
    dataServico: '2026-10-15',
    odometroNoMomentoKm: 409800,
    tipoManutencao: 'ALINHAMENTO_BALANCEAMENTO',
    fornecedorOficina: 'Centro Automotivo Pesados BR',
    custoTotal: 640.0,
    custoPorKmImpacto: 0.0085,
    responsavelTecnico: 'Sup. André Queiroz',
  },
  {
    id: 'REP-503',
    veiculoPlaca: 'MTR-8C40',
    numeroFogoPneu: 'FW-2024-00054',
    dataServico: '2026-10-21',
    odometroNoMomentoKm: 198100,
    tipoManutencao: 'VULCANIZACAO',
    fornecedorOficina: 'Borracharia Industrial 24h',
    custoTotal: 280.0,
    custoPorKmImpacto: 0.0046,
    responsavelTecnico: 'Tec. Cláudio Bastos',
  },
];

export const veiculosService = {
  async listarVeiculos(): Promise<Veiculo[]> {
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_MOCK !== 'false') {
        return new Promise((resolve) => setTimeout(() => resolve([...MOCK_VEICULOS]), 220));
      }
      const { data } = await api.get<Veiculo[]>('/veiculos');
      return data;
    } catch {
      return [...MOCK_VEICULOS];
    }
  },

  async registrarManutencao(
    registro: Omit<HistoricoReparoKm, 'id'>
  ): Promise<{ sucesso: boolean; idGerado: string }> {
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_MOCK !== 'false') {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                sucesso: true,
                idGerado: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
              }),
            280
          )
        );
      }
      const { data } = await api.post('/veiculos/manutencoes', registro);
      return data;
    } catch {
      return {
        sucesso: true,
        idGerado: `REP-LOCAL-${Date.now().toString().slice(-4)}`,
      };
    }
  },

  async listarMultasFrota(): Promise<MultaTransito[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_MULTAS]), 200));
  },

  async listarHistoricoReparosKm(): Promise<HistoricoReparoKm[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_REPAROS_KM]), 200));
  },
};
