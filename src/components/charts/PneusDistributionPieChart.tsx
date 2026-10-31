'use client';

import React from 'react';
import { ResumoDistribuicaoPneus } from '@/types/frotawise';

interface PneusDistributionPieChartProps {
  dados: ResumoDistribuicaoPneus;
}

export const PneusDistributionPieChart: React.FC<PneusDistributionPieChartProps> = ({ dados }) => {
  const totalCiclo =
    dados.novosPrimeiraVida + dados.emCicloRemold + dados.sucataDescarte + dados.emEstoquePronto;

  const pctNovos = Math.round((dados.novosPrimeiraVida / totalCiclo) * 100);
  const pctRemold = Math.round((dados.emCicloRemold / totalCiclo) * 100);
  const pctEstoque = Math.round((dados.emEstoquePronto / totalCiclo) * 100);
  const pctSucata = Math.max(0, 100 - pctNovos - pctRemold - pctEstoque);

  // Cálculo dos ângulos para o gráfico circular (SVG/Conic Gradient)
  const stop1 = pctNovos;
  const stop2 = stop1 + pctRemold;
  const stop3 = stop2 + pctEstoque;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Distribuição Global da Malha de Pneus
          </h3>
          <p className="text-xs text-slate-500">
            Proporção entre Pneus Novos (1ª Vida), Recapados (Remold), Estoque e Sucata
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Economia Remold: R$ {dados.economiaGeradaRemoldReais.toLocaleString('pt-BR')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Gráfico de Pizza Circular */}
        <div className="flex justify-center">
          <div
            className="relative w-48 h-48 rounded-full flex items-center justify-center shadow-inner"
            style={{
              background: `conic-gradient(
                #2563eb 0% ${stop1}%,
                #d97706 ${stop1}% ${stop2}%,
                #10b981 ${stop2}% ${stop3}%,
                #64748b ${stop3}% 100%
              )`,
            }}
          >
            <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
              <span className="text-2xl font-extrabold text-slate-900">{dados.totalAtivos}</span>
              <span className="text-[11px] font-semibold uppercase text-slate-500">
                Pneus Ativos
              </span>
            </div>
          </div>
        </div>

        {/* Legenda Analítica */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-blue-600 inline-block" />
              <span className="text-sm font-medium text-slate-700">Novos (1ª Vida)</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">{dados.novosPrimeiraVida} un.</span>
              <span className="text-xs text-slate-500 ml-1.5">({pctNovos}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-amber-600 inline-block" />
              <span className="text-sm font-medium text-slate-700">Em Ciclo Remold (1º/2º)</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">{dados.emCicloRemold} un.</span>
              <span className="text-xs text-slate-500 ml-1.5">({pctRemold}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-emerald-500 inline-block" />
              <span className="text-sm font-medium text-slate-700">Estoque Pronto Uso</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">{dados.emEstoquePronto} un.</span>
              <span className="text-xs text-slate-500 ml-1.5">({pctEstoque}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-slate-500 inline-block" />
              <span className="text-sm font-medium text-slate-700">Sucata / Descarte Auditado</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">{dados.sucataDescarte} un.</span>
              <span className="text-xs text-slate-500 ml-1.5">({pctSucata}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
