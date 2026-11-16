'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  DollarSign,
  AlertTriangle,
  Settings,
  ShieldAlert,
  CheckCircle2,
  Fuel,
  Wrench,
  ArrowUpRight,
  Clock3,
  Activity,
  Route,
} from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatDec, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Kpi, Plate, SectionHead } from '@/components/ui';
import { getClassificacaoTone } from '@/services/statusTones';
import { buildPayables, formatDateShort, localToday } from '@/services/financeiroLocal';
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
    fines,
    fuelings,
    trips,
    pagamentos,
    contas,
    custosFixos,
    totalStockTires,
    expensesByVehicleData,
    fuelStats,
    maintByCategory,
    preventiveList,
    preventiveAlerts,
    openTireOperationModal,
    setHistoryModalTire,
    setSelectedTireForActionId,
    setSelectedChassisVehicleId,
    handleCompleteRecap,
    setMaintenancePrefill,
    setShowMaintenanceModal,
  } = useEstoquePneus();

  const today = localToday();
  const thisMonth = today.slice(0, 7);
  const pendingBills = useMemo(() => buildPayables({ fuelings, maintenances, fines, tires, vehicles, pagamentos, contas, custosFixos }), [fuelings, maintenances, fines, tires, vehicles, pagamentos, contas, custosFixos]);
  const overdueBills = pendingBills.filter(item => !item.pagoEm && item.vencimento && item.vencimento < today);
  const runningTrips = useMemo(() => trips.filter(trip => trip.kmFinal === null).sort((a, b) => b.data.localeCompare(a.data)), [trips]);
  const monthOperatingCost = maintenances.filter(m => m.data.startsWith(thisMonth)).reduce((s, m) => s + (Number(m.valor) || 0), 0)
    + fines.filter(f => f.data.startsWith(thisMonth)).reduce((s, f) => s + (Number(f.valor) || 0), 0)
    + fuelings.filter(f => f.data.startsWith(thisMonth)).reduce((s, f) => s + (Number(f.valorTotal) || 0), 0);
  const priorities = [
    ...preventiveAlerts.map(al => ({ key: `pm-${al.v.id}-${al.r.id}`, severity: al.status === 'vencida' ? 'critical' : 'warning', title: `${al.r.peca} · ${al.v.placa}`, detail: al.status === 'vencida' ? `Preventiva vencida há ${formatNumber(Math.abs(al.restante || 0))} km` : `Manutenção próxima · faltam ${formatNumber(al.restante || 0)} km`, group: 0, onClick: () => {
      setMaintenancePrefill({ veiculoId: al.v.id, categoria: al.r.categoria, peca: al.r.peca, tipo: 'Preventiva' });
      setShowMaintenanceModal(true);
      router.push('/custos-multas?aba=maintenances');
    } })),
    ...tireAlerts.map(al => ({ key: `pt-${al.tire.id}-${al.tipo}`, severity: al.tipo.toLowerCase() === 'sucatear' ? 'critical' : 'warning', title: `Pneu #${al.tire.fogo} · ${al.tipo}`, detail: `${al.localLabel} · ${al.motivo}`, group: 1, onClick: () => {
      setSelectedTireForActionId(al.tire.id);
      if (al.tire.veiculoAtualId) setSelectedChassisVehicleId(al.tire.veiculoAtualId);
      const tipo = al.tipo.toLowerCase();
      if (tipo === 'recapar' || tipo === 'sucatear' || tipo === 'estocar') {
        openTireOperationModal(al.tire, tipo === 'recapar' ? 'Recapar' : tipo === 'sucatear' ? 'Sucatear' : 'Estocar');
      } else {
        setHistoryModalTire(al.tire);
      }
      router.push('/pneus');
    } })),
    ...overdueBills.map(item => ({ key: `pf-${item.key}`, severity: 'critical', title: `${item.descricao} · ${formatCurrency(item.valor)}`, detail: `Pagamento vencido em ${formatDateShort(item.vencimento)}`, group: 2, onClick: () => router.push(`/financeiro?pagamento=${encodeURIComponent(item.key)}`) })),
  ].sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1) || a.group - b.group);
  const recentEvents = [
    ...maintenances.map(m => ({ id: `m-${m.id}`, date: m.data, title: `Manutenção · ${vehicles.find(v => v.id === m.veiculoId)?.placa || 'Veículo'}`, detail: m.descricao, href: '/custos-multas?aba=maintenances', icon: Wrench })),
    ...fuelings.map(f => ({ id: `a-${f.id}`, date: f.data, title: `Abastecimento · ${vehicles.find(v => v.id === f.veiculoId)?.placa || 'Veículo'}`, detail: `${formatCurrency(f.valorTotal)} · ${f.litros} L`, href: '/abastecimento', icon: Fuel })),
    ...fines.map(f => ({ id: `f-${f.id}`, date: f.data, title: `Multa · ${vehicles.find(v => v.id === f.veiculoId)?.placa || 'Veículo'}`, detail: f.motivo, href: '/custos-multas?aba=fines', icon: ShieldAlert })),
  ].filter(item => item.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="ef-dashboard-intro">
        <div><span className="ef-overline">CENTRAL DE OPERAÇÃO</span><h2>O que precisa da sua atenção?</h2><p>Prioridades e resultados da frota, em um só lugar.</p></div>
        <span className="ef-dashboard-today"><Clock3 size={15}/> {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${today}T12:00:00`))}</span>
      </div>
      <section className="card ef-priority-card" aria-labelledby="priority-title">
        <div className="ef-priority-head"><div><span className="ef-overline">PARA AGIR AGORA</span><h3 id="priority-title">Prioridades da operação</h3><p>Alertas operacionais e pagamentos vencidos.</p></div><span className={`ef-priority-count ${priorities.length ? 'has-alert' : ''}`}>{priorities.length} pendência{priorities.length !== 1 ? 's' : ''}</span></div>
        {!priorities.length ? <div className="ef-priority-clear"><CheckCircle2 size={19}/> Nenhuma pendência encontrada nos registros atuais.</div> : <div className="ef-priority-list">{priorities.slice(0, 5).map(item => <button key={item.key} type="button" className="ef-priority-row" onClick={item.onClick}><span className={`ef-priority-marker ${item.severity}`}><AlertTriangle size={17}/></span><span className="ef-priority-copy"><b>{item.title}</b><small>{item.detail}</small></span><span className={`ef-priority-tag ${item.severity}`}>{item.severity === 'critical' ? 'Crítico' : 'Atenção'}</span><ArrowUpRight size={17} className="ef-priority-arrow" /></button>)}{priorities.length > 5 && <div className="ef-priority-more">Mais {priorities.length - 5} pendências nos módulos de origem.</div>}</div>}
      </section>
      {runningTrips.length > 0 && (
        <section className="card ef-running-trips" aria-labelledby="running-trips-title">
          <div className="ef-running-head">
            <div className="min-w-0"><span className="ef-overline">ACOMPANHAMENTO DE VIAGENS</span><h3 id="running-trips-title"><Route size={18}/> {runningTrips.length} viagem{runningTrips.length !== 1 ? 'ns' : ''} em andamento</h3><p>O motorista retornou? Informe o KM final para encerrar o registro.</p></div>
            <Btn sm onClick={() => router.push('/viagens')}>Ver todas</Btn>
          </div>
          <div className="ef-running-list">
            {runningTrips.slice(0, 4).map(trip => <div className="ef-running-row" key={trip.id}>
              <div className="ef-running-identity"><b>Viagem nº {trip.numero}</b><span>{vehicles.find(v => v.id === trip.veiculoId)?.placa || 'Veículo não encontrado'} · {formatDateShort(trip.data)}</span></div>
              <p>{trip.origem || 'Origem'} → {trip.destino || 'Destino'}</p>
              <span className="mono ef-running-km">Saída: {formatNumber(trip.kmInicial)} km</span>
              <Btn sm v="primary" icon={CheckCircle2} onClick={() => router.push(`/viagens?concluir=${encodeURIComponent(trip.id)}`)}>Concluir viagem</Btn>
            </div>)}
            {runningTrips.length > 4 && <div className="ef-running-more">Mais {runningTrips.length - 4} viagens em andamento. <button onClick={() => router.push('/viagens')}>Ver todas</button></div>}
          </div>
        </section>
      )}
      <div className="ef-g-kpi">
        <Kpi
          label="Veículos operando"
          value={vehicles.filter(v => v.status === 'Operando').length}
          suffix="veículos"
          icon={Truck}
          tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }}
          sub={`De ${vehicles.length} veículos cadastrados`}
          delay={0}
        />
        <Kpi
          label="Pendências operacionais"
          value={tireAlerts.length + preventiveAlerts.length}
          suffix="avisos"
          icon={AlertTriangle}
          tone={{ bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }}
          sub="Pneus e manutenções preventivas"
          delay={70}
        />
        <Kpi
          label="Custos operacionais no mês"
          value={monthOperatingCost}
          fmt={formatCurrency}
          icon={DollarSign}
          tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }}
          sub="Abastecimento, manutenção e multas"
          delay={140}
        />
        <Kpi
          label="Pagamentos vencidos"
          value={overdueBills.reduce((sum, bill) => sum + bill.valor, 0)}
          fmt={formatCurrency}
          icon={DollarSign}
          tone={{ bg: 'var(--red-soft)', fg: 'var(--red-ink)' }}
          sub={`${overdueBills.length} parcelas em atraso`}
          delay={210}
          action={
            <button
              onClick={() => router.push('/financeiro')}
              className="font-semibold ef-hu"
              style={{ color: 'var(--teal)' }}
            >
              Abrir financeiro
            </button>
          }
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
                      <Chip tone={getClassificacaoTone(al.tipo)}>
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
            title="Custos de manutenção"
            sub="Acompanhe os serviços registrados por categoria."
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
            title="Eficiência de combustível"
            sub="Comparação do consumo por veículo, com base nos abastecimentos registrados."
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
      <div className="ef-g-dash">
        <ExpensesByVehicleBarChart data={expensesByVehicleData} theme={theme} onOpenExpenses={() => router.push('/custos-multas?aba=maintenances')} />
        <TiresPortfolioDonutChart tires={tires} stockCount={totalStockTires.length} theme={theme} />
      </div>
      <section className="card overflow-hidden">
        <SectionHead title="Registros recentes" sub="Últimos lançamentos operacionais disponíveis, sem dados simulados." />
        {!recentEvents.length ? <Empty icon={Activity} title="Sem registros recentes" text="Os registros da operação aparecerão aqui conforme forem lançados." /> : <div className="ef-activity-list">{recentEvents.map(item => { const Icon = item.icon; return <button type="button" className="ef-activity-item" key={item.id} onClick={() => router.push(item.href)}><span className="ef-activity-icon"><Icon size={18}/></span><span className="min-w-0 flex-1"><b>{item.title}</b><small>{item.detail}</small></span><time dateTime={item.date}>{formatDateShort(item.date)}</time><ArrowUpRight size={16}/></button>; })}</div>}
      </section>

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
