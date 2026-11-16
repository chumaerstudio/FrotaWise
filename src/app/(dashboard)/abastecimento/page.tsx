'use client';

import React, { useMemo, useState } from 'react';
import { Fuel, DollarSign, FileWarning, Route, AlertTriangle, Search } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatDec, formatNumber, formatUnit } from '@/services/api';
import { Btn, Chip, Empty, Kpi, Plate, SectionHead } from '@/components/ui';
import { formatDateShort } from '@/services/financeiroLocal';

const FUEL_TONE: Record<string, 'teal' | 'amber' | 'blue' | 'gray'> = {
  Diesel: 'teal',
  Gasolina: 'amber',
  Arla: 'blue',
};

export default function AbastecimentoPage() {
  const {
    vehicles,
    fuelings,
    fuelRows,
    fuelMedias,
    fuelKmDiffs,
    fuelStats,
    trips,
    liveMode,
    startEditFuel,
    handleDeleteFuel,
  } = useEstoquePneus();

  // Filtro por mês (AAAA-MM). Vazio = todos os períodos.
  const [month, setMonth] = useState('');
  const [plateQuery, setPlateQuery] = useState('');
  const monthRows = useMemo(
    () => fuelRows.filter(f => (!month || String(f.data).slice(0, 7) === month) && (!plateQuery || (vehicles.find(v => v.id === f.veiculoId)?.placa || '').toLocaleLowerCase('pt-BR').includes(plateQuery.toLocaleLowerCase('pt-BR')))),
    [fuelRows, month, plateQuery, vehicles]
  );
  const period = useMemo(() => {
    const litros = monthRows.reduce((a, f) => a + (Number(f.litros) || 0), 0);
    const gasto = monthRows.reduce((a, f) => a + (Number(f.valorTotal) || 0), 0);
    // km/l do período = distância ÷ litros das linhas com média (mesma regra da média da frota).
    const comMedia = monthRows.filter((f) => fuelMedias[f.id]);
    const dist = comMedia.reduce((a, f) => a + fuelMedias[f.id].dist, 0);
    const litrosMedia = comMedia.reduce((a, f) => a + fuelMedias[f.id].litros, 0);
    const diffs = monthRows
      .map((f) => fuelKmDiffs[f.id]?.diff)
      .filter((d): d is number => d !== null && d !== undefined);
    return {
      litros,
      gasto,
      kmLitro: litrosMedia > 0 ? dist / litrosMedia : null,
      kmEntre: diffs.length ? diffs.reduce((a, d) => a + d, 0) / diffs.length : null,
      kmTotal: diffs.reduce((a, d) => a + d, 0),
      ultimo: monthRows.find((f) => fuelKmDiffs[f.id]?.diff != null) || null,
    };
  }, [monthRows, fuelMedias, fuelKmDiffs]);
  const ultimoVeh = period.ultimo ? vehicles.find((v) => v.id === period.ultimo!.veiculoId) : undefined;
  const anomalies = useMemo(() => vehicles.flatMap(vehicle => {
    const readings = fuelings.filter(f => f.veiculoId === vehicle.id && f.tipo !== 'Arla' && !!fuelMedias[f.id]).sort((a,b) => a.data.localeCompare(b.data) || a.km - b.km);
    if (readings.length < 3) return [];
    const recent = readings[readings.length - 1];
    const older = readings.slice(0,-1);
    const previousLiters = older.reduce((sum,f) => sum + fuelMedias[f.id].litros, 0);
    const baseline = previousLiters > 0 ? older.reduce((sum,f) => sum + fuelMedias[f.id].dist, 0) / previousLiters : 0;
    const latest = fuelMedias[recent.id].media;
    if (!baseline || !Number.isFinite(latest) || latest >= baseline * .8 || (month && !recent.data.startsWith(month))) return [];
    return [{ vehicle, last: recent, latest, baseline, difference: Math.round((1-latest/baseline)*100) }];
  }).sort((a,b) => b.difference-a.difference).slice(0,4), [vehicles, fuelings, fuelMedias, month]);

  return (
    <div className="space-y-5">
      {anomalies.length > 0 && <section className="ef-fuel-alert card" aria-label="Variações de consumo para revisão"><div className="ef-fuel-alert-head"><AlertTriangle size={19}/><div><b>Consumos para conferir</b><p>As últimas médias ficaram abaixo do histórico de cada veículo. Verifique os lançamentos antes de tirar conclusões.</p></div></div><div className="ef-fuel-alert-list">{anomalies.map(item => <div className="ef-fuel-alert-row" key={item.vehicle.id}><Plate v={item.vehicle}/><span>Última média <b>{formatDec(item.latest)} km/l</b> · referência <b>{formatDec(item.baseline)} km/l</b></span><Chip tone="amber">{item.difference}% abaixo</Chip></div>)}</div></section>}
      <div className="ef-g-kpi">
        <Kpi
          label={month || plateQuery ? 'Média no filtro' : 'Média da frota'}
          value={month || plateQuery ? period.kmLitro || 0 : fuelStats.frota || 0}
          fmt={(n) => formatDec(n)}
          suffix="km/l"
          icon={Fuel}
          tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal)' }}
          sub={month || plateQuery ? 'Calculada nos registros selecionados' :
            fuelStats.frota
              ? `${fuelStats.porVeiculo.length} veículo(s) com média`
              : 'Faltam abastecimentos para calcular'}
          delay={0}
        />
        <Kpi
          label="Litros abastecidos"
          value={period.litros}
          fmt={(n) => formatNumber(Math.round(n))}
          suffix="L"
          icon={Fuel}
          tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }}
          sub={month || plateQuery ? 'No período e placa filtrados' : 'Todos os combustíveis e Arla'}
          delay={70}
        />
        <Kpi
          label="Gasto com combustível"
          value={period.gasto}
          fmt={formatCurrency}
          icon={DollarSign}
          tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }}
          sub={month || plateQuery ? 'No período e placa filtrados' : 'Soma dos valores totais'}
          delay={140}
        />
        <Kpi
          label="Lançamentos"
          value={monthRows.length}
          suffix="registros"
          icon={FileWarning}
          tone={{ bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }}
          sub="Registros no filtro atual"
          delay={210}
        />
      </div>

      <div className="card overflow-hidden ef-rise">
        <SectionHead
          title="Abastecimentos"
          sub="Consulte registros, custos e eficiência de cada abastecimento."
        />
        <div
          className="px-5 py-3 flex flex-wrap items-center gap-3"
          style={{ borderTop: '1px solid var(--line2)', borderBottom: '1px solid var(--line2)' }}
        >
          <label className="flex items-center gap-2 ef-t13">
            <span className="font-semibold">Mês</span>
            <input
              type="month"
              aria-label="Filtrar abastecimentos por mês"
              className="inp mono"
              style={{ width: 170 }}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
          <label className="ef-list-search ef-fuel-plate-search"><Search size={16}/><span className="sr-only">Filtrar por placa</span><input placeholder="Filtrar por placa…" value={plateQuery} onChange={e => setPlateQuery(e.target.value)}/></label>
          {(month || plateQuery) && (
            <Btn sm onClick={() => { setMonth(''); setPlateQuery(''); }}>
              Limpar filtros
            </Btn>
          )}
          <span className="ef-t12_5" style={{ color: 'var(--mute)' }}>
            {month || plateQuery ? `${monthRows.length} de ${fuelRows.length} lançamentos` : `${fuelRows.length} lançamentos`}
          </span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <Chip tone="gray">{formatNumber(Math.round(period.litros))} L</Chip>
            <Chip tone="blue">{formatCurrency(period.gasto)}</Chip>
            <Chip tone="teal">{period.kmLitro ? `${formatDec(period.kmLitro)} km/l` : 'km/l —'}</Chip>
            <Chip tone="amber">
              {period.kmEntre !== null
                ? `Média de Km: ${formatNumber(Math.round(period.kmEntre))} km/abast.`
                : 'Média de Km —'}
            </Chip>
          </div>
          {period.ultimo && (
            <div className="w-full ef-t12_5" style={{ color: 'var(--ink2)' }}>
              Último abastecimento com comparação{ultimoVeh ? ` (${ultimoVeh.placa})` : ''}:{' '}
              <b className="mono">+{formatNumber(fuelKmDiffs[period.ultimo.id].diff ?? 0)} km</b> desde o anterior
              {' · '}KM total entre abastecimentos no período:{' '}
              <b className="mono">{formatNumber(period.kmTotal)} km</b>
            </div>
          )}
        </div>
        {monthRows.length === 0 && fuelRows.length > 0 ? (
          <Empty
            icon={Fuel}
            title="Nenhum abastecimento neste mês"
            text="Escolha outro mês ou limpe o filtro para ver todos os lançamentos."
          />
        ) : fuelRows.length === 0 ? (
          <Empty
            icon={Fuel}
            title="Nenhum abastecimento lançado"
            text="Lance o primeiro abastecimento. A média aparece a partir do segundo lançamento do mesmo veículo."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl ef-desktop-fuel-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Veículo</th>
                  <th>Combustível</th>
                  <th className="ef-tr">Litros</th>
                  <th className="ef-tr">Valor unitário</th>
                  <th className="ef-tr">Valor total</th>
                  <th className="ef-tr">KM</th>
                  <th className="ef-tr" title="KM deste abastecimento − KM do abastecimento anterior do mesmo veículo">
                    Média de Km
                  </th>
                  <th className="ef-tr">Média</th>
                  {!liveMode && <th>Viagem</th>}
                  <th>Fornecedor</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map((f) => {
                  const veh = vehicles.find((v) => v.id === f.veiculoId);
                  const med = fuelMedias[f.id];
                  const kmd = fuelKmDiffs[f.id];
                  const viagem = f.viagemId ? trips.find((t) => t.id === f.viagemId) : undefined;
                  return (
                    <tr key={f.id}>
                      <td className="mono whitespace-nowrap">{f.data}</td>
                      <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                      <td>
                        <Chip tone={FUEL_TONE[f.tipo] || 'gray'}>{f.tipo}</Chip>
                      </td>
                      <td className="mono text-right whitespace-nowrap">{formatDec(f.litros)} L</td>
                      <td className="mono text-right">{formatUnit(f.valorUnit)}</td>
                      <td className="mono text-right font-bold">{formatCurrency(f.valorTotal)}</td>
                      <td className="mono text-right whitespace-nowrap">{formatNumber(f.km)} km</td>
                      <td
                        className="mono text-right font-bold whitespace-nowrap"
                        title={
                          f.tipo === 'Arla'
                            ? 'Arla não entra na comparação entre abastecimentos'
                            : kmd?.divergente
                            ? `Divergência: KM menor que o abastecimento anterior (${formatNumber(kmd.kmAnterior ?? 0)} km)`
                            : kmd?.diff == null
                            ? 'Primeiro abastecimento do veículo: sem anterior para comparar'
                            : `${formatNumber(f.km)} − ${formatNumber(kmd.kmAnterior ?? 0)}`
                        }
                      >
                        {kmd?.diff != null ? `${formatNumber(kmd.diff)} km` : '—'}
                        {kmd?.divergente && (
                          <div className="ef-t11_5 font-normal" style={{ color: 'var(--amber-ink)' }}>
                            KM divergente
                          </div>
                        )}
                      </td>
                      <td
                        className="mono text-right font-bold whitespace-nowrap"
                        title={
                          f.tipo === 'Arla' ? 'Arla não entra no cálculo de média' : undefined
                        }
                      >
                        {med ? `${formatDec(med.media)} km/l` : '—'}
                      </td>
                      {!liveMode && (
                        <td>
                          {viagem ? (
                            <Chip tone="blue">
                              <Route size={12} /> nº {viagem.numero}
                            </Chip>
                          ) : (
                            <span style={{ color: 'var(--mute)' }}>—</span>
                          )}
                        </td>
                      )}
                      <td style={{ color: 'var(--ink2)' }}>{f.fornecedor}</td>
                      <td className="text-right whitespace-nowrap ef-sx15">
                        <Btn sm onClick={() => startEditFuel(f)}>
                          Editar
                        </Btn>
                        <Btn sm className="ef-del" onClick={() => handleDeleteFuel(f)}>
                          Excluir
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {monthRows.length > 0 && <div className="ef-mobile-fuel-list">{monthRows.map(f => {
          const veh = vehicles.find(v => v.id === f.veiculoId);
          const med = fuelMedias[f.id];
          return <article key={f.id} className="ef-mobile-fuel-card"><div className="ef-mobile-fuel-card-top"><span>{veh ? <Plate v={veh}/> : 'Veículo indisponível'}</span><time dateTime={f.data}>{formatDateShort(f.data)}</time></div><div className="ef-mobile-fuel-values"><div><small>Combustível</small><b>{f.tipo}</b></div><div><small>Volume</small><b>{formatDec(f.litros)} L</b></div><div><small>Valor</small><b>{formatCurrency(f.valorTotal)}</b></div><div><small>Consumo</small><b>{med ? `${formatDec(med.media)} km/l` : '—'}</b></div></div><div className="ef-mobile-fuel-footer"><span>{f.fornecedor}</span><Btn sm onClick={() => startEditFuel(f)}>Editar</Btn></div></article>;
        })}</div>}
      </div>
    </div>
  );
}
