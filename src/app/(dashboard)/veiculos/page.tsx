'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Disc, Plus, ChevronRight } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { formatCurrency, formatNumber } from '@/services/api';
import { Btn, Chip, Empty, Plate, SectionHead } from '@/components/ui';

export default function VeiculosPage() {
  const router = useRouter();
  const {
    vehicles,
    tires,
    maintenances,
    fines,
    setSelectedChassisVehicleId,
    setDetailVehicleId,
    setShowVehicleModal,
    liveMode, runLiveMutation,
  } = useEstoquePneus();

  const [editing,setEditing] = useState<(typeof vehicles)[number] | null>(null);
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
      {liveMode && editing && <form className="card p-5 space-y-3" onSubmit={saveVehicle}>
        <h2 className="font-bold">Editar veículo {editing.placa}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['placa','uf','modelo','categoria'] as const).map(k=><label key={k}>{k}
            <input className="inp" value={editing[k]} onChange={e=>setEditing({...editing,[k]:e.target.value})} required/></label>)}
          <label>Eixos <input type="number" className="inp" value={editing.eixos} min="2" max="6" onChange={e=>setEditing({...editing,eixos:Number(e.target.value)})}/></label>
          <label>Status <select className="inp" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as typeof editing.status})}>
            <option value="Operando">Operando</option><option value="Manutenção">Manutenção</option></select></label>
        </div>
        <div className="flex gap-2"><button type="submit" className="btn btn-primary">Salvar no Supabase</button>
          <button type="button" className="btn" onClick={()=>setEditing(null)}>Cancelar</button></div>
      </form>}
      <div className="card overflow-hidden">
      <SectionHead
        title="Frota de veículos"
        sub="Cavalos mecânicos, caminhões e utilitários cadastrados"
      >
        <Btn v="primary" icon={Plus} onClick={() => setShowVehicleModal(true)}>
          Cadastrar veículo
        </Btn>
      </SectionHead>
      {vehicles.length === 0 ? (
        <Empty
          icon={Truck}
          title="Nenhum veículo cadastrado"
          text="Cadastre o primeiro veículo para montar pneus no chassi."
        />
      ) : (
        <div className="overflow-x-auto">
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
              {vehicles.map((v) => {
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
                      <Plate v={v} />
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
                    <td className="text-right whitespace-nowrap ef-sx15">
                      {liveMode && <>
                        <Btn sm onClick={() => setEditing({...v})}>Editar</Btn>
                        <Btn sm onClick={() => {
                          if (window.confirm(`Excluir o veículo ${v.placa}? O servidor pode negar quando houver vínculos.`)) {
                            void runLiveMutation('delete', `/veiculos/${v.id}`, undefined, 'Veículo excluído.');
                          }
                        }}>Excluir</Btn>
                      </>}
                      <Btn sm onClick={() => setDetailVehicleId(v.id)}>
                        Detalhes
                      </Btn>
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
