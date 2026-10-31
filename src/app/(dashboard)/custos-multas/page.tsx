'use client';

import React, { useState } from 'react';
import { Wrench, FileWarning, Plus } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Plate } from '@/components/ui';

const FINE_TONE: Record<string, 'amber' | 'teal' | 'blue' | 'gray'> = {
  Pendente: 'amber',
  Paga: 'teal',
  'Em Recurso': 'blue',
};

export default function CustosMultasPage() {
  const {
    vehicles,
    maintenances,
    fines,
    totalMaintenanceCost,
    totalFinesCost,
    setShowMaintenanceModal,
    startEditMaint,
    handleDeleteMaintenance,
    setShowFineModal,
    startEditFine,
    handleDeleteFine,
  } = useEstoquePneus();

  const [expenseSubTab, setExpenseSubTab] = useState<'maintenances' | 'fines'>('maintenances');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="seg" role="tablist">
          <button
            role="tab"
            className={expenseSubTab === 'maintenances' ? 'on' : ''}
            onClick={() => setExpenseSubTab('maintenances')}
          >
            <Wrench size={15} />
            Manutenções ({maintenances.length}) · {formatCurrency(totalMaintenanceCost)}
          </button>
          <button
            role="tab"
            className={expenseSubTab === 'fines' ? 'on' : ''}
            onClick={() => setExpenseSubTab('fines')}
          >
            <FileWarning size={15} />
            Multas ({fines.length}) · {formatCurrency(totalFinesCost)}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Btn v="dark" icon={Plus} onClick={() => setShowMaintenanceModal(true)}>
            Lançar manutenção
          </Btn>
          <Btn v="danger" icon={Plus} onClick={() => setShowFineModal(true)}>
            Lançar multa
          </Btn>
        </div>
      </div>

      <div className="card overflow-hidden ef-rise" key={expenseSubTab}>
        {expenseSubTab === 'maintenances' ? (
          maintenances.length === 0 ? (
            <Empty
              icon={Wrench}
              title="Nenhuma manutenção lançada"
              text="Registre a primeira ordem de serviço da frota."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>O.S. / data</th>
                    <th>Veículo</th>
                    <th>Tipo</th>
                    <th className="ef-tr">KM</th>
                    <th>Descrição</th>
                    <th>Oficina</th>
                    <th className="ef-tr">Valor</th>
                    <th className="ef-tr">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenances.map((m) => {
                    const veh = vehicles.find((v) => v.id === m.veiculoId);
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="mono font-bold">{m.osNumero}</div>
                          <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                            {m.data}
                          </div>
                        </td>
                        <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                        <td>
                          <Chip
                            tone={
                              m.tipo === 'Corretiva'
                                ? 'red'
                                : m.tipo === 'Preventiva'
                                ? 'teal'
                                : 'amber'
                            }
                          >
                            {m.tipo}
                          </Chip>
                          {m.categoria && (
                            <div className="ef-t12 mt-1" style={{ color: 'var(--mute)' }}>
                              {m.categoria}
                              {m.peca ? ` · ${m.peca}` : ''}
                            </div>
                          )}
                        </td>
                        <td className="mono text-right">
                          {m.km !== null && m.km !== undefined
                            ? `${formatNumber(m.km)} km`
                            : '—'}
                        </td>
                        <td style={{ maxWidth: 320 }}>{m.descricao}</td>
                        <td style={{ color: 'var(--ink2)' }}>{m.fornecedor}</td>
                        <td className="mono text-right font-bold">{formatCurrency(m.valor)}</td>
                        <td className="text-right whitespace-nowrap ef-sx15">
                          <Btn sm onClick={() => startEditMaint(m)}>
                            Editar
                          </Btn>
                          <Btn
                            sm
                            className="ef-del"
                            onClick={() => handleDeleteMaintenance(m)}
                          >
                            Excluir
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : fines.length === 0 ? (
          <Empty
            icon={FileWarning}
            title="Nenhuma multa lançada"
            text="As multas lançadas entram automaticamente nas despesas do veículo."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>AIT / data</th>
                  <th>Veículo</th>
                  <th>Infração</th>
                  <th>Motorista</th>
                  <th className="ef-tc">Status</th>
                  <th className="ef-tr">Valor</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((f) => {
                  const veh = vehicles.find((v) => v.id === f.veiculoId);
                  return (
                    <tr key={f.id}>
                      <td>
                        <div className="mono font-bold">{f.ait}</div>
                        <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                          {f.data} · {f.pontos} pts
                        </div>
                      </td>
                      <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                      <td style={{ maxWidth: 320 }}>{f.motivo}</td>
                      <td>
                        {f.identificado === false ? (
                          <Chip tone="red">Não identificado (NIC)</Chip>
                        ) : (
                          f.motorista
                        )}
                      </td>
                      <td className="text-center">
                        <Chip tone={FINE_TONE[f.status] || 'gray'}>{f.status}</Chip>
                      </td>
                      <td className="mono text-right font-bold" style={{ color: 'var(--red)' }}>
                        {formatCurrency(f.valor)}
                        {f.identificado === false && (
                          <div
                            className="ef-t11_5 font-normal"
                            style={{ color: 'var(--mute)' }}
                          >
                            {formatCurrency(f.valorOriginal || 0)} + NIC{' '}
                            {formatCurrency(f.valorNIC || 0)}
                          </div>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap ef-sx15">
                        <Btn sm onClick={() => startEditFine(f)}>
                          Editar
                        </Btn>
                        <Btn sm className="ef-del" onClick={() => handleDeleteFine(f)}>
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
