'use client';

import React, { useState } from 'react';
import { Field, FormActions, Modal } from '@/components/ui';
import { CATEGORIAS_CUSTO_FIXO, validarCustoFixo } from '@/services/custosFixosService';
import { localToday } from '@/services/financeiroLocal';
import type { CategoriaCustoFixo, CustoFixo, Veiculo } from '@/types/frotawise';

interface Props {
  vehicles: Veiculo[];
  custo: CustoFixo | null;
  defaultVeiculoId?: string;
  onSave: (c: CustoFixo) => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

export function CustoFixoModal({ vehicles, custo, defaultVeiculoId = '', onSave, onClose, onError }: Props) {
  const [f, setF] = useState({
    veiculoId: custo?.veiculoId ?? defaultVeiculoId,
    categoria: (custo?.categoria ?? 'Seguro') as CategoriaCustoFixo,
    descricao: custo?.descricao ?? '',
    valorMensal: custo ? String(custo.valorMensal) : '',
    diaVencimento: custo ? String(custo.diaVencimento) : '10',
    inicio: custo?.inicio ?? localToday().slice(0, 7),
    fim: custo?.fim ?? '',
    ativo: custo?.ativo ?? true,
    obs: custo?.obs ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft = {
      veiculoId: f.veiculoId,
      descricao: f.descricao.trim() || f.categoria,
      valorMensal: Number(f.valorMensal),
      diaVencimento: Number(f.diaVencimento),
      inicio: f.inicio,
      fim: f.fim || null,
    };
    const erro = validarCustoFixo(draft);
    if (erro) return onError(erro);
    onSave({
      id: custo?.id ?? `cf-${Date.now()}`,
      ...draft,
      categoria: f.categoria,
      ativo: f.ativo,
      obs: f.obs.trim(),
    });
  };

  return (
    <Modal title={custo ? 'Editar custo fixo' : 'Lançar custo fixo'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Veículo">
          <select required className="inp" value={f.veiculoId} onChange={(e) => setF({ ...f, veiculoId: e.target.value })}>
            <option value="">Selecione o veículo...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.modelo}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria">
            <select
              className="inp"
              value={f.categoria}
              onChange={(e) => setF({ ...f, categoria: e.target.value as CategoriaCustoFixo })}
            >
              {CATEGORIAS_CUSTO_FIXO.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Descrição">
            <input
              className="inp"
              placeholder={f.categoria}
              value={f.descricao}
              onChange={(e) => setF({ ...f, descricao: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor mensal (R$)">
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              className="inp mono"
              value={f.valorMensal}
              onChange={(e) => setF({ ...f, valorMensal: e.target.value })}
            />
          </Field>
          <Field label="Dia do vencimento">
            <input
              required
              type="number"
              min="1"
              max="31"
              className="inp mono"
              value={f.diaVencimento}
              onChange={(e) => setF({ ...f, diaVencimento: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Início (mês)">
            <input required type="month" className="inp mono" value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} />
          </Field>
          <Field label="Fim (opcional)">
            <input type="month" className="inp mono" value={f.fim} onChange={(e) => setF({ ...f, fim: e.target.value })} />
          </Field>
        </div>
        <label className="flex items-center gap-2 ef-t13">
          <input type="checkbox" checked={f.ativo} onChange={(e) => setF({ ...f, ativo: e.target.checked })} />
          Custo ativo (lança todo mês no Financeiro)
        </label>
        <Field label="Observações">
          <input className="inp" value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} />
        </Field>
        <p className="ef-t12" style={{ color: 'var(--mute)' }}>
          Cada mês vira um pagamento no Financeiro, com vencimento no dia escolhido. Sem mês final, o custo segue
          lançando mês a mês.
        </p>
        <FormActions onCancel={onClose} label={custo ? 'Salvar alterações' : 'Salvar custo fixo'} v="primary" />
      </form>
    </Modal>
  );
}
