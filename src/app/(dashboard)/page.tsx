'use client';

import React, { useEffect, useState } from 'react';
import { AlertaRemold, ResumoDistribuicaoPneus } from '@/types/frotawise';
import { pneusService } from '@/services/pneusService';
import { PneusDistributionPieChart } from '@/components/charts/PneusDistributionPieChart';
import { AlertBadge, Button } from '@/components/ui';

export default function DashboardHomePage() {
  const [resumo, setResumo] = useState<ResumoDistribuicaoPneus | null>(null);
  const [alertas, setAlertas] = useState<AlertaRemold[]>([]);
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);

  useEffect(() => {
    pneusService.obterResumoDistribuicao().then(setResumo);
    pneusService.listarAlertasRemold().then(setAlertas);
  }, []);

  const handleAprovarRemold = async (alerta: AlertaRemold) => {
    const resp = await pneusService.enviarParaRemold(alerta.pneuId);
    if (resp.sucesso) {
      setProtocoloGerado(
        `Ordem de retirada para Remold disparada para o pneu ${alerta.numeroFogo} (${alerta.veiculoPlaca}). Protocolo: ${resp.protocolo}`
      );
      setAlertas((prev) => prev.filter((item) => item.id !== alerta.id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho Executivo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Painel Executivo de Pneus e Custos Rodoviários
          </h1>
          <p className="text-sm text-slate-600">
            Monitoramento em tempo real do ciclo de vida das carcaças, alertas preditivos de recapagem e CPK.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-500">
            Última sincronização de odômetros: Hoje, 11:45
          </span>
        </div>
      </div>

      {protocoloGerado && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center justify-between">
          <span>✓ {protocoloGerado}</span>
          <button onClick={() => setProtocoloGerado(null)} className="text-xs underline">
            Fechar aviso
          </button>
        </div>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">Total de Pneus Monitorados</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {resumo ? resumo.totalAtivos.toLocaleString('pt-BR') : '1.362'}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            94,2% de aproveitamento de carcaça
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">CPK Médio da Frota</span>
          <div className="text-3xl font-extrabold text-blue-700 mt-2">R$ 0,041 / km</div>
          <span className="text-xs text-slate-500 mt-1 block">
            Meta corporativa: R$ 0,045 / km
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">Alertas Críticos de Remold</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{alertas.length} pneus</div>
          <span className="text-xs text-red-600 font-semibold mt-1 block">
            Exigem retirada imediata do caminhão
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500">Saving Acumulado (Recapagem)</span>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2">R$ 842,5 mil</div>
          <span className="text-xs text-slate-500 mt-1 block">
            Exercício fiscal vigente
          </span>
        </div>
      </div>

      {/* Gráfico de Pizza + Lista de Alertas de Remold */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          {resumo && <PneusDistributionPieChart dados={resumo} />}
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Alertas Preditivos de Limite para Remold
              </h3>
              <p className="text-xs text-slate-500">
                Pneus que atingiram ≥ 88% do limite de KM da etapa ou sulco próximo ao limite de segurança
              </p>
            </div>
            <AlertBadge severidade="CRITICA" textoCustomizado={`${alertas.length} Pendentes`} />
          </div>

          <div className="space-y-4">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all bg-slate-50/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <AlertBadge severidade={alerta.severidade} />
                    <span className="text-sm font-extrabold text-slate-900">
                      Fogo: {alerta.numeroFogo}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 rounded text-slate-800">
                      Placa: {alerta.veiculoPlaca} • Posição {alerta.posicaoEixo}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    Sulco: {alerta.sulcoAtualMm} mm
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2">{alerta.recomendacao}</p>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-600">
                    Rodado na etapa:{' '}
                    <strong className="text-slate-900">
                      {alerta.kmAtualEtapa.toLocaleString('pt-BR')} km
                    </strong>{' '}
                    de {alerta.limiteKmEtapa.toLocaleString('pt-BR')} km ({alerta.percentualDesgaste}%)
                  </div>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleAprovarRemold(alerta)}
                  >
                    Autorizar Retirada p/ Remold
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
