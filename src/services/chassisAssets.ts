/**
 * Imagens do chassi (vista superior, sem pneus) geradas a partir da foto de referência.
 * Medidas em pixels da imagem entregue; `axles` = centro X de cada eixo, do 1º (frente, esquerda) ao último.
 * Os pneus coloridos são desenhados por cima pelo componente ChassisView.
 */
export interface ChassisAsset {
  src: string;
  width: number;
  height: number;
  axles: number[];
}

export const CHASSIS_ASSETS: Record<number, ChassisAsset> = {
  2: { src: '/chassi/chassi-2-eixos.webp', width: 845, height: 443, axles: [194, 687] },
  3: { src: '/chassi/chassi-3-eixos.webp', width: 1015, height: 443, axles: [194, 687, 857] },
  4: { src: '/chassi/chassi-4-eixos.webp', width: 1185, height: 443, axles: [194, 364, 857, 1027] },
  5: { src: '/chassi/chassi-5-eixos.webp', width: 1355, height: 443, axles: [194, 364, 857, 1027, 1197] },
  6: { src: '/chassi/chassi-6-eixos.webp', width: 1525, height: 443, axles: [194, 364, 534, 1027, 1197, 1367] },
};

export const getChassisAsset = (eixos: number): ChassisAsset =>
  CHASSIS_ASSETS[Math.max(2, Math.min(6, Math.trunc(Number(eixos) || 3)))];
