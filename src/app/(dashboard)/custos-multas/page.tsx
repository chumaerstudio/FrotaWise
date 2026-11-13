'use client';

import React, { useMemo, useState } from 'react';
<<<<<<< HEAD
import { Wrench, FileWarning, Plus } from 'lucide-react';
=======
import { Wrench, FileWarning, Plus, Calendar } from 'lucide-react';
>>>>>>> 94e87f8 (Novas atualizações)
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Modal, Plate, PlateFilter } from '@/components/ui';
import { getMultaStatusTone } from '@/services/statusTones';
import { ehNic, multaOriginalDaNic, nicsDaMulta, normPlaca } from '@/services/multasService';
<<<<<<< HEAD
import type { Multa } from '@/types/frotawise';
=======
import { CustoFixoModal } from '@/components/custos/CustoFixoModal';
import { idCompetencia, situacaoDoCusto, totalMensalVigente, vencimentoDaCompetencia, vigenteNoMes } from '@/services/custosFixosService';
import { localToday } from '@/services/financeiroLocal';
import type { CustoFixo, Multa } from '@/types/frotawise';
>>>>>>> 94e87f8 (Novas atualizações)

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
<<<<<<< HEAD
    liveMode,
  } = useEstoquePneus();

  const [expenseSubTab, setExpenseSubTab] = useState<'maintenances' | 'fines'>('maintenances');
=======
    custosFixos,
    setCustosFixos,
    pagamentos,
    setPagamentos,
    showToast,
    liveMode,
  } = useEstoquePneus();

  const [expenseSubTab, setExpenseSubTab] = useState<'maintenances' | 'fines' | 'fixed'>('maintenances');
  const [fixedPlate, setFixedPlate] = useState('');
  const [fixedModal, setFixedModal] = useState<{ custo: CustoFixo | null } | null>(null);
  const hoje = localToday();
  const mesAtual = hoje.slice(0, 7);
