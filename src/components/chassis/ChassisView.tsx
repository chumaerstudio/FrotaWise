'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getChassisAsset } from '@/services/chassisAssets';
import type { ChassisSlot, VehicleChassisLayout } from '@/services/veiculosService';

/** Dimensões dos pneus sobre os chassis convencionais (px da imagem). */
const TIRE_W = 155;
const TIRE_H = 57;
/** Linhas (y na imagem) dos pneus: lado direito no topo, esquerdo embaixo. */
const ROW = { topOuter: 27, topInner: 85, botInner: 301, botOuter: 360 };
const PAD_TOP = 24;
const PAD_BOTTOM = 14;
const SPARE_AREA = 175;

/**
 * Na carreta, assim como nos cavalos, os pneus duplos de cada lado do eixo
 * ficam empilhados verticalmente. As duas posições de cada lado compartilham
 * o mesmo alinhamento X; somente o Y muda.
 */
const CARRETA_TOP_ROWS = [143, 204] as const;
const CARRETA_BOTTOM_ROWS = [389, 450] as const;
const CARRETA_SPARE = { left: 500, top: 265, width: 110, height: 76 };

interface Props {
  layout: VehicleChassisLayout;
  eixos: number;
  categoria?: string;
  zoomed?: boolean;
  /** Desenha o pneu montado ou a vaga da posição (o pai controla arrastar/soltar/seleção). */
  renderSlot: (slot: ChassisSlot) => React.ReactNode;
}

/**
 * Desenha o chassi adequado à categoria do veículo.
 * A quantidade e a identificação dos pneus continuam vindo do mesmo layout por eixo.
 */
export function ChassisView({ layout, eixos, categoria, renderSlot, zoomed = false }: Props) {
  const asset = getChassisAsset(eixos, categoria);
  const isCarreta = asset.kind === 'carreta';
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setBoxW(el.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stageW = asset.width + (isCarreta ? 0 : SPARE_AREA);
  const stageH = asset.height + PAD_TOP + PAD_BOTTOM;
  // Por padrão, mostra o chassi inteiro; a opção Ampliar aumenta a representação.
  const fittedScale = boxW ? Math.min(0.9, (boxW - 8) / stageW) : 0.7;
  const scale = zoomed ? Math.max(0.58, fittedScale) : Math.max(0.19, fittedScale);

  const cell = (
    slot: ChassisSlot,
    left: number,
    top: number,
    width = TIRE_W,
    height = TIRE_H
  ) => (
    <div
      key={slot.code}
      className="cwrap"
      style={{ left, top: top + PAD_TOP, width, height }}
    >
      {renderSlot(slot)}
    </div>
  );

  const renderCarreta = () => (
    <>
      {layout.axles.map((ax, index) => {
        const cx = asset.axles[index];
        // Mesma organização dos chassis convencionais: pneus de cada lado
        // ficam na mesma coluna e são empilhados de cima para baixo.
        const topSlots = ax.single ? ax.rightSlots : [...ax.rightSlots].reverse();
        const bottomSlots = ax.single ? ax.leftSlots : [...ax.leftSlots].reverse();
        const tireLeft = cx - TIRE_W / 2;

        return (
          <React.Fragment key={ax.axleNumber}>
            <span
              className="clabel"
              style={{ left: cx - 34, width: 68, textAlign: 'center', top: 130 }}
            >
              {ax.axleNumber}º eixo
            </span>
            {topSlots.map((slot, slotIndex) =>
              cell(slot, tireLeft, CARRETA_TOP_ROWS[slotIndex], TIRE_W, TIRE_H)
            )}
            {bottomSlots.map((slot, slotIndex) =>
              cell(slot, tireLeft, CARRETA_BOTTOM_ROWS[slotIndex], TIRE_W, TIRE_H)
            )}
          </React.Fragment>
        );
      })}
      <span className="clabel" style={{ left: CARRETA_SPARE.left, top: CARRETA_SPARE.top - 22 }}>
        Estepe
      </span>
      {cell(
        layout.spareSlot,
        CARRETA_SPARE.left,
        CARRETA_SPARE.top,
        CARRETA_SPARE.width,
        CARRETA_SPARE.height
      )}
    </>
  );

  const renderStandard = () => (
    <>
      <span className="clabel" style={{ left: 6, top: 2 }}>◀ FRENTE</span>
      {layout.axles.map((ax, i) => {
        const cx = asset.axles[i];
        const left = cx - TIRE_W / 2;
        // Veículo convencional com a frente à esquerda: lado direito = topo, esquerdo = embaixo.
        const right = [...ax.rightSlots].reverse();
        const leftSide = ax.leftSlots;
        const topRows = ax.single ? [ROW.topOuter] : [ROW.topOuter, ROW.topInner];
        const botRows = ax.single ? [ROW.botOuter] : [ROW.botInner, ROW.botOuter];
        const botSlots = ax.single ? leftSide : [...leftSide].reverse();
        return (
          <React.Fragment key={ax.axleNumber}>
            <span className="clabel" style={{ left: cx - 30, width: 60, textAlign: 'center', top: 2 }}>
              {ax.axleNumber}º eixo
            </span>
            {right.map((slot, k) => cell(slot, left, topRows[k]))}
            {botSlots.map((slot, k) => cell(slot, left, botRows[k]))}
          </React.Fragment>
        );
      })}
      <span className="clabel" style={{ left: asset.width + 8, top: 2 }}>Estepe</span>
      {cell(layout.spareSlot, asset.width + 8, asset.height / 2 - TIRE_H / 2)}
    </>
  );

  return (
    <div ref={boxRef} className="w-full overflow-x-auto">
      <div style={{ width: stageW * scale, height: stageH * scale, margin: '0 auto' }}>
        <div
          className={`cstage${isCarreta ? ' cstage-carreta' : ''}`}
          style={{ width: stageW, height: stageH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.src}
            alt={isCarreta ? `Chassi de carreta com ${eixos} eixos em vista superior` : `Chassi de ${eixos} eixos em vista superior`}
            width={asset.width}
            height={asset.height}
            draggable={false}
            style={{ position: 'absolute', left: 0, top: PAD_TOP, userSelect: 'none' }}
          />
          {isCarreta ? renderCarreta() : renderStandard()}
        </div>
      </div>
    </div>
  );
}
