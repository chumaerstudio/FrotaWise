'use client';

import React, { useState } from 'react';
import { MotivoRetiradaPneu, PayloadRetiradaPneu, Pneu } from '@/types/frotawise';
import { Button, InputField, ModalCorporativo } from '@/components/ui';

interface RetiradaPneuModalProps {
  aberto: boolean;
  pneuSelecionado: Pneu | null;
  aoFechar: () => void;
  aoConfirmarRetirada: (payload: PayloadRetiradaPneu) => Promise<void>;
}

export const RetiradaPneuModal: React.FC<RetiradaPneuModalProps> = ({
  aberto,
  pneuSelecionado,
  aoFechar,
  aoConfirmarRetirada,
}) => {
  const [odometroKm, setOdometroKm] = useState<string>('284950');
  const [sulcoMm, setSulcoMm] = useState<string>(
    pneuSelecionado ? String(pneuSelecionado.sulcoAtualMm) : '3.2'
  );
  const [motivo, setMotivo] = useState<MotivoRetiradaPneu>('ENVIO_REMOLD');
  const [fornecedor, setFornecedor] = useState<string>('Vipal Recapadora Industrial');
  const [observacoes, setObservacoes] = useState<string>(
    'Carcaça íntegra sem avarias estruturais, apta para recapagem a frio.'
  );
  const [enviando, setEnviando] = useState<boolean>(false);

  if (!pneuSelecionado) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    await aoConfirmarRetirada({
      pneuId: pneuSelecionado.id,
      veiculoId: pneuSelecionado.veiculoId || pneuSelecionado.veiculoPlaca || 'FROTA-PADRAO',
      odometroRetiradaKm: Number(odometroKm),
      sulcoMedidoMm: Number(sulcoMm),
      motivo,
      fornecedorDestino: fornecedor,
      observacoesTecnicas: observacoes,
    });
    setEnviando(false);
    aoFechar();
  };

  return (
    <ModalCorporativo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={`Ordem de Retirada de Pneu — Fogo ${pneuSelecionado.numeroFogo}`}
      subtitulo={`Veículo: ${pneuSelecionado.veiculoPlaca || 'N/A'} | Posição Eixo: ${
        pneuSelecionado.posicaoEixo || 'N/A'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Odômetro do Veículo (KM)"
            type="number"
            required
            value={odometroKm}
            onChange={(e) => setOdometroKm(e.target.value)}
          />
          <InputField
            label="Sulco Medido (mm)"
            type="number"
            step="0.1"
            required
            value={sulcoMm}
            onChange={(e) => setSulcoMm(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Motivo Técnico da Retirada
          </label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value as MotivoRetiradaPneu)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ENVIO_REMOLD">Envio para Recapagem (Remold Programado)</option>
            <option value="RODIZIO">Rodízio Preventivo entre Eixos</option>
            <option value="FURO_REPARO">Vulcanização / Reparo de Furo</option>
            <option value="DESCARTE_SUCATA">Condenação de Carcaça (Sucata)</option>
          </select>
        </div>

        <InputField
          label="Fornecedor / Oficina Destino"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
        />

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Laudo / Observações do Borracheiro
          </label>
          <textarea
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={enviando}>
            {enviando ? 'Processando Ordem...' : 'Confirmar Retirada e Gerar OS'}
          </Button>
        </div>
      </form>
    </ModalCorporativo>
  );
};
