'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Disc, FileWarning, Fuel, Route, Search, Truck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { Modal } from '@/components/ui';

type Result = { key: string; title: string; description: string; keywords: string; href: string; icon: LucideIcon; tireVehicle?: string };

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { vehicles, tires, maintenances, fines, fuelings, trips, setSelectedChassisVehicleId } = useEstoquePneus();
  const [query, setQuery] = useState('');
  useEffect(() => { if (open) setQuery(''); }, [open]);

  const results = useMemo<Result[]>(() => {
    const plate = (id: string) => vehicles.find(v => v.id === id)?.placa || '';
    const records: Result[] = [
      ...vehicles.map(v => ({ key: `v-${v.id}`, title: v.placa, description: `${v.modelo} · ${v.categoria}`, keywords: `${v.placa} ${v.modelo} ${v.categoria}`, href: '/veiculos', icon: Truck })),
      ...tires.map(t => ({ key: `t-${t.id}`, title: `Pneu #${t.fogo}`, description: `${t.marca} · ${t.medida}${t.veiculoAtualId ? ` · ${plate(t.veiculoAtualId)}` : ''}`, keywords: `${t.fogo} ${t.marca} ${t.medida} ${plate(t.veiculoAtualId)}`, href: '/pneus', tireVehicle: t.veiculoAtualId, icon: Disc })),
      ...maintenances.map(m => ({ key: `m-${m.id}`, title: m.descricao, description: `Manutenção · ${plate(m.veiculoId)} · O.S. ${m.osNumero}`, keywords: `${m.descricao} ${plate(m.veiculoId)} ${m.osNumero} ${m.fornecedor}`, href: '/custos-multas?aba=maintenances', icon: Wrench })),
      ...fines.map(f => ({ key: `f-${f.id}`, title: f.motivo, description: `Multa · ${plate(f.veiculoId)} · ${f.ait}`, keywords: `${f.motivo} ${plate(f.veiculoId)} ${f.ait} ${f.motorista}`, href: '/custos-multas?aba=fines', icon: FileWarning })),
      ...fuelings.map(f => ({ key: `a-${f.id}`, title: `${f.tipo} · ${plate(f.veiculoId)}`, description: `Abastecimento · ${f.data} · ${f.fornecedor}`, keywords: `${plate(f.veiculoId)} ${f.fornecedor} ${f.data}`, href: '/abastecimento', icon: Fuel })),
      ...trips.map(t => ({ key: `vi-${t.id}`, title: `Viagem #${t.numero} · ${plate(t.veiculoId)}`, description: [t.origem, t.destino].filter(Boolean).join(' → ') || t.data, keywords: `${t.numero} ${plate(t.veiculoId)} ${t.origem || ''} ${t.destino || ''}`, href: '/viagens', icon: Route })),
    ];
    const terms = query.trim().toLocaleLowerCase('pt-BR').split(/\s+/).filter(Boolean);
    return terms.length ? records.filter(r => terms.every(term => `${r.title} ${r.description} ${r.keywords}`.toLocaleLowerCase('pt-BR').includes(term))).slice(0, 12) : [];
  }, [query, vehicles, tires, maintenances, fines, fuelings, trips]);

  if (!open) return null;
  const navigate = (r: Result) => {
    if (r.tireVehicle) setSelectedChassisVehicleId(r.tireVehicle);
    onClose();
    router.push(r.href);
  };
  return (
    <Modal title="Buscar na frota" wide onClose={onClose}>
      <div className="ef-global-search">
        <label htmlFor="frotawise-global-query" className="sr-only">Buscar por placa, pneu ou registro</label>
        <div className="ef-global-search-input"><Search size={19} /><input id="frotawise-global-query" autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Placa, número do pneu, oficina, viagem…" /></div>
        <p className="ef-global-search-hint">Pesquise nos registros já carregados da sua empresa.</p>
        {query.trim() ? (
          results.length ? (
            <ul className="ef-search-results" aria-label="Resultados da busca">
              {results.map(r => <li key={r.key}><button type="button" onClick={() => navigate(r)}>
                <span className="ef-search-result-icon"><r.icon size={17} /></span>
                <span className="min-w-0"><b>{r.title}</b><small>{r.description}</small></span>
                <span className="ef-search-arrow" aria-hidden="true">↗</span>
              </button></li>)}
            </ul>
          ) : <div className="ef-search-empty">Nenhum registro encontrado. Experimente outra placa, número ou descrição.</div>
        ) : <div className="ef-search-empty">Comece digitando para localizar veículos, pneus e lançamentos.</div>}
      </div>
    </Modal>
  );
}
