import type {
  Abastecimento,
  Manutencao,
  Multa,
  Pneu,
  Veiculo,
} from '@/types/frotawise';
import type {
  AbastecimentoApiDTO,
  ManutencaoApiDTO,
  MultaApiDTO,
  PneuApiDTO,
  VeiculoApiDTO,
} from '@/types/domain';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function assertValidIsoDate(dateStr: string, fieldName = 'data'): string {
  const normalized = dateStr.slice(0, 10);
  if (!ISO_DATE_REGEX.test(normalized)) {
    throw new Error(
      '[Contract Violation] Campo "' +
        fieldName +
        '" deve estar em formato ISO YYYY-MM-DD. Recebido: "' +
        dateStr +
        '".'
    );
  }
  return normalized;
}

export function parseDecimalToNumber(
  decimalValue: string | number,
  fieldName: string
): number {
  const parsed =
    typeof decimalValue === 'number' ? decimalValue : Number(decimalValue);
  if (!Number.isFinite(parsed)) {
    throw new Error(
      '[Contract Violation] Valor monetário/decimal inválido no campo "' +
        fieldName +
        '": "' +
        String(decimalValue) +
        '".'
    );
  }
  return parsed;
}

export function toDecimalString(value: number, scale = 2): string {
  if (!Number.isFinite(value)) {
    throw new Error('[Mapper] Número inválido para conversão Decimal: ' + String(value));
  }
  return value.toFixed(scale);
}

export function mapPneuDtoToViewModel(dto: PneuApiDTO): Pneu {
  return {
    id: dto.id,
    fogo: dto.fogo,
    marca: dto.marca,
    medida: dto.medida,
    sulcoMm: dto.sulcoMm,
    recapagens: dto.recapagens,
    kmTotal: dto.kmTotal,
    classificacao: dto.classificacao,
    veiculoAtualId: dto.veiculoAtualId ?? '',
    posicaoAtual: dto.posicaoAtual ?? '',
    localEstoque: dto.localEstoque,
    tipoBanda: dto.tipoBanda ?? undefined,
    historicoVeiculos: [],
    reformas: [],
  };
}

export function mapPneuViewModelToDto(pneu: Pneu): PneuApiDTO {
  return {
    id: pneu.id,
    fogo: pneu.fogo,
    marca: pneu.marca,
    medida: pneu.medida,
    sulcoMm: pneu.sulcoMm,
    recapagens: pneu.recapagens,
    kmTotal: pneu.kmTotal,
    classificacao: pneu.classificacao,
    veiculoAtualId: pneu.veiculoAtualId.trim() !== '' ? pneu.veiculoAtualId : null,
    posicaoAtual: pneu.posicaoAtual.trim() !== '' ? pneu.posicaoAtual : null,
    localEstoque: pneu.localEstoque,
    tipoBanda: pneu.tipoBanda?.trim() ? pneu.tipoBanda : null,
  };
}

export function mapVeiculoDtoToViewModel(dto: VeiculoApiDTO): Veiculo {
  return {
    id: dto.id,
    placa: dto.placa,
    uf: dto.uf,
    modelo: dto.modelo,
    categoria: dto.categoria,
    eixos: dto.eixos,
    kmAtual: dto.kmAtual,
    kmBase: dto.kmBase ?? null,
    status: dto.status,
  };
}

export function mapAbastecimentoDtoToViewModel(
  dto: AbastecimentoApiDTO
): Abastecimento {
  if (!['Diesel', 'Gasolina', 'Arla'].includes(dto.tipo)) {
    throw new Error('[Contract Violation] TipoCombustivel desconhecido: ' + dto.tipo);
  }
  return {
    id: dto.id,
    veiculoId: dto.veiculoId,
    tipo: dto.tipo,
    data: assertValidIsoDate(dto.data, 'abastecimento.data'),
    litros: dto.litros,
    valorUnit: parseDecimalToNumber(dto.valorUnit, 'abastecimento.valorUnit'),
    valorTotal: parseDecimalToNumber(dto.valorTotal, 'abastecimento.valorTotal'),
    km: dto.km,
    fornecedor: dto.fornecedor,
  };
}

export function mapManutencaoDtoToViewModel(dto: ManutencaoApiDTO): Manutencao {
  return {
    id: dto.id,
    osNumero: dto.osNumero,
    veiculoId: dto.veiculoId,
    tipo: dto.tipo,
    categoria: dto.categoria ?? undefined,
    peca: dto.peca ?? undefined,
    km: dto.km ?? undefined,
    descricao: dto.descricao,
    fornecedor: dto.fornecedor,
    data: assertValidIsoDate(dto.data, 'manutencao.data'),
    valor: parseDecimalToNumber(dto.valor, 'manutencao.valor'),
  };
}

export function mapMultaDtoToViewModel(dto: MultaApiDTO): Multa {
  return {
    id: dto.id,
    ait: dto.ait,
    veiculoId: dto.veiculoId,
    motivo: dto.motivo,
    identificado: dto.identificado,
    motorista: dto.motorista,
    status: dto.status,
    data: assertValidIsoDate(dto.data, 'multa.data'),
    pontos: dto.pontos,
    valorOriginal:
      dto.valorOriginal !== null
        ? parseDecimalToNumber(dto.valorOriginal, 'multa.valorOriginal')
        : undefined,
    valorNIC:
      dto.valorNIC !== null
        ? parseDecimalToNumber(dto.valorNIC, 'multa.valorNIC')
        : undefined,
    valor: parseDecimalToNumber(dto.valor, 'multa.valor'),
  };
}
