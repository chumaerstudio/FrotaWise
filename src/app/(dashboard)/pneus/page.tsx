'use client';

import React, { useState } from 'react';
import { useEstoquePneus } from '@/hooks/useEstoquePneus';
import { Pneu, PayloadRetiradaPneu } from '@/types/frotawise';
import { AlertBadge, Button, InputField } from '@/components/ui';
import { RetiradaPneuModal } from '@/components/forms/RetiradaPneuModal';
import { pneusService } from '@/services/pneusService';

export default function EstoquePneusPage() {
  const {
    pneus,
    carregando,
    filtroStatus,
    setFiltroStatus,
    termoBusca,
    setTermoBusca,
    mensagemOperacao,
    dispararRemold,
    alocarEmVeiculo,
  } = useEstoquePneus();

  const [pneuParaRetirada, setPneuParaRetirada] = useState<Pneu | null>(null);

  const handleConfirmarRetirada = async (payload: PayloadRetiradaPneu) => {
    await pneusService.retirarPneuDoVeiculo(payload);
    if (payload.motivo === 'ENVIO_REMOLD') {
      await dispararRemold(payload.pneuId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Estoque Central de Pneus & Ciclo de Recapagem
          </h1>
          <p className="text-sm text-slate-600">
            Controle individual por Número de Fogo, alocação rápida em caminhões e despacho para Remold.
          </p>
        </div>
      </div>

      {mensagemOperacao && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm font-semibold">
          {mensagemOperacao}
        </div>
      )}

      {/* Barra de Filtros Corporativos */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="w-full md:w-96">
          <InputField
            label="Buscar por Nº de Fogo, Marca ou Placa"
            placeholder="Ex: FW-2026-00142 ou RXK-4F92..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['TODOS', 'EM_USO', 'ESTOQUE', 'EM_REMOLD', 'SUCATA'] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filtroStatus === status ? 'primary' : 'outline'}
              onClick={() => setFiltroStatus(status)}
            >
              {status.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabela de Pneus */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Nº de Fogo / DOT</th>
                <th className="py-3.5 px-4">Marca & Medida</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Etapa de Vida</th>
                <th className="py-3.5 px-4">KM Etapa / Limite</th>
                <th className="py-3.5 px-4">Sulco / Pressão</th>
                <th className="py-3.5 px-4">Alocação Atual</th>
                <th className="py-3.5 px-4 text-right">Ações Operacionais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {carregando ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Carregando inventário corporativo de pneus...
                  </td>
                </tr>
              ) : (
                pneus.map((pneu) => {
                  const pctUso = Math.min(
                    100,
                    Math.round((pneu.kmEtapaAtual / pneu.limiteKmEtapaAtual) * 100)
                  );
                  return (
                    <tr key={pneu.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{pneu.numeroFogo}</div>
                        <div className="text-xs text-slate-500">DOT: {pneu.dot}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {pneu.marca} {pneu.modelo}
                        </div>
                        <div className="text-xs text-slate-500">{pneu.medida}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <AlertBadge statusPneu={pneu.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-800">
                          {pneu.etapaVida.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-bold text-slate-900">
                          {pneu.kmEtapaAtual.toLocaleString('pt-BR')} /{' '}
                          {pneu.limiteKmEtapaAtual.toLocaleString('pt-BR')} km ({pctUso}%)
                        </div>
                        <div className="w-36 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              pctUso >= 90 ? 'bg-red-600' : pctUso >= 75 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${pctUso}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{pneu.sulcoAtualMm} mm</div>
                        <div className="text-xs text-slate-500">{pneu.pressaoAtualPsi} PSI</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {pneu.veiculoPlaca ? (
                          <div>
                            <span className="font-bold text-blue-700">{pneu.veiculoPlaca}</span>
                            <span className="block text-xs text-slate-500">
                              Eixo/Posição: {pneu.posicaoEixo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Não alocado</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {pneu.status === 'ESTOQUE' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => alocarEmVeiculo(pneu.id, 'RXK-4F92', '2EE')}
                          >
                            Alocar em Veículo
                          </Button>
                        )}
                        {pneu.status === 'EM_USO' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPneuParaRetirada(pneu)}
                          >
                            Retirar do Veículo
                          </Button>
                        )}
                        {pneu.status !== 'EM_REMOLD' && pneu.status !== 'SUCATA' && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => dispararRemold(pneu.id)}
                          >
                            Remoldar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RetiradaPneuModal
        aberto={Boolean(pneuParaRetirada)}
        pneuSelecionado={pneuParaRetirada}
        aoFechar={() => setPneuParaRetirada(null)}
        aoConfirmarRetirada={handleConfirmarRetirada}
      />
    </div>
  );
}
