'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { httpClient } from '@/lib/http/client';

type User = {id:string; nome:string; email:string; role:'ADMIN'|'OPERADOR'|'DIRETOR'; ativo:boolean; permitirIpExterno:boolean};

function explain(error: any): string {
  const d = error?.response?.data?.detail;
  return typeof d === 'string' ? d : 'Operação não concluída; confira sua permissão e tente novamente.';
}

/** Todas as ações são executadas no backend, nunca no localStorage. */
export default function UsuariosPage() {
  const {usuario, carregando, autenticado} = useAuth();
  const [users,setUsers] = useState<User[]>([]);
  const [nome,setNome] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState<User['role']>('OPERADOR');
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  const [oldPassword,setOldPassword] = useState('');
  const [newPassword,setNewPassword] = useState('');
  const [resetPasswords,setResetPasswords] = useState<Record<string,string>>({});
  const isAdmin = usuario?.papel === 'ADMIN';
  const load = useCallback(async () => {
    if (!isAdmin) return;
    try {const r = await httpClient.get<User[]>('/usuarios'); setUsers(r.data);}
    catch(e){setMessage(explain(e));}
  },[isAdmin]);
  useEffect(()=>{void load();},[load]);
  async function create(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      await httpClient.post('/usuarios',{nome,email,password,role,permitirIpExterno:false});
      setNome('');setEmail('');setPassword('');setRole('OPERADOR');
      await load();setMessage('Usuário cadastrado no Supabase.');
    } catch(e){setMessage(explain(e));} finally{setBusy(false);}
  }
  async function update(u: User, data: Partial<User>) {
    setBusy(true); setMessage('');
    try {await httpClient.patch(`/usuarios/${u.id}`,data);await load();setMessage('Usuário atualizado.');}
    catch(e){setMessage(explain(e));} finally{setBusy(false);}
  }
  async function reset(u: User) {
    const pass = resetPasswords[u.id];
    if (!pass || pass.length < 12) {setMessage('Informe uma senha de 12 caracteres ou mais.'); return;}
    setBusy(true);
    try {await httpClient.post(`/usuarios/${u.id}/reset-password`,{newPassword:pass});setResetPasswords(old=>({...old,[u.id]:''}));setMessage('Senha alterada. Sessões anteriores foram revogadas.');}
    catch(e){setMessage(explain(e));} finally{setBusy(false);}
  }
  async function changeOwnPassword(e: FormEvent) {
    e.preventDefault();setBusy(true);
    try {await httpClient.post('/auth/change-password',{oldPassword,newPassword});
      setOldPassword('');setNewPassword('');setMessage('Senha atualizada. Faça login novamente.');
      window.location.href='/login';
    } catch(e){setMessage(explain(e));} finally{setBusy(false);}
  }
  if (carregando) return <div className="card p-6">Verificando permissões…</div>;
  if (!autenticado) return <div className="card p-6">Sessão expirada. <a href="/login">Entrar novamente</a></div>;
  return <div className="space-y-5">
    {message && <div role="status" className="card p-4">{message}</div>}
    <div className="card p-6">
      <h2 className="text-lg font-bold mb-4">Minha senha</h2>
      <form onSubmit={changeOwnPassword} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="inp" type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} placeholder="Senha atual" required />
        <input className="inp" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Nova senha (12+ caracteres)" minLength={12} required />
        <button className="btn btn-primary" type="submit" disabled={busy}>Alterar minha senha</button>
      </form>
    </div>
    {!isAdmin ? <div className="card p-6">Somente ADMIN pode cadastrar e gerenciar usuários.</div> : <>
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Cadastrar usuário</h2>
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="inp" placeholder="Nome completo" value={nome} onChange={e=>setNome(e.target.value)} required minLength={2}/>
          <input className="inp" type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input className="inp" type="password" placeholder="Senha inicial (12+ caracteres)" minLength={12} value={password} onChange={e=>setPassword(e.target.value)} required/>
          <select className="inp" value={role} onChange={e=>setRole(e.target.value as User['role'])}>
            <option value="OPERADOR">OPERADOR</option><option value="DIRETOR">DIRETOR</option><option value="ADMIN">ADMIN</option>
          </select>
          <button className="btn btn-primary" disabled={busy} type="submit">Criar usuário real</button>
        </form>
      </div>
      <div className="card p-6 overflow-x-auto">
        <h2 className="text-lg font-bold mb-4">Usuários da empresa</h2>
        <table className="tbl"><thead><tr><th>Nome / e-mail</th><th>Perfil</th><th>Situação</th><th>Ações</th></tr></thead>
          <tbody>{users.map(u=><tr key={u.id}><td><strong>{u.nome}</strong><div>{u.email}</div></td>
            <td><select className="inp" disabled={busy} value={u.role} onChange={e=>void update(u,{role:e.target.value as User['role']})}>
              <option>ADMIN</option><option>OPERADOR</option><option>DIRETOR</option></select></td>
            <td>{u.ativo?'Ativo':'Inativo'}</td>
            <td className="space-x-2"><button className="btn" disabled={busy} onClick={()=>void update(u,{ativo:!u.ativo})}>{u.ativo?'Desativar':'Reativar'}</button>
              <input type="password" className="inp" autoComplete="new-password" placeholder="Nova senha (12+)" value={resetPasswords[u.id]||''} onChange={e=>setResetPasswords(prev=>({...prev,[u.id]:e.target.value}))} />
              <button className="btn" disabled={busy} onClick={()=>void reset(u)}>Redefinir senha</button></td></tr>)}</tbody>
        </table>
      </div>
    </>}
  </div>;
}
