import type {
  Abastecimento,
  AlertaPreventivaItem,
  KmAtualLancado,
  Manutencao,
  Pneu,
  RegraManutencaoPreventiva,
  Veiculo,
} from '@/types/frotawise';
import type { VeiculoApiDTO } from '@/types/domain';
import { httpClient } from '@/lib/http/client';
import { normalizeApiError } from '@/lib/errors';
import { mapVeiculoDtoToViewModel } from '@/lib/mappers';

export function getVehicleChassisSlots(eixos: number): string[] {
  const safeAxles = Math.min(6, Math.max(2, Math.trunc(eixos || 2)));
  const slots: string[] = ['E1-ESQ', 'E1-DIR'];

  for (let i = 2; i <= safeAxles; i++) {
    slots.push(
      'E' + i + '-EE',
      'E' + i + '-EI',
      'E' + i + '-DI',
      'E' + i + '-DE'
    );
  }

  slots.push('ESTEPE-1');
  return slots;
}

export function findOrphanedTiresOnAxleChange(
  veiculoId: string,
  novosEixos: number,
  tires: Pneu[]
): Pneu[] {
  const validSlots = new Set(getVehicleChassisSlots(novosEixos));
  return tires.filter(
    (t) =>
      t.veiculoAtualId === veiculoId &&
      Boolean(t.posicaoAtual) &&
      !validSlots.has(t.posicaoAtual)
  );
}

export function matchesPreventiveRule(
  veiculo: Veiculo,
  regra: RegraManutencaoPreventiva,
  manutencao?: Manutencao
): boolean {
  const catMatch =
    veiculo.categoria.trim().toUpperCase() ===
    regra.categoria.trim().toUpperCase();
  const modelMatch =
    !regra.modelo.trim() ||
    veiculo.modelo.trim().toUpperCase() === regra.modelo.trim().toUpperCase();

  if (!catMatch || !modelMatch) return false;
  if (!manutencao) return true;

  const pecaRegra = regra.peca.trim().toUpperCase();
  const pecaManut = (manutencao.peca ?? '').trim().toUpperCase();
  return pecaManut === pecaRegra;
}

export function computePreventiveAlertsPreview(
  vehicles: Veiculo[],
  rules: RegraManutencaoPreventiva[],
  maintenances: Manutencao[],
  avisoProximidadeKm = 500
): AlertaPreventivaItem[] {
  const items: AlertaPreventivaItem[] = [];

  for (const v of vehicles) {
    for (const r of rules) {
      if (!matchesPreventiveRule(v, r)) continue;

      const historicoCompativel = maintenances
        .filter(
          (m) => m.veiculoId === v.id && matchesPreventiveRule(v, r, m)
        )
        .sort((a, b) => (b.km ?? 0) - (a.km ?? 0));

      const ultimo = historicoCompativel[0] ?? null;
      const atual: KmAtualLancado = {
        km: v.kmAtual,
        data: new Date().toISOString().slice(0, 10),
        origem: 'operacao',
      };

      if (!ultimo || ultimo.km === undefined) {
        const marcoInicial = v.kmBase ?? 0;
        const proximo = marcoInicial + r.km;
        const restante = proximo - v.kmAtual;
        items.push({
          v,
          r,
          ultimo: null,
          proximo,
          restante,
          atual,
          status:
            restante <= 0
              ? 'vencida'
              : restante <= avisoProximidadeKm
                ? 'proxima'
                : 'sem',
        });
        continue;
      }

      const proximo = ultimo.km + r.km;
      const restante = proximo - v.kmAtual;
      const status =
        restante <= 0
          ? 'vencida'
          : restante <= avisoProximidadeKm
            ? 'proxima'
            : 'ok';

      items.push({
        v,
        r,
        ultimo,
        proximo,
        restante,
        atual,
        status,
      });
    }
  }

  return items;
}

export function computeFuelMedias(
  fuelings: Abastecimento[]
): Record<string, number | null> {
  const medias: Record<string, number | null> = {};
  const porVeiculo = new Map<string, Abastecimento[]>();

  for (const f of fuelings) {
    if (f.tipo === 'Arla') {
      medias[f.id] = null;
      continue;
    }
    const lista = porVeiculo.get(f.veiculoId) ?? [];
    lista.push(f);
    porVeiculo.set(f.veiculoId, lista);
  }

  for (const [, lista] of porVeiculo.entries()) {
    const ordenados = [...lista].sort((a, b) => a.km - b.km);
    for (let i = 0; i < ordenados.length; i++) {
      const atual = ordenados[i];
      if (i === 0 || atual.litros <= 0) {
        medias[atual.id] = null;
        continue;
      }
      const anterior = ordenados[i - 1];
      const deltaKm = atual.km - anterior.km;
      medias[atual.id] =
        deltaKm > 0 ? Number((deltaKm / atual.litros).toFixed(2)) : null;
    }
  }

  return medias;
}

export const veiculosService = {
  async list(): Promise<Veiculo[]> {
    try {
      const response = await httpClient.get<VeiculoApiDTO[]>('/veiculos');
      return response.data.map(mapVeiculoDtoToViewModel);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(payload: Omit<Veiculo, 'id'>): Promise<Veiculo> {
    if (payload.eixos < 2 || payload.eixos > 6) {
      throw new Error(
        'A configuração homologada no Snapshot 3.5.0 suporta de 2 a 6 eixos.'
      );
    }
    try {
      const response = await httpClient.post<VeiculoApiDTO>(
        '/veiculos',
        payload
      );
      return mapVeiculoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    id: string,
    payload: Partial<Omit<Veiculo, 'id'>>,
    mountedTires: Pneu[] = []
  ): Promise<Veiculo> {
    if (payload.eixos !== undefined) {
      const orfaos = findOrphanedTiresOnAxleChange(
        id,
        payload.eixos,
        mountedTires
      );
      if (orfaos.length > 0) {
        throw new Error(
          'Não é possível reduzir para ' +
            payload.eixos +
            ' eixos: há ' +
            orfaos.length +
            ' pneu(s) montado(s) em posições que deixariam de existir (' +
            orfaos.map((p) => p.posicaoAtual).join(', ') +
            '). Retire ou remaneje os pneus antes.'
        );
      }
    }

    try {
      const response = await httpClient.patch<VeiculoApiDTO>(
        '/veiculos/' + encodeURIComponent(id),
        payload
      );
      return mapVeiculoDtoToViewModel(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
