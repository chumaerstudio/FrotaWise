'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Disc,
  DollarSign,
  AlertTriangle,
  Settings,
  ShieldAlert,
  CheckCircle2,
  Fuel,
  Wrench,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatDec, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Kpi, Plate, SectionHead } from '@/components/ui';
import {
  ExpensesByVehicleBarChart,
  MaintenanceByCategoryBarChart,
  TiresPortfolioDonutChart,
} from '@/components/charts';

export default function DashboardPage() {
  const router = useRouter();
  const {
    company,
    theme,
    vehicles,
    tires,
    maintenances,
    tireAlerts,
    totalMaintenanceCost,
    totalFinesCost,
    totalStockTires,
    expensesByVehicleData,
    fuelStats,
    maintByCategory,
    preventiveList,
    preventiveAlerts,
    openTireOperationModal,
    handleCompleteRecap,
    setMaintenancePrefill,
    setShowMaintenanceModal,
  } = useEstoquePneus();

  return (
    <div className="space-y-5">
      <div className="ef-g-kpi">
        <Kpi
          label="Frota cadastrada"
          value={vehicles.length}
          suffix="veículos"
          icon={Truck}
          tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }}
          sub={`${vehicles.filter((v) => v.status === 'Operando').length} operando agora`}
          delay={0}
        />
        <Kpi
          label="Pneus e almoxarifado"
          value={tires.length}
          suffix="pneus"
          icon={Disc}
          tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal)' }}
          sub={`${totalStockTires.length} disponíveis em estoque`}
          delay={70}
        />
        <Kpi
          label="Despesa acumulada"
          value={totalMaintenanceCost + totalFinesCost}
          fmt={formatCurrency}
          icon={DollarSign}
          tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }}
          sub="Manutenções + multas"
          delay={140}
        />
        <Kpi
          label="Avisos de pneus"
          value={tireAlerts.length}
          suffix="pendentes"
          icon={AlertTriangle}
          tone={{ bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }}
          sub="Exigem uma ação"
          delay={210}
          action={
            <button
              onClick={() => router.push('/pneus')}
              className="font-semibold ef-hu"
              style={{ color: 'var(--teal)' }}
            >
              Abrir pneus
            </button>
          }
        />
      </div>

      <div className="ef-g-dash">
        <ExpensesByVehicleBarChart
          data={expensesByVehicleData}
          theme={theme}
          onOpenExpenses={() => router.push('/custos-multas')}
        />
        <TiresPortfolioDonutChart
          tires={tires}
          stockCount={totalStockTires.length}
          theme={theme}
        />
      </div>

      <div className="card overflow-hidden ef-rise" style={{ animationDelay: '240ms' }}>
        <SectionHead
          title="Ordens de ação programadas"
          sub="Pneus que precisam ser sucateados, recapados ou estocados, segundo as regras de quilometragem"
        >
          <Btn sm icon={Settings} onClick={() => router.push('/malha-pneus')}>
            Configurar regras
          </Btn>
        </SectionHead>
        {tireAlerts.length === 0 ? (
          <Empty
            icon={ShieldAlert}
            title="Nenhum alerta pendente"
            text="Todos os pneus estão dentro dos parâmetros operacionais."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Pneu</th>
                  <th>Localização</th>
                  <th className="ef-tr">KM acumulado</th>
                  <th>Diagnóstico e procedimento</th>
                  <th className="ef-tr">Executar</th>
                </tr>
              </thead>
              <tbody>
                {tireAlerts.map((al, i) => (
                  <tr key={i}>
                    <td>
                      <Chip
                        tone={
                          al.tipo === 'Sucatear'
                            ? 'red'
                            : al.tipo === 'Recapar'
                            ? 'amber'
                            : 'blue'
                        }
                      >
                        {al.tipo}
                      </Chip>
                    </td>
                    <td>
                      <div className="mono font-bold">Fogo #{al.tire.fogo}</div>
                      <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                        {al.tire.marca}
                      </div>
                    </td>
                    <td className="mono ef-t12_5">{al.localLabel}</td>
                    <td className="mono font-semibold text-right">
                      {formatNumber(al.tire.kmTotal)} km
                    </td>
                    <td style={{ maxWidth: 340 }}>
                      <div className="ef-t13 font-medium">{al.motivo}</div>
                      <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                        {al.instrucao}
                      </div>
                    </td>
                    <td className="text-right">
                      {al.tipo.toLowerCase() === 'recapar' && !al.tire.veiculoAtualId ? (
                        <Btn
                          sm
                          v="primary"
                          icon={CheckCircle2}
                          onClick={() => handleCompleteRecap(al.tire)}
                        >
                          Concluir recapagem
                        </Btn>
                      ) : (
                        <Btn
                          sm
                          v="dark"
                          onClick={() => {
                            switch (al.tipo.toLowerCase()) {
                              case 'estocar':
                                openTireOperationModal(al.tire, 'Estocar');
                                break;
                              case 'recapar':
                                openTireOperationModal(al.tire, 'Recapar');
                                break;
                              case 'sucatear':
                                openTireOperationModal(al.tire, 'Sucatear');
                                break;
                              default:
                                router.push('/pneus');
                            }
                          }}
                        >
                          {al.tipo.toLowerCase() === 'atencao'
                            ? 'Ver pneu'
                            : `Confirmar ${al.tipo.toLowerCase()}`}
                        </Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ef-g-dash">
        <div className="card ef-rise">
          <SectionHead
            title="Dashboard de manutenção"
            sub="Sincronizado com os lançamentos da aba Manutenções e multas"
          >
            <Btn sm onClick={() => router.push('/custos-multas')}>
              Abrir manutenções
            </Btn>
          </SectionHead>
          <div className="ef-g-kpi p-5">
            {(
              [
                ['Lançamentos', formatNumber(maintenances.length)],
                ['Gasto total', formatCurrency(totalMaintenanceCost)],
                [
                  'Preventivas',
                  formatNumber(maintenances.filter((m) => m.tipo === 'Preventiva').length),
                ],
                [
                  'Corretivas',
                  formatNumber(maintenances.filter((m) => m.tipo === 'Corretiva').length),
                ],
              ] as const
            ).map(([l, val]) => (
              <div
                key={l}
                className="p-3 rounded-xl"
                style={{ background: 'var(--card2)', border: '1px solid var(--line2)' }}
              >
                <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                  {l}
                </div>
                <div className="disp ef-t20 font-semibold mt-1">{val}</div>
              </div>
            ))}
          </div>
          <div className="px-5 ef-t13 font-semibold">Gasto por categoria de manutenção</div>
          <MaintenanceByCategoryBarChart data={maintByCategory} theme={theme} />
        </div>

        <div className="card ef-rise" style={{ animationDelay: '60ms' }}>
          <SectionHead
            title="Média de consumo"
            sub="(KM atual − KM do abastecimento anterior) ÷ litros"
          >
            <Btn sm icon={Fuel} onClick={() => router.push('/abastecimento')}>
              Abastecimento
            </Btn>
          </SectionHead>
          {fuelStats.frota === null ? (
            <Empty
              icon={Fuel}
              title="Sem média ainda"
              text="São necessários ao menos dois abastecimentos de combustível do mesmo veículo."
            />
          ) : (
            <div className="p-5">
              <div className="flex items-end gap-2">
                <span className="disp ef-t40 font-semibold leading-none">
                  {formatDec(fuelStats.frota)}
                </span>
                <span className="ef-t13 pb-1" style={{ color: 'var(--mute)' }}>
                  km/l · média da frota
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {fuelStats.porVeiculo.map((x) => {
                  const max = Math.max(...fuelStats.porVeiculo.map((y) => y.media));
                  return (
                    <div key={x.v.id}>
                      <div className="flex items-center justify-between">
                        <Plate v={x.v} />
                        <span className="mono font-bold ef-t13">{formatDec(x.media)} km/l</span>
                      </div>
                      <div
                        className="ef-h1_5 rounded-full ef-mt1_5 overflow-hidden"
                        style={{ background: 'var(--line2)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(x.media / max) * 100}%`,
                            background: 'var(--brand)',
                          }}
                        />
                      </div>
                      <div className="ef-t12 mt-1" style={{ color: 'var(--mute)' }}>
                        Último: {x.ultima !== null ? `${formatDec(x.ultima)} km/l` : '—'} · {x.qtd}{' '}
                        abastecimento(s) com média
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden ef-rise" style={{ animationDelay: '120ms' }}>
        <SectionHead
          title="Manutenção preventiva"
          sub="Avisos pelos limites de KM configurados por categoria e peça"
        >
          <Btn sm icon={Settings} onClick={() => router.push('/malha-pneus')}>
            Configurar limites
          </Btn>
        </SectionHead>
        {(company.regrasManutencao || []).length === 0 ? (
          <Empty
            icon={Wrench}
            title="Nenhum limite configurado"
            text="Em Configurações e malha, defina o KM da preventiva por categoria e peça."
          />
        ) : preventiveAlerts.length === 0 ? (
          <Empty
            icon={CheckCircle2}
            title="Nenhum aviso de preventiva"
            text={`Todas as peças com histórico estão em dia${
              preventiveList.filter((x) => x.status === 'sem').length
                ? ` (${
                    preventiveList.filter((x) => x.status === 'sem').length
                  } combinações veículo/peça ainda sem registro de manutenção)`
                : ''
            }.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Situação</th>
                  <th>Veículo</th>
                  <th>Categoria / peça</th>
                  <th className="ef-tr">Última (km)</th>
                  <th className="ef-tr">Próxima (km)</th>
                  <th className="ef-tr">KM atual</th>
                  <th className="ef-tr">Restante</th>
                  <th className="ef-tr">Ação</th>
                </tr>
              </thead>
              <tbody>
                {preventiveAlerts.map((al) => (
                  <tr key={al.v.id + al.r.id}>
                    <td>
                      <Chip tone={al.status === 'vencida' ? 'red' : 'amber'}>
                        {al.status === 'vencida' ? 'Vencida' : 'Próxima'}
                      </Chip>
                    </td>
                    <td>
                      <Plate v={al.v} />
                    </td>
                    <td>
                      <div className="font-semibold">{al.r.peca}</div>
                      <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                        {al.r.categoria} · a cada {formatNumber(al.r.km)} km
                      </div>
                    </td>
                    <td className="mono text-right">{formatNumber(al.ultimo?.km || 0)} km</td>
                    <td className="mono text-right">{formatNumber(al.proximo || 0)} km</td>
                    <td className="mono text-right">
                      {formatNumber(al.atual.km)} km
                      <div style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--mute)' }}>
                        {al.atual.origem}
                        {al.atual.data ? ` · ${al.atual.data}` : ''}
                      </div>
                    </td>
                    <td
                      className="mono text-right font-bold"
                      style={{ color: al.status === 'vencida' ? 'var(--red)' : 'var(--ink)' }}
                    >
                      {(al.restante || 0) <= 0
                        ? `Vencida há ${formatNumber(-(al.restante || 0))} km`
                        : `${formatNumber(al.restante || 0)} km`}
                    </td>
                    <td className="text-right">
                      <Btn
                        sm
                        v="dark"
                        onClick={() => {
                          setMaintenancePrefill({
                            veiculoId: al.v.id,
                            categoria: al.r.categoria,
                            peca: al.r.peca,
                            tipo: 'Preventiva',
                          });
                          setShowMaintenanceModal(true);
                        }}
                      >
                        Registrar
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
