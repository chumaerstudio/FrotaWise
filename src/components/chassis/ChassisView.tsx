'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getChassisAsset } from '@/services/chassisAssets';
import type { ChassisSlot, VehicleChassisLayout } from '@/services/veiculosService';

/** Dimensões de um pneu sobre a imagem (px da imagem): comprimento × largura. */
const TIRE_W = 155;
const TIRE_H = 57;
/** Linhas (y na imagem) dos pneus: lado direito do veículo no topo, esquerdo embaixo. */
const ROW = { topOuter: 27, topInner: 85, botInner: 301, botOuter: 360 };
const PAD_TOP = 24;
const PAD_BOTTOM = 14;
const SPARE_AREA = 175;

interface Props {
  layout: VehicleChassisLayout;
  eixos: number;
  /** Desenha o pneu montado ou a vaga da posição (o pai controla arrastar/soltar/seleção). */
  renderSlot: (slot: ChassisSlot) => React.ReactNode;
}

/**
 * Chassi realista em vista superior (frente à esquerda). Os pneus são desenhados por cima da
 * imagem e herdam a cor do status de recapagem (Novo, 1ª, 2ª, 3ª, Mais Recapagens).
 */
export function ChassisView({ layout, eixos, renderSlot }: Props) {
  const asset = getChassisAsset(eixos);
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

  const stageW = asset.width + SPARE_AREA;
  const stageH = asset.height + PAD_TOP + PAD_BOTTOM;
  // Ajusta à largura disponível (entre 55% e 90% do tamanho da imagem).
  const scale = boxW ? Math.max(0.55, Math.min(0.9, (boxW - 8) / stageW)) : 0.7;

  const cell = (slot: ChassisSlot, left: number, top: number) => (
    <div
      key={slot.code}
      className="cwrap"
      style={{ left, top: top + PAD_TOP, width: TIRE_W, height: TIRE_H }}
    >
      {renderSlot(slot)}
    </div>
  );

  return (
    <div ref={boxRef} className="w-full overflow-x-auto">
      <div style={{ width: stageW * scale, height: stageH * scale, margin: '0 auto' }}>
        <div
          className="cstage"
          style={{ width: stageW, height: stageH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.src}
            alt={`Chassi de ${eixos} eixos em vista superior`}
            width={asset.width}
            height={asset.height}
            draggable={false}
            style={{ position: 'absolute', left: 0, top: PAD_TOP, userSelect: 'none' }}
          />
          <span className="clabel" style={{ left: 6, top: 2 }}>◀ FRENTE</span>

          {layout.axles.map((ax, i) => {
            const cx = asset.axles[i];
            const left = cx - TIRE_W / 2;
            // Veículo com a frente à esquerda: lado direito = topo, lado esquerdo = embaixo.
            const right = [...ax.rightSlots].reverse(); // [externo, interno]
            const leftSide = ax.leftSlots; // [externo, interno]
            const topRows = ax.single ? [ROW.topOuter] : [ROW.topOuter, ROW.topInner];
            const botRows = ax.single ? [ROW.botOuter] : [ROW.botInner, ROW.botOuter];
            const botSlots = ax.single ? leftSide : [...leftSide].reverse(); // [interno, externo]
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
        </div>
      </div>
    </div>
  );
}