>>>>>>> 94e87f8 (Novas atualizações)
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
<<<<<<< HEAD
=======

  const visibleFixed = useMemo(
    () =>
      custosFixos
        .filter((c) => matchPlate(c.veiculoId, fixedPlate))
        .sort((a, b) => (plateOf(a.veiculoId) || '').localeCompare(plateOf(b.veiculoId) || '') || a.descricao.localeCompare(b.descricao)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [custosFixos, fixedPlate, vehicles]
  );
  const totalFixoMes = totalMensalVigente(custosFixos, mesAtual);
  const porVeiculo = useMemo(
    () =>
      vehicles
        .map((v) => ({ v, total: totalMensalVigente(custosFixos, mesAtual, v.id) }))
        .filter((x) => x.total > 0),
    [vehicles, custosFixos, mesAtual]
  );
  // Situação do mês atual no Financeiro (a baixa é feita lá).
  const statusFinanceiro = (c: CustoFixo) => {
    if (!vigenteNoMes(c, mesAtual)) return null;
    const plan = pagamentos.find((p) => p.origem === 'custoFixo' && p.origemId === idCompetencia(c.id, mesAtual));
    const venc = vencimentoDaCompetencia(mesAtual, c.diaVencimento);
    if (plan?.pagas?.[0]) return { label: 'Pago', tone: 'teal' as const, venc };
    return venc < hoje ? { label: 'Vencido', tone: 'red' as const, venc } : { label: 'A vencer', tone: 'blue' as const, venc };
  };
  const saveFixed = (c: CustoFixo) => {
    const exists = custosFixos.some((x) => x.id === c.id);
    setCustosFixos((p) => (exists ? p.map((x) => (x.id === c.id ? c : x)) : [c, ...p]));
    setFixedModal(null);
    showToast(
      exists
        ? 'Custo fixo atualizado. O Financeiro já reflete a alteração.'
        : `Custo fixo lançado: ${formatCurrency(c.valorMensal)}/mês no Financeiro.`
    );
  };
  const deleteFixed = (c: CustoFixo) => {
    if (
      !window.confirm(
        `Excluir o custo fixo "${c.descricao}" (${plateOf(c.veiculoId) || 'N/A'})?\n\nTodos os meses dele saem do Financeiro, inclusive os já pagos. Para manter o histórico, use Editar e informe o mês final ou desative o custo.`
      )
    )
      return;
    setCustosFixos((p) => p.filter((x) => x.id !== c.id));
    setPagamentos((p) => p.filter((x) => !(x.origem === 'custoFixo' && x.origemId.startsWith(`${c.id}:`))));
    showToast('Custo fixo excluído.');
  };
>>>>>>> 94e87f8 (Novas atualizações)

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
          <button
            role="tab"
            className={expenseSubTab === 'fixed' ? 'on' : ''}
            onClick={() => setExpenseSubTab('fixed')}
          >
            <Calendar size={15} />
            Custo Fixo por Veículo ({custosFixos.length}) · {formatCurrency(totalFixoMes)}/mês
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Btn v="dark" icon={Plus} onClick={() => setShowMaintenanceModal(true)}>
            Lançar manutenção
          </Btn>
          <Btn v="danger" icon={Plus} onClick={() => setShowFineModal(true)}>
            Lançar multa / NIC
          </Btn>
          {!liveMode && (
            <Btn v="primary" icon={Plus} onClick={() => setFixedModal({ custo: null })}>
              Custo fixo
            </Btn>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
<<<<<<< HEAD
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
=======
        {expenseSubTab === 'maintenances' ? (
          <PlateFilter id="plate-maint" value={maintPlate} onChange={setMaintPlate} plates={plates} />
        ) : expenseSubTab === 'fines' ? (
          <PlateFilter id="plate-fines" value={finePlate} onChange={setFinePlate} plates={plates} />
        ) : (
          <PlateFilter id="plate-fixed" value={fixedPlate} onChange={setFixedPlate} plates={plates} />
        )}
        {expenseSubTab !== 'fixed' && (expenseSubTab === 'maintenances' ? maintPlate : finePlate).trim() && (
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
        {expenseSubTab === 'fixed' ? (
          liveMode ? (
            <Empty
              icon={Calendar}
              title="Custo fixo indisponível no modo API"
              text="O backend atual ainda não possui custos fixos. No modo DEMO/offline a aba funciona e sincroniza com o Financeiro."
            />
          ) : (
            <>
              <div className="px-5 py-4 flex flex-wrap items-center gap-2" style={{ borderBottom: '1px solid var(--line2)' }}>
                <span className="ef-t13 font-semibold mr-1">Fixo mensal por veículo:</span>
                {porVeiculo.length === 0 ? (
                  <span className="ef-t13" style={{ color: 'var(--mute)' }}>nenhum custo vigente neste mês</span>
                ) : (
                  porVeiculo.map(({ v, total }) => (
                    <Chip key={v.id} tone="blue">
                      <span className="mono">{v.placa}</span> · {formatCurrency(total)}/mês
                    </Chip>
                  ))
                )}
                <span className="ef-t12_5 ml-auto" style={{ color: 'var(--mute)' }}>
                  Total do mês: <b className="mono">{formatCurrency(totalFixoMes)}</b> · lançado automaticamente no Financeiro
                </span>
              </div>
              {visibleFixed.length === 0 ? (
                <Empty
                  icon={Calendar}
                  title={custosFixos.length === 0 ? 'Nenhum custo fixo lançado' : 'Nenhum custo fixo para esta placa'}
                  text={
                    custosFixos.length === 0
                      ? 'Lance seguro, IPVA, rastreador, financiamento… Cada mês entra sozinho no Financeiro.'
                      : 'Ajuste ou limpe o filtro de placa.'
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Veículo</th>
                        <th>Custo</th>
                        <th className="ef-tr">Valor mensal</th>
                        <th className="ef-tc">Vencimento</th>
                        <th>Vigência</th>
                        <th className="ef-tc">Situação</th>
                        <th className="ef-tc">Mês atual (Financeiro)</th>
                        <th className="ef-tr">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleFixed.map((c) => {
                        const veh = vehicles.find((v) => v.id === c.veiculoId);
                        const sit = situacaoDoCusto(c, mesAtual);
                        const fin = statusFinanceiro(c);
                        return (
                          <tr key={c.id}>
                            <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                            <td>
                              <div className="font-semibold">{c.descricao}</div>
                              <div className="ef-t12" style={{ color: 'var(--mute)' }}>{c.categoria}{c.obs ? ` · ${c.obs}` : ''}</div>
                            </td>
                            <td className="mono text-right font-bold whitespace-nowrap">{formatCurrency(c.valorMensal)}</td>
                            <td className="mono text-center">dia {c.diaVencimento}</td>
                            <td className="mono whitespace-nowrap ef-t13">
                              {c.inicio.split('-').reverse().join('/')} → {c.fim ? c.fim.split('-').reverse().join('/') : 'sem fim'}
                            </td>
                            <td className="text-center">
                              <Chip tone={sit === 'Ativo' ? 'teal' : sit === 'Futuro' ? 'blue' : 'gray'}>{sit}</Chip>
                            </td>
                            <td className="text-center">
                              {fin ? <Chip tone={fin.tone}>{fin.label} · {fin.venc.split('-').reverse().slice(0, 2).join('/')}</Chip> : <span style={{ color: 'var(--mute)' }}>—</span>}
                            </td>
                            <td className="text-right whitespace-nowrap ef-sx15">
                              <Btn sm onClick={() => setFixedModal({ custo: c })}>Editar</Btn>
                              <Btn sm className="ef-del" onClick={() => deleteFixed(c)}>Excluir</Btn>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )
        ) : expenseSubTab === 'maintenances' ? (
>>>>>>> 94e87f8 (Novas atualizações)
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

<<<<<<< HEAD
=======
      {fixedModal && (
        <CustoFixoModal
          vehicles={vehicles}
          custo={fixedModal.custo}
          defaultVeiculoId={fixedPlate ? vehicles.find((v) => normPlaca(v.placa) === normPlaca(fixedPlate))?.id : undefined}
          onSave={saveFixed}
          onClose={() => setFixedModal(null)}
          onError={(m) => showToast(m, 'error')}
        />
      )}

>>>>>>> 94e87f8 (Novas atualizações)
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
