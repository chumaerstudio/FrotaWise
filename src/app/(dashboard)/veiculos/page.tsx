'use client';

import React from 'react';
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
  } = useEstoquePneus();

  return (
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
  );
}
