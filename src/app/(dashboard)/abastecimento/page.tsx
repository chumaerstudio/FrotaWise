'use client';

import React from 'react';
import { Fuel, DollarSign, FileWarning, Plus } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatDec, formatNumber, formatUnit } from '@/services/api';
import { Btn, Chip, Empty, Kpi, Plate, SectionHead } from '@/components/ui';

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
    fuelStats,
    setShowFuelModal,
    startEditFuel,
    handleDeleteFuel,
  } = useEstoquePneus();

  return (
    <div className="space-y-5">
      <div className="ef-g-kpi">
        <Kpi
          label="Média da frota"
          value={fuelStats.frota || 0}
          fmt={(n) => formatDec(n)}
          suffix="km/l"
          icon={Fuel}
          tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal)' }}
          sub={
            fuelStats.frota
              ? `${fuelStats.porVeiculo.length} veículo(s) com média`
              : 'Faltam abastecimentos para calcular'
          }
          delay={0}
        />
        <Kpi
          label="Litros abastecidos"
          value={fuelStats.litrosTotal}
          fmt={(n) => formatNumber(Math.round(n))}
          suffix="L"
          icon={Fuel}
          tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }}
          sub="Todos os combustíveis e Arla"
          delay={70}
        />
        <Kpi
          label="Gasto com combustível"
          value={fuelStats.gastoTotal}
          fmt={formatCurrency}
          icon={DollarSign}
          tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }}
          sub="Soma dos valores totais"
          delay={140}
        />
        <Kpi
          label="Lançamentos"
          value={fuelings.length}
          suffix="registros"
          icon={FileWarning}
          tone={{ bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }}
          sub="Média não considera Arla"
          delay={210}
        />
      </div>

      <div className="card overflow-hidden ef-rise">
        <SectionHead
          title="Abastecimentos"
          sub="Média = (KM deste abastecimento − KM do anterior do mesmo veículo) ÷ litros abastecidos"
        >
          <Btn v="primary" icon={Plus} onClick={() => setShowFuelModal(true)}>
            Lançar abastecimento
          </Btn>
        </SectionHead>
        {fuelRows.length === 0 ? (
          <Empty
            icon={Fuel}
            title="Nenhum abastecimento lançado"
            text="Lance o primeiro abastecimento. A média aparece a partir do segundo lançamento do mesmo veículo."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Veículo</th>
                  <th>Combustível</th>
                  <th className="ef-tr">Litros</th>
                  <th className="ef-tr">Valor unitário</th>
                  <th className="ef-tr">Valor total</th>
                  <th className="ef-tr">KM</th>
                  <th className="ef-tr">Média</th>
                  <th>Fornecedor</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fuelRows.map((f) => {
                  const veh = vehicles.find((v) => v.id === f.veiculoId);
                  const med = fuelMedias[f.id];
                  return (
                    <tr key={f.id}>
                      <td className="mono">{f.data}</td>
                      <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                      <td>
                        <Chip tone={FUEL_TONE[f.tipo] || 'gray'}>{f.tipo}</Chip>
                      </td>
                      <td className="mono text-right">{formatDec(f.litros)} L</td>
                      <td className="mono text-right">{formatUnit(f.valorUnit)}</td>
                      <td className="mono text-right font-bold">{formatCurrency(f.valorTotal)}</td>
                      <td className="mono text-right">{formatNumber(f.km)} km</td>
                      <td
                        className="mono text-right font-bold"
                        title={
                          f.tipo === 'Arla' ? 'Arla não entra no cálculo de média' : undefined
                        }
                      >
                        {med ? `${formatDec(med.media)} km/l` : '—'}
                      </td>
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
      </div>
    </div>
  );
}
