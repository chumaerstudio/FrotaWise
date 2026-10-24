'use client';

import React, { useState } from 'react';
import { Database, Download, Upload, Settings, CheckCircle2, Plus } from 'lucide-react';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { APP_VERSION, SCHEMA_VERSION, formatNumber } from '@/services/api';
import { findTireRule, normMedida, normTxt } from '@/services/pneusService';
import { Btn, Chip, Empty, Field, SectionHead } from '@/components/ui';
import { RegraModeloPneu } from '@/types/frotawise';

export default function MalhaPneusConfigPage() {
  const {
    company,
    setCompany,
    vehicles,
    setVehicles,
    tires,
    setTires,
    maintenances,
    setMaintenances,
    fines,
    setFines,
    showToast,
    handleExportBackup,
  } = useEstoquePneus();

  const emptyRule = { marca: '', medida: '', km1: '', km2: '', km3: '', kmSucata: '' };
  const [ruleForm, setRuleForm] = useState(emptyRule);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const r = company.regrasPneus;
  const setRule = (k: 'kmEstocar' | 'kmRecapar' | 'kmSucatear', v: string) =>
    setCompany({ ...company, regrasPneus: { ...r, [k]: Number(v) || 0 } });

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(String(ev.target?.result || '{}'));
        if (p.company) setCompany(p.company);
        if (Array.isArray(p.vehicles)) setVehicles(p.vehicles);
        if (Array.isArray(p.tires)) setTires(p.tires);
        if (Array.isArray(p.maintenances)) setMaintenances(p.maintenances);
        if (Array.isArray(p.fines)) setFines(p.fines);
        showToast('Backup restaurado com sucesso!');
      } catch {
        showToast('Arquivo inválido. Selecione um backup .json do FrotaWise.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCompany((p) => ({ ...p, logoUrl: String(ev.target?.result || '') }));
      showToast('Logo atualizada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const marca = ruleForm.marca.trim();
    const kms = {
      km1: Number(ruleForm.km1) || 0,
      km2: Number(ruleForm.km2) || 0,
      km3: Number(ruleForm.km3) || 0,
      kmSucata: Number(ruleForm.kmSucata) || 0,
    };
    if (!marca) return;
    const preenchidos = [kms.km1, kms.km2, kms.km3, kms.kmSucata].filter((n) => n > 0);
    if (preenchidos.length === 0) {
      showToast('Informe ao menos uma quilometragem para a regra.', 'error');
      return;
    }
    if (preenchidos.some((n, i) => i > 0 && n <= preenchidos[i - 1])) {
      showToast('As quilometragens devem crescer: 1ª < 2ª < 3ª recapagem < sucata.', 'error');
      return;
    }
    const item: RegraModeloPneu = {
      id: editingRuleId || 'rg-' + Date.now(),
      marca,
      medida: ruleForm.medida.trim(),
      ...kms,
    };
    const lista = company.regrasModelos || [];
    if (
      lista.some(
        (rg) =>
          rg.id !== item.id &&
          normTxt(rg.marca) === normTxt(item.marca) &&
          normMedida(rg.medida) === normMedida(item.medida)
      )
    ) {
      showToast('Já existe uma regra para este modelo e tamanho. Edite a existente.', 'error');
      return;
    }
    setCompany((prev) => ({
      ...prev,
      regrasModelos: editingRuleId
        ? (prev.regrasModelos || []).map((rg) => (rg.id === editingRuleId ? item : rg))
        : [...(prev.regrasModelos || []), item],
    }));
    showToast(
      editingRuleId
        ? 'Regra atualizada!'
        : 'Regra cadastrada! Os avisos do painel já usam essa quilometragem.'
    );
    setRuleForm(emptyRule);
    setEditingRuleId(null);
  };

  const handleEditRule = (rg: RegraModeloPneu) => {
    setEditingRuleId(rg.id);
    setRuleForm({
      marca: rg.marca,
      medida: rg.medida || '',
      km1: String(rg.km1 || ''),
      km2: String(rg.km2 || ''),
      km3: String(rg.km3 || ''),
      kmSucata: String(rg.kmSucata || ''),
    });
  };

  const handleRemoveRule = (rg: RegraModeloPneu) => {
    setCompany((prev) => ({
      ...prev,
      regrasModelos: (prev.regrasModelos || []).filter((x) => x.id !== rg.id),
    }));
    if (editingRuleId === rg.id) {
      setEditingRuleId(null);
      setRuleForm(emptyRule);
    }
    showToast('Regra removida.');
  };

  return (
    <div className="space-y-5">
      <div className="ef-g-2">
        <div className="card p-6 space-y-5 ef-rise">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 className="ef-t16 font-semibold">Backup e restauração</h3>
              <p className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                Salve ou restaure todos os dados ao trocar de computador, via Pen Drive.
              </p>
            </div>
          </div>
          <Btn v="dark" icon={Download} className="w-full ef-py3" onClick={handleExportBackup}>
            Baixar arquivo de backup
          </Btn>
          <label className="btn btn-primary w-full ef-py3 cursor-pointer">
            <Upload size={16} />
            Restaurar arquivo de backup (.json)
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
          <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
            Sistema v{APP_VERSION} · estrutura de dados {SCHEMA_VERSION}. Os backups de versões
            anteriores são atualizados automaticamente ao restaurar.
          </div>
        </div>

        <div className="card p-6 space-y-4 ef-rise" style={{ animationDelay: '70ms' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--soft)', color: 'var(--ink)' }}
            >
              <Settings size={20} />
            </div>
            <div>
              <h3 className="ef-t16 font-semibold">Empresa e alertas de pneus</h3>
              <p className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                Identidade do sistema e limites de KM para cada ação.
              </p>
            </div>
          </div>
          <Field label="Nome da empresa">
            <input
              className="inp"
              value={company.nomeEmpresa}
              onChange={(e) => setCompany({ ...company, nomeEmpresa: e.target.value })}
            />
          </Field>
          <Field label="CNPJ">
            <input
              className="inp mono"
              value={company.cnpj || ''}
              onChange={(e) => setCompany({ ...company, cnpj: e.target.value })}
            />
          </Field>
          <Field label="Logo personalizada (opcional, substitui a FrotaWise no menu)">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full ef-t13"
              style={{ color: 'var(--ink2)' }}
            />
          </Field>
          {company.logoUrl && (
            <Btn
              sm
              onClick={() => {
                setCompany((p) => ({ ...p, logoUrl: '' }));
                showToast('Logo FrotaWise restaurada.');
              }}
            >
              Usar a logo FrotaWise
            </Btn>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Field label="KM para estocar">
              <input
                type="number"
                className="inp mono"
                value={r.kmEstocar}
                onChange={(e) => setRule('kmEstocar', e.target.value)}
              />
            </Field>
            <Field label="KM para recapar">
              <input
                type="number"
                className="inp mono"
                value={r.kmRecapar}
                onChange={(e) => setRule('kmRecapar', e.target.value)}
              />
            </Field>
            <Field label="KM para sucatear">
              <input
                type="number"
                className="inp mono"
                value={r.kmSucatear}
                onChange={(e) => setRule('kmSucatear', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="card ef-rise" style={{ animationDelay: '140ms' }}>
        <SectionHead
          title="Regras de pneus por modelo (Malha de Pneus)"
          sub="Defina a quilometragem de cada aviso do painel por modelo/marca e tamanho. Pneus sem regra usam os limites gerais acima."
        />
        <form onSubmit={handleSaveRule} className="p-5 space-y-3">
          <div className="ef-g-rule">
            <Field label="Modelo/Marca">
              <input
                required
                className="inp"
                placeholder="Ex: Michelin X Multi Z"
                value={ruleForm.marca}
                onChange={(e) => setRuleForm({ ...ruleForm, marca: e.target.value })}
              />
            </Field>
            <Field label="Tamanho">
              <input
                className="inp mono"
                placeholder="Ex: 295/80 R22.5"
                value={ruleForm.medida}
                onChange={(e) => setRuleForm({ ...ruleForm, medida: e.target.value })}
              />
            </Field>
            <Field label="1ª Recapagem (km)">
              <input
                type="number"
                min="0"
                className="inp mono"
                value={ruleForm.km1}
                onChange={(e) => setRuleForm({ ...ruleForm, km1: e.target.value })}
              />
            </Field>
            <Field label="2ª Recapagem (km)">
              <input
                type="number"
                min="0"
                className="inp mono"
                value={ruleForm.km2}
                onChange={(e) => setRuleForm({ ...ruleForm, km2: e.target.value })}
              />
            </Field>
            <Field label="3ª Recapagem (km)">
              <input
                type="number"
                min="0"
                className="inp mono"
                value={ruleForm.km3}
                onChange={(e) => setRuleForm({ ...ruleForm, km3: e.target.value })}
              />
            </Field>
            <Field label="Sucata (km)">
              <input
                type="number"
                min="0"
                className="inp mono"
                value={ruleForm.kmSucata}
                onChange={(e) => setRuleForm({ ...ruleForm, kmSucata: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="ef-t12_5" style={{ color: 'var(--mute)' }}>
              Use o KM total acumulado do pneu (soma de todas as vidas). Deixe o tamanho em branco
              para valer para qualquer medida.
            </span>
            <div className="flex gap-2">
              {editingRuleId && (
                <Btn
                  type="button"
                  onClick={() => {
                    setEditingRuleId(null);
                    setRuleForm(emptyRule);
                  }}
                >
                  Cancelar edição
                </Btn>
              )}
              <Btn type="submit" v="primary" icon={editingRuleId ? CheckCircle2 : Plus}>
                {editingRuleId ? 'Salvar alterações' : 'Adicionar regra'}
              </Btn>
            </div>
          </div>
        </form>
        {(company.regrasModelos || []).length === 0 ? (
          <div style={{ borderTop: '1px solid var(--line)' }}>
            <Empty
              icon={Settings}
              title="Nenhuma regra por modelo"
              text="Cadastre a primeira regra acima. Enquanto isso, o painel usa os limites gerais."
            />
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ borderTop: '1px solid var(--line)' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Modelo/Marca</th>
                  <th>Tamanho</th>
                  <th className="ef-tr">1ª Recapagem</th>
                  <th className="ef-tr">2ª Recapagem</th>
                  <th className="ef-tr">3ª Recapagem</th>
                  <th className="ef-tr">Sucata</th>
                  <th className="ef-tc">Pneus</th>
                  <th className="ef-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {company.regrasModelos.map((rg) => {
                  const fmt = (n: number) => (Number(n) > 0 ? `${formatNumber(n)} km` : '—');
                  const qtd = tires.filter((t) => {
                    const f = findTireRule(t, company.regrasModelos);
                    return f && f.id === rg.id;
                  }).length;
                  return (
                    <tr key={rg.id}>
                      <td className="font-semibold">{rg.marca}</td>
                      <td className="mono ef-t12_5">{rg.medida || 'Qualquer'}</td>
                      <td className="mono text-right">{fmt(rg.km1)}</td>
                      <td className="mono text-right">{fmt(rg.km2)}</td>
                      <td className="mono text-right">{fmt(rg.km3)}</td>
                      <td className="mono text-right font-bold">{fmt(rg.kmSucata)}</td>
                      <td className="text-center">
                        <Chip tone="teal">{qtd}</Chip>
                      </td>
                      <td className="text-right whitespace-nowrap ef-sx15">
                        <Btn sm onClick={() => handleEditRule(rg)}>
                          Editar
                        </Btn>
                        <Btn sm onClick={() => handleRemoveRule(rg)}>
                          Remover
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
