import { useMemo } from 'react';
import type { Pneu, ClassificacaoPneu } from '@/types/frotawise';
import { useFrotaWiseStore } from '@/hooks/useFrotaWiseStore';

/**
 * @deprecated Hook legado do Snapshot 3.5.0 mantido com adaptador tipado
 * para evitar quebra de importações. Use diretamente os seletores de pneus.
 */
export function useEstoquePneus() {
  const { tires, vehicles } = useFrotaWiseStore();

  const pneusNormalizados = useMemo(() => {
    const placaPorVeiculoId = new Map<string, string>(
      vehicles.map((v) => [v.id, v.placa])
    );

    return tires.map((pneu: Pneu) => ({
      ...pneu,
      numeroFogo: pneu.fogo,
      status: pneu.classificacao as ClassificacaoPneu,
      veiculoPlaca: pneu.veiculoAtualId
        ? placaPorVeiculoId.get(pneu.veiculoAtualId) ?? null
        : null,
    }));
  }, [tires, vehicles]);

  const pneusEmEstoque = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Estocar'),
    [pneusNormalizados]
  );

  const pneusRodando = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Rodando'),
    [pneusNormalizados]
  );

  const pneusEmReforma = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Recapar'),
    [pneusNormalizados]
  );

  const pneusSucata = useMemo(
    () => pneusNormalizados.filter((p) => p.classificacao === 'Sucatear'),
    [pneusNormalizados]
  );

  return {
    pneus: pneusNormalizados,
    pneusEmEstoque,
    pneusRodando,
    pneusEmReforma,
    pneusSucata,
  };
}
