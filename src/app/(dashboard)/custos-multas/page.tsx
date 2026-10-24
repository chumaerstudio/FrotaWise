'use client';

import React, { useEffect, useState } from 'react';
import { HistoricoReparoKm, MultaTransito } from '@/types/frotawise';
import { veiculosService } from '@/services/veiculosService';

export default function CustosMultasPage() {
  const [multas, setMultas] = useState<MultaTransito[]>([]);
  const [reparos, setReparos] = useState<HistoricoReparoKm[]>([]);

  useEffect(() => {
    veiculosService.listarMultasFrota().then(setMultas);
    veiculosService.listarHistoricoReparosKm().then(setReparos);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Auditoria de Multas Rodoviárias & Histórico de Reparos por KM
        </h1>
        <p className="text-sm text-slate-600">
          Acompanhamento de autuações (PRF/ANTT/DNIT) e impacto financeiro de manutenções de pneus no CPK.
        </p>
      </div>

      {/* Seção 1: Multas da Frota */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Painel de Infrações e Multas Vinculadas à Frota
          </h3>
          <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Auditoria TWI & Pesagem Ativa
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <th className="py-3 px-4">Auto de Infração</th>
              <th className="py-3 px-4">Placa / Motorista</th>
              <th className="py-3 px-4">Órgão / Data</th>
              <th className="py-3 px-4">Descrição da Infração</th>
              <th className="py-3 px-4">Gravidade</th>
              <th className="py-3 px-4">Valor</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {multas.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900">{m.autoInfracao}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-blue-700">{m.veiculoPlaca}</div>
                  <div className="text-xs text-slate-500">{m.motoristaNome}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold">{m.orgaoAutuador}</div>
                  <div className="text-xs text-slate-500">{m.dataOcorrencia}</div>
                </td>
                <td className="py-3.5 px-4 max-w-md text-slate-700">{m.descricaoInfracao}</td>
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {m.gravidade} ({m.pontosCnh} pts)
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  R$ {m.valorOriginal.toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {m.statusPagamento.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seção 2: Histórico de Reparos por KM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Histórico de Reparos, Recapagens e Impacto no CPK (Custo por KM)
          </h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <th className="py-3 px-4">OS / Data</th>
              <th className="py-3 px-4">Veículo / Nº Fogo</th>
              <th className="py-3 px-4">Odômetro no Serviço</th>
              <th className="py-3 px-4">Tipo de Intervenção</th>
              <th className="py-3 px-4">Oficina / Recapadora</th>
              <th className="py-3 px-4">Custo Total</th>
              <th className="py-3 px-4">Impacto CPK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {reparos.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{r.id}</div>
                  <div className="text-xs text-slate-500">{r.dataServico}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{r.veiculoPlaca}</div>
                  <div className="text-xs text-slate-500">Fogo: {r.numeroFogoPneu}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold">
                  {r.odometroNoMomentoKm.toLocaleString('pt-BR')} km
                </td>
                <td className="py-3.5 px-4 font-bold text-blue-700">
                  {r.tipoManutencao.replace(/_/g, ' ')}
                </td>
                <td className="py-3.5 px-4 text-slate-700">{r.fornecedorOficina}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  R$ {r.custoTotal.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                  R$ {r.custoPorKmImpacto.toFixed(4)} / km
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
