'use client';

import React, { useMemo, useState } from 'react';
import { Wrench, FileWarning, Plus } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Modal, Plate, PlateFilter } from '@/components/ui';
import { getMultaStatusTone } from '@/services/statusTones';
import { ehNic, multaOriginalDaNic, nicsDaMulta, normPlaca } from '@/services/multasService';
import type { Multa } from '@/types/frotawise';

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
    liveMode,
  } = useEstoquePneus();

  const [expenseSubTab, setExpenseSubTab] = useState<'maintenances' | 'fines'>('maintenances');
  // Filtros por placa (um por aba), independentes entre si.
  const [maintPlate, setMaintPlate] = useState('');
  const [finePlate, setFinePlate] = useState('');
  const [detailFineId, setDetailFineId] = useState<string | null>(null);

  const plates = useMemo(() => vehicles.map((v) => v.placa).sort(), [vehicles]);
  const plateOf = (veiculoId: string) => vehicles.find((v) => v.id === veiculoId)?.placa;
  const matchPlate = (veiculoId: string, query: string) => {
    const q = normPlaca(query);
    return !q || normPlaca(plateOf(veiculoId)).includes(q);
  };

  const visibleMaint = useMemo(
    () => maintenances.filter((m) => matchPlate(m.veiculoId, maintPlate)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maintenances, maintPlate, vehicles]
  );
  const visibleFines = useMemo(
    () => fines.filter((f) => matchPlate(f.veiculoId, finePlate)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fines, finePlate, vehicles]
  );
  const sum = (arr: { valor: number }[]) => arr.reduce((a, x) => a + (Number(x.valor) || 0), 0);

  const detailFine = fines.find((f) => f.id === detailFineId) || null;

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
            Lançar multa / NIC
          </Btn>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {expenseSubTab === 'maintenances' ? (
          <PlateFilter id="plate-maint" value={maintPlate} onChange={setMaintPlate} plates={plates} />
        ) : (
          <PlateFilter id="plate-fines" value={finePlate} onChange={setFinePlate} plates={plates} />
        )}
        {(expenseSubTab === 'maintenances' ? maintPlate : finePlate).trim() && (
          <>
            <span className="ef-t13" style={{ color: 'var(--mute)' }}>
              {expenseSubTab === 'maintenances'
                ? `${visibleMaint.length} de ${maintenances.length} manutenções · ${formatCurrency(sum(visibleMaint))}`
                : `${visibleFines.length} de ${fines.length} multas · ${formatCurrency(sum(visibleFines))}`}
            </span>
            <Btn
              sm
              onClick={() => (expenseSubTab === 'maintenances' ? setMaintPlate('') : setFinePlate(''))}
            >
              Limpar filtro
            </Btn>
          </>
        )}
      </div>

      <div className="card overflow-hidden ef-rise" key={expenseSubTab}>
        {expenseSubTab === 'maintenances' ? (
          visibleMaint.length === 0 ? (
            <Empty
              icon={Wrench}
              title={maintenances.length === 0 ? 'Nenhuma manutenção lançada' : 'Nenhuma manutenção para esta placa'}
              text={
                maintenances.length === 0
                  ? 'Registre a primeira ordem de serviço da frota.'
                  : 'Ajuste ou limpe o filtro de placa para ver os demais registros.'
              }
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
                  {visibleMaint.map((m) => {
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
        ) : visibleFines.length === 0 ? (
          <Empty
            icon={FileWarning}
            title={fines.length === 0 ? 'Nenhuma multa lançada' : 'Nenhuma multa para esta placa'}
            text={
              fines.length === 0
                ? 'As multas lançadas entram automaticamente nas despesas do veículo.'
                : 'Ajuste ou limpe o filtro de placa para ver os demais registros.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID / AIT / data</th>
                  <th>Veículo</th>
                  <th>Infração</th>
                  <th>Motorista</th>
                  <th className="ef-tc">Status</th>
                  <th className="ef-tr">Valor</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visibleFines.map((f) => {
                  const veh = vehicles.find((v) => v.id === f.veiculoId);
                  const nic = ehNic(f);
                  const original = nic ? multaOriginalDaNic(fines, f) : undefined;
                  const nics = nic ? [] : nicsDaMulta(fines, f.id);
                  return (
                    <tr key={f.id}>
                      <td>
                        <div className="mono font-bold whitespace-nowrap">{f.codigo || '—'}</div>
                        <div className="mono ef-t12">{f.ait}</div>
                        <div className="ef-t12" style={{ color: 'var(--mute)' }}>
                          {f.data} · {f.pontos} pts
                        </div>
                      </td>
                      <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                      <td style={{ maxWidth: 320 }}>
                        {nic && (
                          <div className="mb-1 flex flex-wrap items-center gap-1">
                            <Chip tone="red">NIC</Chip>
                            <span className="ef-t12 mono" style={{ color: 'var(--mute)' }}>
                              ↳ multa {original?.codigo || 'não localizada'}
                            </span>
                          </div>
                        )}
                        {f.motivo}
                        {nics.length > 0 && (
                          <div className="mt-1">
                            <Chip tone="blue">
                              {nics.length} NIC vinculada{nics.length > 1 ? 's' : ''}
                            </Chip>
                          </div>
                        )}
                      </td>
                      <td>
                        {f.identificado === false && !nic ? (
                          <Chip tone="red">Não identificado (NIC)</Chip>
                        ) : (
                          f.motorista
                        )}
                      </td>
                      <td className="text-center">
                        <Chip tone={getMultaStatusTone(f.status)}>{f.status}</Chip>
                      </td>
                      <td className="mono text-right font-bold" style={{ color: 'var(--red)' }}>
                        {formatCurrency(f.valor)}
                        {f.identificado === false && !nic && (
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
                        <Btn sm onClick={() => setDetailFineId(f.id)}>
                          Detalhes
                        </Btn>
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

      {detailFine && (
        <FineDetailModal
          fine={detailFine}
          fines={fines}
          plate={plateOf(detailFine.veiculoId)}
          onClose={() => setDetailFineId(null)}
          onOpen={(id) => setDetailFineId(id)}
          liveMode={liveMode}
        />
      )}
    </div>
  );
}

function FineDetailModal({
  fine,
  fines,
  plate,
  onClose,
  onOpen,
  liveMode,
}: {
  fine: Multa;
  fines: Multa[];
  plate?: string;
  onClose: () => void;
  onOpen: (id: string) => void;
  liveMode: boolean;
}) {
  const nic = ehNic(fine);
  const original = nic ? multaOriginalDaNic(fines, fine) : undefined;
  const nics = nic ? [] : nicsDaMulta(fines, fine.id);
  const rows: [string, React.ReactNode][] = [
    ['ID do registro', <span key="c" className="mono font-bold">{fine.codigo || '—'}</span>],
    ['Tipo de lançamento', nic ? <Chip tone="red">NIC</Chip> : <Chip tone="gray">Multa</Chip>],
    ['AIT', <span key="a" className="mono">{fine.ait}</span>],
    ['Placa', <span key="p" className="mono">{plate || 'N/A'}</span>],
    ['Data', fine.data],
    ['Infração', fine.motivo],
    ['Motorista', fine.identificado === false && !nic ? 'Não identificado' : fine.motorista],
    ['Status', <Chip key="s" tone={getMultaStatusTone(fine.status)}>{fine.status}</Chip>],
    ['Valor', <b key="v">{formatCurrency(fine.valor)}</b>],
  ];
  return (
    <Modal wide title={`Detalhes · ${fine.codigo || fine.ait}`} onClose={onClose}>
      <div className="space-y-4">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 ef-t13">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="ef-t12" style={{ color: 'var(--mute)' }}>
                {k}
              </dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {nic && (
          <div className="card p-4">
            <div className="ef-t13 font-semibold mb-2">Multa original</div>
            {original ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="mono font-bold">{original.codigo}</span>{' '}
                  <span className="mono ef-t12_5">{original.ait}</span>
                  <div className="ef-t12_5 truncate" style={{ color: 'var(--mute)' }}>
                    {original.data} · {original.motivo}
                  </div>
                </div>
                <Btn sm onClick={() => onOpen(original.id)}>
                  Abrir multa original
                </Btn>
              </div>
            ) : (
              <div className="ef-t13" style={{ color: 'var(--mute)' }}>
                A multa original deste vínculo não foi localizada.
              </div>
            )}
          </div>
        )}

        {!nic && (
          <div className="card p-4">
            <div className="ef-t13 font-semibold mb-2">NIC vinculadas ({nics.length})</div>
            {nics.length === 0 ? (
              <div className="ef-t13" style={{ color: 'var(--mute)' }}>
                {liveMode
                  ? 'O vínculo de NIC por ID ainda depende do backend (veja docs/HANDOFF_BACKEND.md).'
                  : 'Nenhuma NIC lançada para esta multa. Use “Lançar multa / NIC” e escolha NIC para vincular a este ID.'}
              </div>
            ) : (
              nics.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between gap-3 ef-py1_5"
                  style={{ borderTop: '1px solid var(--line2)' }}
                >
                  <div>
                    <span className="mono font-bold">{n.codigo}</span>{' '}
                    <Chip tone={getMultaStatusTone(n.status)}>{n.status}</Chip>
                    <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                      {n.data} · {n.motivo}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <b className="mono">{formatCurrency(n.valor)}</b>
                    <Btn sm onClick={() => onOpen(n.id)}>
                      Abrir
                    </Btn>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
