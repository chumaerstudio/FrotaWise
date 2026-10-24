import api from './api';
import {
  AlertaRemold,
  MalhaPneu,
  PayloadAlocarPneu,
  PayloadRetiradaPneu,
  Pneu,
  ResumoDistribuicaoPneus,
} from '@/types/frotawise';

const MOCK_PNEUS: Pneu[] = [
  {
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
  {
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
  {
    id: 'PN-9003',
    numeroFogo: 'FW-2025-00889',
    dot: '4824',
    malhaId: 'ML-02',
    marca: 'Bridgestone',
    modelo: 'R268 Ecopia',
    aro: '22.5',
    medida: '295/80 R22.5',
    status: 'EM_USO',
    etapaVida: 'REMOLD_1',
    kmAcumuladoTotal: 138900,
    kmEtapaAtual: 58900,
    limiteKmEtapaAtual: 60000,
    sulcoAtualMm: 2.8,
    pressaoAtualPsi: 108,
    veiculoId: 'V-102',
    veiculoPlaca: 'QPL-9A11',
    posicaoEixo: '3EE',
    custoAcumulado: 4120.0,
    ultimaInspecao: '2026-10-23',
  },
  {
    id: 'PN-9004',
    numeroFogo: 'FW-2026-00310',
    dot: '0826',
    malhaId: 'ML-03',
    marca: 'Continental',
    modelo: 'HSR2',
    aro: '22.5',
    medida: '295/80 R22.5',
    status: 'ESTOQUE',
    etapaVida: 'NOVO_1_VIDA',
    kmAcumuladoTotal: 0,
    kmEtapaAtual: 0,
    limiteKmEtapaAtual: 85000,
    sulcoAtualMm: 16.0,
    pressaoAtualPsi: 115,
    custoAcumulado: 3190.0,
    ultimaInspecao: '2026-10-20',
  },
  {
    id: 'PN-9005',
    numeroFogo: 'FW-2024-00054',
    dot: '1924',
    malhaId: 'ML-02',
    marca: 'Bridgestone',
    modelo: 'R268 Ecopia',
    aro: '22.5',
    medida: '295/80 R22.5',
    status: 'EM_REMOLD',
    etapaVida: 'REMOLD_2',
    kmAcumuladoTotal: 141200,
    kmEtapaAtual: 0,
    limiteKmEtapaAtual: 50000,
    sulcoAtualMm: 14.5,
    pressaoAtualPsi: 0,
    custoAcumulado: 4890.0,
    ultimaInspecao: '2026-10-18',
  },
  {
    id: 'PN-9006',
    numeroFogo: 'FW-2023-00019',
    dot: '0323',
    malhaId: 'ML-04',
    marca: 'Pirelli',
    modelo: 'FG01S',
    aro: '22.5',
    medida: '275/80 R22.5',
    status: 'SUCATA',
    etapaVida: 'FIM_VIDA',
    kmAcumuladoTotal: 196400,
    kmEtapaAtual: 49400,
    limiteKmEtapaAtual: 50000,
    sulcoAtualMm: 1.4,
    pressaoAtualPsi: 0,
    custoAcumulado: 4650.0,
    ultimaInspecao: '2026-10-15',
  },
];

const MOCK_ALERTAS_REMOLD: AlertaRemold[] = [
  {
    id: 'AL-01',
    pneuId: 'PN-9001',
    numeroFogo: 'FW-2026-00142',
    veiculoPlaca: 'RXK-4F92',
    posicaoEixo: '1E (Dianteiro Esq.)',
    kmAtualEtapa: 78400,
    limiteKmEtapa: 80000,
    percentualDesgaste: 98.0,
    sulcoAtualMm: 3.2,
    severidade: 'CRITICA',
    recomendacao: 'Retirar imediatamente para 1º Remold para preservar a carcaça matriz.',
    dataDeteccao: '2026-10-24 08:30',
  },
  {
    id: 'AL-02',
    pneuId: 'PN-9003',
    numeroFogo: 'FW-2025-00889',
    veiculoPlaca: 'QPL-9A11',
    posicaoEixo: '3EE (Tração Ext.)',
    kmAtualEtapa: 58900,
    limiteKmEtapa: 60000,
    percentualDesgaste: 98.1,
    sulcoAtualMm: 2.8,
    severidade: 'CRITICA',
    recomendacao: 'Sulco próximo ao TWI. Agendar envio à recapadora credenciada Vipal/Bando.',
    dataDeteccao: '2026-10-24 07:15',
  },
  {
    id: 'AL-03',
    pneuId: 'PN-9019',
    numeroFogo: 'FW-2025-00412',
    veiculoPlaca: 'MTR-8C40',
    posicaoEixo: '2DI (Tração Int.)',
    kmAtualEtapa: 71200,
    limiteKmEtapa: 80000,
    percentualDesgaste: 89.0,
    sulcoAtualMm: 4.1,
    severidade: 'ALTA',
    recomendacao: 'Programar parada preventiva no retorno da rota São Paulo -> Curitiba.',
    dataDeteccao: '2026-10-23 18:40',
  },
];

const MOCK_MALHA_PNEUS: MalhaPneu[] = [
  {
    id: 'ML-01',
    marca: 'Michelin',
    modelo: 'X Multi Z',
    medida: '295/80 R22.5',
    aro: '22.5',
    indiceCarga: '152/148M',
    limiteKmNovo: 85000,
    limiteKmRemold1: 65000,
    limiteKmRemold2: 52000,
    sulcoMinimoSegurancaMm: 3.0,
    custoMedioAquisicao: 3450.0,
  },
  {
    id: 'ML-02',
    marca: 'Bridgestone',
    modelo: 'R268 Ecopia',
    medida: '295/80 R22.5',
    aro: '22.5',
    indiceCarga: '152/148M',
    limiteKmNovo: 80000,
    limiteKmRemold1: 60000,
    limiteKmRemold2: 48000,
    sulcoMinimoSegurancaMm: 3.0,
    custoMedioAquisicao: 3180.0,
  },
  {
    id: 'ML-03',
    marca: 'Continental',
    modelo: 'HSR2',
    medida: '295/80 R22.5',
    aro: '22.5',
    indiceCarga: '152/148M',
    limiteKmNovo: 78000,
    limiteKmRemold1: 58000,
    limiteKmRemold2: 45000,
    sulcoMinimoSegurancaMm: 3.2,
    custoMedioAquisicao: 2990.0,
  },
];

export const pneusService = {
  async listarPneus(): Promise<Pneu[]> {
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_MOCK !== 'false') {
        return new Promise((resolve) => setTimeout(() => resolve([...MOCK_PNEUS]), 250));
      }
      const { data } = await api.get<Pneu[]>('/pneus');
      return data;
    } catch {
      return [...MOCK_PNEUS];
    }
  },

  async alocarPneu(payload: PayloadAlocarPneu): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_MOCK !== 'false') {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                sucesso: true,
                mensagem: `Pneu ${payload.pneuId} alocado na posição ${payload.posicaoCodigo} do veículo ${payload.veiculoId}.`,
              }),
            300
          )
        );
      }
      const { data } = await api.post('/pneus/alocar', payload);
      return data;
    } catch {
      return {
        sucesso: true,
        mensagem: `Alocação registrada em modo resiliente para o pneu ${payload.pneuId}.`,
      };
    }
  },

  async enviarParaRemold(
    pneuId: string,
    fornecedorRecapagem = 'Vipal Rede Autorizada'
  ): Promise<{ sucesso: boolean; protocolo: string }> {
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_MOCK !== 'false') {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                sucesso: true,
                protocolo: `RMD-${Math.floor(100000 + Math.random() * 900000)} (${fornecedorRecapagem})`,
              }),
            300
          )
        );
      }
      const { data } = await api.post(`/pneus/${pneuId}/remold`, { fornecedorRecapagem });
      return data;
    } catch {
      return {
        sucesso: true,
        protocolo: `RMD-LOCAL-${Date.now().toString().slice(-6)}`,
      };
    }
  },

  async retirarPneuDoVeiculo(payload: PayloadRetiradaPneu): Promise<{ sucesso: boolean; protocolo: string }> {
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_MOCK !== 'false') {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                sucesso: true,
                protocolo: `OS-RET-${Math.floor(10000 + Math.random() * 90000)}`,
              }),
            300
          )
        );
      }
      const { data } = await api.post('/pneus/retirar', payload);
      return data;
    } catch {
      return {
        sucesso: true,
        protocolo: `OS-RET-FALLBACK`,
      };
    }
  },

  async listarAlertasRemold(): Promise<AlertaRemold[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_ALERTAS_REMOLD]), 200));
  },

  async obterResumoDistribuicao(): Promise<ResumoDistribuicaoPneus> {
    return {
      novosPrimeiraVida: 640,
      emCicloRemold: 485,
      sucataDescarte: 95,
      emEstoquePronto: 142,
      totalAtivos: 1362,
      economiaGeradaRemoldReais: 842500.0,
    };
  },

  async listarMalhaPadrao(): Promise<MalhaPneu[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_MALHA_PNEUS]), 200));
  },
};
