'use client';

import React, { useEffect, useState } from 'react';
import { MalhaPneu } from '@/types/frotawise';
import { pneusService } from '@/services/pneusService';
import { Button, InputField } from '@/components/ui';

export default function MalhaPneusPage() {
  const [malhas, setMalhas] = useState<MalhaPneu[]>([]);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [medida, setMedida] = useState('295/80 R22.5');
  const [aro, setAro] = useState('22.5');
  const [limiteNovo, setLimiteNovo] = useState('80000');
  const [limiteRemold1, setLimiteRemold1] = useState('60000');
  const [limiteRemold2, setLimiteRemold2] = useState('48000');

  useEffect(() => {
    pneusService.listarMalhaPadrao().then(setMalhas);
  }, []);

  const handleCadastrarMalha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca || !modelo) return;

    const novaMalha: MalhaPneu = {
      id: `ML-0${malhas.length + 1}`,
      marca,
      modelo,
      medida,
      aro,
      indiceCarga: '152/148M',
      limiteKmNovo: Number(limiteNovo),
      limiteKmRemold1: Number(limiteRemold1),
      limiteKmRemold2: Number(limiteRemold2),
      sulcoMinimoSegurancaMm: 3.0,
      custoMedioAquisicao: 3250.0,
    };

    setMalhas((prev) => [novaMalha, ...prev]);
    setMarca('');
    setModelo('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Engenharia de Malha de Pneus & Limites de KM por Etapa
        </h1>
        <p className="text-sm text-slate-600">
          Parametrização corporativa de marcas homologadas, medidas de aro e tetos de rodagem antes de cada recapagem.
        </p>
      </div>

      {/* Formulário de Homologação */}
      <form
        onSubmit={handleCadastrarMalha}
        className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5"
      >
        <h3 className="text-base font-bold text-slate-900">
          Cadastrar Nova Especificação na Malha Corporativa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField
            label="Fabricante / Marca"
            placeholder="Ex: Goodyear"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            required
          />
          <InputField
            label="Modelo da Banda"
            placeholder="Ex: KMAX S Gen-2"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            required
          />
          <InputField
            label="Medida Oficial"
            value={medida}
            onChange={(e) => setMedida(e.target.value)}
            required
          />
          <InputField
            label="Aro (Polegadas)"
            value={aro}
            onChange={(e) => setAro(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <InputField
            label="Limite KM — 1ª Vida (Novo)"
            type="number"
            value={limiteNovo}
            onChange={(e) => setLimiteNovo(e.target.value)}
            helperText="Gera alerta amarelo ao atingir 90% deste KM"
          />
          <InputField
            label="Limite KM — 1º Remold"
            type="number"
            value={limiteRemold1}
            onChange={(e) => setLimiteRemold1(e.target.value)}
            helperText="Meta para carcaça de primeira recapagem"
          />
          <InputField
            label="Limite KM — 2º Remold"
            type="number"
            value={limiteRemold2}
            onChange={(e) => setLimiteRemold2(e.target.value)}
            helperText="Ciclo final antes de descarte auditado"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Homologar Padrão na Malha
          </Button>
        </div>
      </form>

      {/* Tabela de Malhas Homologadas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4">Código</th>
              <th className="py-3.5 px-4">Marca / Modelo</th>
              <th className="py-3.5 px-4">Medida & Aro</th>
              <th className="py-3.5 px-4">Teto 1ª Vida (Novo)</th>
              <th className="py-3.5 px-4">Teto 1º Remold</th>
              <th className="py-3.5 px-4">Teto 2º Remold</th>
              <th className="py-3.5 px-4">Sulco Mínimo (TWI)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {malhas.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900">{m.id}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  {m.marca} — {m.modelo}
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {m.medida} (Aro {m.aro})
                </td>
                <td className="py-3.5 px-4 font-bold text-blue-700">
                  {m.limiteKmNovo.toLocaleString('pt-BR')} km
                </td>
                <td className="py-3.5 px-4 font-bold text-amber-700">
                  {m.limiteKmRemold1.toLocaleString('pt-BR')} km
                </td>
                <td className="py-3.5 px-4 font-bold text-purple-700">
                  {m.limiteKmRemold2.toLocaleString('pt-BR')} km
                </td>
                <td className="py-3.5 px-4 font-semibold text-red-700">
                  {m.sulcoMinimoSegurancaMm.toFixed(1)} mm
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
