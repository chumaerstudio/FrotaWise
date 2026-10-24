'use client';

import React, { useEffect, useState } from 'react';
import { Veiculo } from '@/types/frotawise';
import { veiculosService } from '@/services/veiculosService';
import { Button } from '@/components/ui';

export default function VeiculosFrotaPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);

  useEffect(() => {
    veiculosService.listarVeiculos().then((lista) => {
      setVeiculos(lista);
      if (lista.length > 0) setVeiculoSelecionado(lista[0]);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Gestão da Frota Pesada & Mapa Visual de Eixos no Caminhão
        </h1>
        <p className="text-sm text-slate-600">
          Inspeção visual das posições de rodagem (Direcional, Tração e Truck) e telemetria de odômetro por placa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Caminhões da Frota */}
        <div className="lg:col-span-5 space-y-4">
          {veiculos.map((v) => {
            const ativo = veiculoSelecionado?.id === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setVeiculoSelecionado(v)}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  ativo
                    ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-extrabold tracking-wider">
                    {v.placa}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{v.prefixoFrota}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{v.modeloCaminhao}</h3>
                <p className="text-xs text-slate-500">
                  Motorista: {v.motoristaAtual} • Base: {v.filialBase}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Odômetro: {v.odometroAtualKm.toLocaleString('pt-BR')} km
                  </span>
                  <span className="font-semibold text-blue-700">
                    {v.totalPosicoesPneus} posições de pneu →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visualizador de Chassi e Eixos do Caminhão */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          {veiculoSelecionado && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Diagrama de Eixos — {veiculoSelecionado.placa} ({veiculoSelecionado.modeloCaminhao})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configuração de Chassi: {veiculoSelecionado.tipoConfiguracao.replace(/_/g, ' ')}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Exportar Laudo de Eixos
                </Button>
              </div>

              {/* Representação Gráfica dos Eixos (1º Direcional, 2º Tração, 3º Apoio) */}
              <div className="bg-slate-900 text-white rounded-xl p-6 space-y-8">
                {/* Eixo 1 - Direcional */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 text-center">
                    1º Eixo — Direcional Dianteiro (Rodado Simples)
                  </div>
                  <div className="flex items-center justify-between max-w-md mx-auto">
                    <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-400 text-center w-36">
                      <div className="text-xs font-bold text-amber-300">Posição 1E</div>
                      <div className="text-xs font-extrabold mt-1">FW-2026-00142</div>
                      <div className="text-[11px] text-amber-200">Sulco: 3.2 mm (Alerta)</div>
                    </div>

                    <div className="flex-1 h-2 bg-slate-700 mx-3 rounded" />

                    <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-400 text-center w-36">
                      <div className="text-xs font-bold text-emerald-300">Posição 1D</div>
                      <div className="text-xs font-extrabold mt-1">FW-2026-00143</div>
                      <div className="text-[11px] text-emerald-200">Sulco: 9.8 mm (OK)</div>
                    </div>
                  </div>
                </div>

                {/* Eixo 2 - Tração Duplo */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 text-center">
                    2º Eixo — Tração Motriz (Rodado Duplo)
                  </div>
                  <div className="flex items-center justify-between max-w-xl mx-auto gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-center w-28">
                      <div className="text-[11px] font-bold text-blue-300">2EE (Ext)</div>
                      <div className="text-xs font-bold mt-0.5">FW-00210</div>
                      <div className="text-[10px] text-slate-300">8.4 mm</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-center w-28">
                      <div className="text-[11px] font-bold text-blue-300">2EI (Int)</div>
                      <div className="text-xs font-bold mt-0.5">FW-00211</div>
                      <div className="text-[10px] text-slate-300">8.1 mm</div>
                    </div>

                    <div className="flex-1 h-2 bg-slate-700 mx-2 rounded" />

                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-center w-28">
                      <div className="text-[11px] font-bold text-blue-300">2DI (Int)</div>
                      <div className="text-xs font-bold mt-0.5">FW-00212</div>
                      <div className="text-[10px] text-slate-300">8.5 mm</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-center w-28">
                      <div className="text-[11px] font-bold text-blue-300">2DE (Ext)</div>
                      <div className="text-xs font-bold mt-0.5">FW-00213</div>
                      <div className="text-[10px] text-slate-300">8.2 mm</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
