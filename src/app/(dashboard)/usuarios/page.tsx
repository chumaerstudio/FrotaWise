'use client';

import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { KeyRound, Plus, Search, ShieldCheck, UserCog, Users, UserX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { httpClient } from '@/lib/http/client';
import { friendlyError } from '@/lib/errors';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { Btn, Chip, Empty, Field, FormActions, Modal, PageSkeleton, SectionHead } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';

type User = { id: string; nome: string; email: string; role: 'ADMIN' | 'OPERADOR' | 'DIRETOR'; ativo: boolean; permitirIpExterno: boolean };
const ROLE_NAMES: Record<User['role'], string> = { ADMIN: 'Administrador', DIRETOR: 'Diretor', OPERADOR: 'Operador' };
const ROLE_DESCRIPTIONS: Record<User['role'], string> = {
  ADMIN: 'Gerencia contas, acessos e configurações da empresa.',
  DIRETOR: 'Acessa as operações permitidas ao perfil de direção.',
  OPERADOR: 'Executa as operações autorizadas para operadores.',
};

export default function UsuariosPage() {
  const { usuario, carregando, autenticado } = useAuth();
  const { showToast } = useEstoquePneus();
  const [users, setUsers] = useState<User[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', password: '', role: 'OPERADOR' as User['role'] });
  const [editing, setEditing] = useState<User | null>(null);
  const [roleDraft, setRoleDraft] = useState<User['role']>('OPERADOR');
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [statusUser, setStatusUser] = useState<User | null>(null);
  const isAdmin = usuario?.papel === 'ADMIN';

  const load = useCallback(async () => {
    if (!isAdmin) { setLoadingUsers(false); return; }
    setLoadingUsers(true); setLoadError('');
    try { const response = await httpClient.get<User[]>('/usuarios'); setUsers(response.data); }
    catch (error) { setLoadError(friendlyError(error, 'Não foi possível carregar os usuários.')); }
    finally { setLoadingUsers(false); }
  }, [isAdmin]);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => users.filter(u => `${u.nome} ${u.email} ${ROLE_NAMES[u.role]}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [users, query]);
  const items = visible.slice(page * 12, page * 12 + 12);
  useEffect(() => { setPage(0); }, [query]);
  const update = async (u: User, patch: Partial<User>) => {
    setBusy(true);
    try { await httpClient.patch(`/usuarios/${u.id}`, patch); await load(); showToast('Acesso do usuário atualizado.'); return true; }
    catch (error) { showToast(friendlyError(error), 'error'); return false; }
    finally { setBusy(false); }
  };
  const create = async (event: FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true);
    try {
      await httpClient.post('/usuarios', { ...form, permitirIpExterno: false });
      setForm({ nome: '', email: '', password: '', role: 'OPERADOR' });
      setCreateOpen(false); await load(); showToast('Usuário cadastrado com sucesso.');
    } catch (error) { showToast(friendlyError(error), 'error'); }
    finally { setBusy(false); }
  };
  const reset = async (event: FormEvent) => {
    event.preventDefault(); if (!resetUser || busy) return;
    if (resetPassword.length < 12) { showToast('Informe uma senha de pelo menos 12 caracteres.', 'warning'); return; }
    setBusy(true);
    try {
      await httpClient.post(`/usuarios/${resetUser.id}/reset-password`, { newPassword: resetPassword });
      setResetUser(null); setResetPassword('');
      showToast('Senha redefinida. As sessões anteriores foram encerradas.');
    } catch (error) { showToast(friendlyError(error), 'error'); }
    finally { setBusy(false); }
  };
  if (carregando) return <PageSkeleton label="Verificando permissões…" />;
  if (!autenticado) return <div className="card p-6">Sua sessão expirou. <a href="/login">Entrar novamente</a></div>;
  if (!isAdmin) return <div className="card"><Empty icon={ShieldCheck} title="Acesso restrito" text="Apenas administradores podem gerenciar os usuários. Suas opções pessoais estão em Minha conta." /></div>;

  return <div className="space-y-5 ef-users-page">
    <div className="card overflow-hidden">
      <SectionHead title="Equipe e permissões" sub="Gerencie quem pode acessar as informações da empresa.">
        <Btn v="primary" icon={Plus} onClick={() => setCreateOpen(true)}>Cadastrar usuário</Btn>
      </SectionHead>
      <div className="ef-list-toolbar">
        <label className="ef-list-search"><Search size={16}/><span className="sr-only">Buscar usuário</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar nome ou e-mail…" /></label>
        <span className="ef-list-count">{visible.length} de {users.length} usuários</span>
      </div>
      {loadingUsers ? <PageSkeleton label="Carregando usuários…" /> : loadError ? <div role="alert" className="p-6 space-y-3"><p>{loadError}</p><Btn onClick={load}>Tentar novamente</Btn></div> : visible.length === 0 ? <Empty icon={Users} title="Nenhum usuário encontrado" text={query ? 'Altere os termos da busca.' : 'Cadastre o primeiro usuário da equipe.'} /> : <>
        <div className="overflow-x-auto"><table className="tbl ef-table-interactive"><thead><tr><th>Usuário</th><th>Permissão</th><th>Situação</th><th className="ef-tr">Ações</th></tr></thead>
        <tbody>{items.map(u => <tr key={u.id}>
          <td><div className="ef-user-name-cell"><span className="ef-user-initials" aria-hidden="true">{u.nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()}</span><div className="min-w-0"><b>{u.nome}</b><small>{u.email}</small></div></div></td>
          <td><Chip tone={u.role === 'ADMIN' ? 'blue' : 'gray'}>{ROLE_NAMES[u.role]}</Chip></td>
          <td><Chip tone={u.ativo ? 'teal' : 'gray'}>{u.ativo ? 'Ativo' : 'Inativo'}</Chip></td>
          <td className="ef-tr"><RowActionsMenu label={`Ações de ${u.nome}`} actions={[
            { label: 'Alterar permissão', icon: UserCog, onClick: () => { setEditing(u); setRoleDraft(u.role); } },
            { label: 'Redefinir senha', icon: KeyRound, onClick: () => { setResetUser(u); setResetPassword(''); } },
            { label: u.ativo ? 'Desativar acesso' : 'Reativar acesso', icon: UserX, danger: u.ativo, onClick: () => setStatusUser(u) },
          ]} /></td>
        </tr>)}</tbody></table></div>
        {visible.length > 12 && <div className="ef-pagination"><span>Exibindo {page * 12 + 1}–{Math.min((page + 1) * 12, visible.length)} de {visible.length}</span><div><Btn sm disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Anterior</Btn><Btn sm disabled={(page + 1) * 12 >= visible.length} onClick={() => setPage(p => p + 1)}>Próxima</Btn></div></div>}
      </>}
    </div>

    {createOpen && <Modal title="Cadastrar usuário" onClose={() => { if (!busy) setCreateOpen(false); }} wide><form onSubmit={create} className="space-y-4">
      <Field label="Nome completo"><input className="inp" autoFocus value={form.nome} minLength={2} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required /></Field>
      <Field label="E-mail"><input className="inp" type="email" autoComplete="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></Field>
      <Field label="Senha inicial"><input className="inp" type="password" autoComplete="new-password" minLength={12} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /><span className="ef-field-help">Pelo menos 12 caracteres.</span></Field>
      <Field label="Perfil de acesso"><select className="inp" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as User['role'] }))}><option value="OPERADOR">Operador</option><option value="DIRETOR">Diretor</option><option value="ADMIN">Administrador</option></select><span className="ef-field-help">{ROLE_DESCRIPTIONS[form.role]}</span></Field>
      <FormActions label="Cadastrar usuário" onCancel={() => setCreateOpen(false)} loading={busy} v="primary"/>
    </form></Modal>}
    {editing && <Modal title={`Permissão de ${editing.nome}`} onClose={() => { if (!busy) setEditing(null); }}><div className="space-y-4">
      <p className="ef-t13" style={{color:'var(--ink2)'}}>Escolha quais recursos este usuário poderá utilizar. As permissões são aplicadas pelo servidor.</p>
      <Field label="Perfil"><select className="inp" value={roleDraft} onChange={e => setRoleDraft(e.target.value as User['role'])}><option value="OPERADOR">Operador</option><option value="DIRETOR">Diretor</option><option value="ADMIN">Administrador</option></select><span className="ef-field-help">{ROLE_DESCRIPTIONS[roleDraft]}</span></Field>
      <div className="flex justify-end gap-2"><Btn onClick={() => setEditing(null)} disabled={busy}>Cancelar</Btn><Btn v="primary" loading={busy} onClick={async () => { if (await update(editing, { role: roleDraft })) setEditing(null); }}>Salvar permissão</Btn></div>
    </div></Modal>}
    {resetUser && <Modal title={`Redefinir senha · ${resetUser.nome}`} onClose={() => { if (!busy) setResetUser(null); }}><form className="space-y-4" onSubmit={reset}>
      <p className="ef-t13" style={{color:'var(--ink2)'}}>Ao confirmar, as sessões anteriores deste usuário serão encerradas.</p>
      <Field label="Nova senha"><input className="inp" autoFocus autoComplete="new-password" type="password" minLength={12} value={resetPassword} onChange={e => setResetPassword(e.target.value)} required /></Field>
      <div className="flex justify-end gap-2"><Btn onClick={() => setResetUser(null)} disabled={busy}>Cancelar</Btn><Btn v="primary" type="submit" loading={busy}>Redefinir senha</Btn></div>
    </form></Modal>}
    {statusUser && (
      <ConfirmDialog
        title={`${statusUser.ativo ? 'Desativar' : 'Reativar'} acesso?`}
        description={`${statusUser.nome} ${statusUser.ativo ? 'não poderá mais acessar o sistema enquanto estiver inativo.' : 'voltará a acessar o sistema conforme sua permissão.'}`}
        confirmLabel={statusUser.ativo ? 'Desativar acesso' : 'Reativar acesso'}
        onCancel={() => setStatusUser(null)}
        onConfirm={async () => { await update(statusUser, { ativo: !statusUser.ativo }); }}
      />
    )}
  </div>;
}
