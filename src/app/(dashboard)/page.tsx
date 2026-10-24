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
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Kpi, SectionHead } from '@/components/ui';
import { ExpensesByVehicleBarChart, TiresPortfolioDonutChart } from '@/components/charts';

export default function DashboardPage() {
  const router = useRouter();
  const {
    theme,
    vehicles,
    tires,
    tireAlerts,
    totalMaintenanceCost,
    totalFinesCost,
    totalStockTires,
    expensesByVehicleData,
    openTireOperationModal,
    handleCompleteRecap,
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
                      {al.tipo === 'Recapar' && !al.tire.veiculoAtualId ? (
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
                          onClick={() => openTireOperationModal(al.tire, al.tipo)}
                        >
                          Confirmar {al.tipo.toLowerCase()}
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
    </div>
  );
}
