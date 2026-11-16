'use client';

import React, { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, LayoutList, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEstoquePneus } from '@/hooks/useFrotaWiseStore';
import { httpClient } from '@/lib/http/client';
import { friendlyError } from '@/lib/errors';
import { Btn, Field, PageSkeleton } from '@/components/ui';

export default function MinhaContaPage() {
  const { usuario, carregando } = useAuth();
  const { showToast, theme, setTheme } = useEstoquePneus();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  useEffect(() => {
    try { setDensity(localStorage.getItem('frotawise-density') === 'compact' ? 'compact' : 'comfortable'); } catch { /* Preferência opcional. */ }
  }, []);
  const changeDensity = (value: 'comfortable' | 'compact') => {
    setDensity(value);
    try { localStorage.setItem('frotawise-density', value); } catch { /* Sessão restrita. */ }
    window.dispatchEvent(new CustomEvent('frotawise-density-change', { detail: value }));
  };
  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast('A confirmação da senha não corresponde à nova senha.', 'error'); return; }
    setBusy(true);
    try {
      await httpClient.post('/auth/change-password', { oldPassword, newPassword });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast('Senha alterada. Entre novamente com sua nova senha.');
      window.location.href = '/login';
    } catch (error) { showToast(friendlyError(error), 'error'); }
    finally { setBusy(false); }
  };
  if (carregando) return <PageSkeleton label="Carregando minha conta…" />;
  if (!usuario) return <div className="card p-6">Entre novamente para consultar sua conta.</div>;
  const roleName = usuario.papel === 'ADMIN' ? 'Administrador' : usuario.papel === 'DIRETOR' ? 'Diretor' : 'Operador';

  return <div className="ef-account-page space-y-5">
    <section className="card p-6 ef-account-hero">
      <div className="ef-account-icon"><UserRound size={24} /></div>
      <div className="min-w-0"><h2 className="ef-t20 font-semibold">{usuario.nome}</h2><p className="ef-account-email">{usuario.email}</p><span className="ef-account-role"><ShieldCheck size={14}/>{roleName}</span></div>
    </section>
    <div className="ef-account-grid">
      <section className="card p-6 space-y-4">
        <div><h3 className="ef-t17 font-semibold flex items-center gap-2"><LayoutList size={18}/> Preferências de visualização</h3><p className="ef-t13 mt-1" style={{color:'var(--mute)'}}>Ajustes deste navegador, sem alterar os dados da empresa.</p></div>
        <div><span className="lbl">Aparência</span><div className="ef-preference-options"><button type="button" className={theme === 'light' ? 'is-active' : ''} aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>Claro</button><button type="button" className={theme === 'dark' ? 'is-active' : ''} aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>Escuro</button></div></div>
        <div><span className="lbl">Densidade das tabelas</span><div className="ef-preference-options"><button type="button" className={density === 'comfortable' ? 'is-active' : ''} aria-pressed={density === 'comfortable'} onClick={() => changeDensity('comfortable')}>Confortável</button><button type="button" className={density === 'compact' ? 'is-active' : ''} aria-pressed={density === 'compact'} onClick={() => changeDensity('compact')}>Compacta</button></div></div>
      </section>
      <section className="card p-6 space-y-4">
        <div><h3 className="ef-t17 font-semibold flex items-center gap-2"><KeyRound size={18}/> Segurança da conta</h3><p className="ef-t13 mt-1" style={{color:'var(--mute)'}}>Depois de alterar a senha, você precisará entrar novamente.</p></div>
        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Senha atual"><input className="inp" type="password" autoComplete="current-password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required /></Field>
          <Field label="Nova senha"><input className="inp" type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={e => setNewPassword(e.target.value)} required /><span className="ef-field-help">Use pelo menos 12 caracteres.</span></Field>
          <Field label="Confirmar nova senha"><input className="inp" type="password" autoComplete="new-password" minLength={12} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></Field>
          <Btn v="primary" type="submit" loading={busy} loadingLabel="Alterando senha…">Alterar minha senha</Btn>
        </form>
      </section>
    </div>
  </div>;
}
