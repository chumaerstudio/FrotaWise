'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Disc, ChevronRight, Search, MoreHorizontal } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Field, Modal, Plate, SectionHead } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function VeiculosPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const {
    vehicles,
    tires,
    maintenances,
    fines,
    setSelectedChassisVehicleId,
    setDetailVehicleId,
    liveMode, runLiveMutation, pendingMutationCount,
  } = useEstoquePneus();

  const userVehicleCount = usuario ? vehicles.filter(v => v.criadoPorId === usuario.id).length : 0;
  const canEdit = liveMode && usuario?.capabilities.canManageVehicles;
  const canDelete = liveMode && usuario?.papel === 'ADMIN';
  const [editing,setEditing] = useState<(typeof vehicles)[number] | null>(null);
  const [deleting, setDeleting] = useState<(typeof vehicles)[number] | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => vehicles.filter(v => {
    const matches = `${v.placa} ${v.modelo} ${v.categoria}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
    return matches && (statusFilter === 'todos' || v.status === statusFilter);
  }).sort((a,b) => a.placa.localeCompare(b.placa)), [vehicles, query, statusFilter]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 12) - 1));
  const visible = filtered.slice(currentPage * 12, currentPage * 12 + 12);
  const resetPage = () => setPage(0);
  const saveVehicle = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return;
    const ok = await runLiveMutation('patch', `/veiculos/${editing.id}`, {
      placa: editing.placa, uf: editing.uf, modelo: editing.modelo,
      categoria: editing.categoria, eixos: editing.eixos, status: editing.status,
      // O hodômetro não é alterado em uma edição administrativa simples.
    }, 'Veículo atualizado.');
    if (ok) setEditing(null);
  };
  return (
    <div className="space-y-4">
      {liveMode && editing && <Modal title={`Editar veículo ${editing.placa}`} onClose={() => setEditing(null)} wide><form className="space-y-4" onSubmit={saveVehicle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['placa','uf','modelo','categoria'] as const).map(k=><Field key={k} label={{placa:'Placa',uf:'UF',modelo:'Modelo',categoria:'Categoria'}[k]}>
            <input className="inp" list={k === 'categoria' ? 'frotawise-categorias-veiculo-edit' : undefined} value={editing[k]} onChange={e=>setEditing({...editing,[k]:e.target.value})} required/></Field>)}
          <datalist id="frotawise-categorias-veiculo-edit">
            <option value="Carreta" /><option value="Cavalo Mecânico" /><option value="Caminhão Toco" />
            <option value="Caminhão Truck" /><option value="Bitruck" />
          </datalist>
          <Field label="Quantidade de eixos"><input type="number" className="inp" value={editing.eixos} min="2" max="6" onChange={e=>setEditing({...editing,eixos:Number(e.target.value)})}/></Field>
          <Field label="Situação"><select className="inp" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as typeof editing.status})}>
            <option value="Operando">Operando</option><option value="Manutenção">Manutenção</option></select></Field>
        </div>
        <p className="ef-field-help">O hodômetro é atualizado pelos lançamentos da operação, não por esta edição.</p>
        <div className="flex flex-wrap justify-end gap-2"><Btn type="button" disabled={pendingMutationCount > 0} onClick={()=>setEditing(null)}>Cancelar</Btn><Btn type="submit" v="primary" loading={pendingMutationCount > 0} loadingLabel="Salvando…">Salvar alterações</Btn></div>
      </form></Modal>}
      <div className="card overflow-hidden">
      <SectionHead title="Frota de veículos" sub="Consulte um veículo pela placa para acessar sua ficha operacional.">
        <div className="flex flex-wrap items-center gap-2">
          {usuario?.limiteVeiculos != null && (
            <Chip tone={userVehicleCount >= usuario.limiteVeiculos ? 'red' : 'blue'}>
              Cota do acesso: {userVehicleCount}/{usuario.limiteVeiculos}
            </Chip>
          )}
          <Chip tone="gray">{vehicles.length} equipamentos</Chip>
        </div>
      </SectionHead>
      <div className="ef-list-toolbar">
        <label className="ef-list-search"><Search size={16}/><span className="sr-only">Buscar veículos</span><input placeholder="Placa, modelo ou categoria…" value={query} onChange={e => { setQuery(e.target.value); resetPage(); }}/></label>
        <select aria-label="Filtrar por situação" className="inp ef-list-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); resetPage(); }}><option value="todos">Todas as situações</option><option value="Operando">Operando</option><option value="Manutenção">Em manutenção</option></select>
        <span className="ef-list-count">{filtered.length} de {vehicles.length}</span>
      </div>
      {vehicles.length === 0 ? (
        <Empty
          icon={Truck}
          title="Nenhum veículo cadastrado"
          text="Cadastre o primeiro veículo para montar pneus no chassi."
        />
      ) : filtered.length === 0 ? <Empty icon={Search} title="Nenhum veículo encontrado" text="Experimente outro termo ou remova o filtro de situação." /> : (
        <>
        <div className="overflow-x-auto ef-desktop-vehicles">
          <table className="tbl">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Categoria</th>
                <th>Modelo</th>
                <th className="ef-tc">Eixos</th>
                <th className="ef-tc">Pneus montados</th>
                <th className="ef-tr">Hodômetro</th>
                <th className="ef-tr">Despesas</th>
                <th className="ef-tr">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((v) => {
                const mounted = tires.filter((t) => t.veiculoAtualId === v.id).length;
                const cost =
                  maintenances
                    .filter((m) => m.veiculoId === v.id)
                    .reduce((s, m) => s + Number(m.valor || 0), 0) +
                  fines
                    .filter((f) => f.veiculoId === v.id)
                    .reduce((s, f) => s + Number(f.valor || 0), 0);
                return (
                  <tr key={v.id}>
                    <td>
                      <button type="button" className="ef-plate-link" onClick={() => setDetailVehicleId(v.id)} title={`Abrir ficha de ${v.placa}`}><Plate v={v}/></button>
                    </td>
                    <td className="font-medium">{v.categoria}</td>
                    <td style={{ color: 'var(--ink2)' }}>{v.modelo}</td>
                    <td className="mono text-center font-semibold">{v.eixos}</td>
                    <td className="text-center">
                      <Chip tone="teal">
                        <Disc size={13} />
                        {mounted} pneus
                      </Chip>
                    </td>
                    <td className="mono text-right">{formatNumber(v.kmAtual)} km</td>
                    <td className="mono text-right font-bold">{formatCurrency(cost)}</td>
                    <td className="text-right whitespace-nowrap">
                      <div className="ef-table-actions">
                      <Btn
                        sm
                        v="soft"
                        onClick={() => {
                          setSelectedChassisVehicleId(v.id);
                          router.push('/pneus');
                        }}
                      >
                        Ver no chassi <ChevronRight size={14} />
                      </Btn>
                      <details className="ef-row-menu"><summary aria-label={`Mais ações do veículo ${v.placa}`}><MoreHorizontal size={19}/></summary><div className="ef-row-menu-pop"><button type="button" onClick={() => setDetailVehicleId(v.id)}>Abrir detalhes</button>{canEdit && <button type="button" onClick={() => setEditing({...v})}>Editar veículo</button>}{canDelete && <button type="button" className="ef-danger-text" onClick={() => setDeleting(v)}>Excluir veículo</button>}</div></details>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="ef-mobile-vehicle-list">{visible.map(v => {
          const mounted = tires.filter(t => t.veiculoAtualId === v.id).length;
          return <article key={v.id} className="ef-mobile-vehicle-card"><div className="ef-mobile-vehicle-head"><button type="button" className="ef-plate-link" onClick={() => setDetailVehicleId(v.id)}><Plate v={v}/></button><Chip tone={v.status === 'Operando' ? 'teal' : 'amber'}>{v.status}</Chip></div><h3>{v.modelo}</h3><p>{v.categoria}</p><div className="ef-mobile-vehicle-facts"><span><small>Hodômetro</small><b>{formatNumber(v.kmAtual)} km</b></span><span><small>Pneus montados</small><b>{mounted} pneus</b></span><span><small>Eixos</small><b>{v.eixos}</b></span></div><div className="ef-mobile-vehicle-actions"><Btn sm onClick={() => setDetailVehicleId(v.id)}>Abrir ficha</Btn><Btn sm v="primary" onClick={() => { setSelectedChassisVehicleId(v.id); router.push('/pneus'); }}>Ver chassi</Btn>{canEdit && <Btn sm onClick={() => setEditing({...v})}>Editar</Btn>}{canDelete && <Btn sm onClick={() => setDeleting(v)}>Excluir</Btn>}</div></article>;
        })}</div>
        </>
      )}
      {filtered.length > 12 && <div className="ef-pagination"><span>Exibindo {currentPage * 12 + 1}–{Math.min((currentPage + 1) * 12, filtered.length)} de {filtered.length}</span><div><Btn sm disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Btn><Btn sm disabled={(currentPage+1)*12 >= filtered.length} onClick={() => setPage(currentPage + 1)}>Próxima</Btn></div></div>}
      </div>
      {deleting && (
        <ConfirmDialog
          title={`Excluir veículo ${deleting.placa}?`}
          description="A placa e o modelo ficam no histórico dos pneus. Pneus montados, viagens e lançamentos vinculados impedem a exclusão."
          confirmLabel="Excluir veículo"
          onCancel={() => setDeleting(null)}
          onConfirm={() => runLiveMutation('delete', `/veiculos/${deleting.id}`, undefined, 'Veículo excluído.')}
        />
      )}
    </div>
  );
}
