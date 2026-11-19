/**
 * Imagens dos chassis em vista superior.
 * Os pneus são desenhados pelo componente ChassisView para manter as posições dinâmicas.
 */
export interface ChassisAsset {
  src: string;
  width: number;
  height: number;
  /** Centro X de cada eixo, do primeiro ao último. */
  axles: number[];
  kind?: 'carreta';
}

export const CHASSIS_ASSETS: Record<number, ChassisAsset> = {
  2: { src: '/chassi/chassi-2-eixos.webp', width: 845, height: 443, axles: [194, 687] },
  3: { src: '/chassi/chassi-3-eixos.webp', width: 1015, height: 443, axles: [194, 687, 857] },
  4: { src: '/chassi/chassi-4-eixos.webp', width: 1185, height: 443, axles: [194, 364, 857, 1027] },
  5: { src: '/chassi/chassi-5-eixos.webp', width: 1355, height: 443, axles: [194, 364, 857, 1027, 1197] },
  6: { src: '/chassi/chassi-6-eixos.webp', width: 1525, height: 443, axles: [194, 364, 534, 1027, 1197, 1367] },
};

const CARRETA_CHASSIS_BASE = {
  src: '/chassi/chassi-carreta.webp',
  width: 1852,
  height: 609,
  kind: 'carreta' as const,
};

/** Aceita a grafia atual e a forma plural legada já usada em cadastros anteriores. */
export const isCarretaCategory = (categoria?: string | null): boolean =>
  ['CARRETA', 'CARRETAS'].includes(String(categoria || '').trim().toLocaleUpperCase('pt-BR'));

const normalizeAxles = (eixos: number): number =>
  Math.max(2, Math.min(6, Math.trunc(Number(eixos) || 3)));

/**
 * A carreta usa o desenho específico enviado como referência. Os centros dos eixos são
 * distribuídos da traseira para a frente, preservando a quantidade configurada (2 a 6).
 */
export const getChassisAsset = (eixos: number, categoria?: string | null): ChassisAsset => {
  const axleCount = normalizeAxles(eixos);

  if (isCarretaCategory(categoria)) {
    const lastAxleCenter = 1693;
    const axleSpacing = 165;
    const axles = Array.from(
      { length: axleCount },
      (_, index) => lastAxleCenter - (axleCount - index - 1) * axleSpacing
    );
    return { ...CARRETA_CHASSIS_BASE, axles };
  }

  return CHASSIS_ASSETS[axleCount];
};
