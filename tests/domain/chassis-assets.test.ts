import { describe, expect, it } from 'vitest';
import { getChassisAsset, isCarretaCategory } from '@/services/chassisAssets';

describe('representação do chassi conforme categoria', () => {
  it('identifica a categoria Carreta sem diferenciar maiúsculas/minúsculas', () => {
    expect(isCarretaCategory('Carreta')).toBe(true);
    expect(isCarretaCategory(' CARRETA ')).toBe(true);
    // Compatibilidade com cadastros criados quando o formulário oferecia CARRETAS.
    expect(isCarretaCategory('CARRETAS')).toBe(true);
  });

  it('usa a imagem específica da carreta e mantém a quantidade de eixos cadastrada', () => {
    const asset = getChassisAsset(3, 'Carreta');
    expect(asset.src).toBe('/chassi/chassi-carreta.webp');
    expect(asset.kind).toBe('carreta');
    expect(asset.axles).toEqual([1363, 1528, 1693]);

    expect(getChassisAsset(6, 'Carreta').axles).toHaveLength(6);
    expect(getChassisAsset(2, 'Carreta').axles).toHaveLength(2);
  });

  it('mantém a representação convencional para as demais categorias', () => {
    expect(getChassisAsset(3, 'Cavalo Mecânico').src).toBe('/chassi/chassi-3-eixos.webp');
    expect(getChassisAsset(4, 'Bitruck').src).toBe('/chassi/chassi-4-eixos.webp');
  });
});
