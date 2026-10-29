'use client';
import { FormEvent,useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

export default function LoginPage(){
 const [mode,setMode]=useState<'login'|'signup'|'reset'>('login');
 const [locale,setLocale]=useState<'pt-BR'|'en'>('pt-BR');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const t=(pt:string,en:string)=>locale==='pt-BR'?pt:en;
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');
  try{
   const supabase=getSupabaseBrowserClient();
   if(mode==='reset'){
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth/update-password'});
    if(error)throw error;
    setMessage(t('Se uma conta existir, enviaremos instruções.','If an account exists, instructions will be sent.'));
   }else if(mode==='signup'){
    const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/auth/confirm',data:{locale}}});
    if(error)throw error;
    setMessage(t('Verifique seu e-mail para continuar.','Check your email to continue.'));
   }else{
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)throw error;
    window.location.assign('/');
   }
  }catch(err){setMessage(t('Não foi possível concluir a operação. Verifique os dados e tente novamente.','Unable to complete the request. Check your details and try again.'))}
  finally{setBusy(false)}
 }
 return <main className="auth-page"><section className="auth-card"><div className="wordmark">5<b>x</b>1</div><div className="auth-top"><h1>{mode==='reset'?t('Recuperar senha','Reset password'):mode==='signup'?t('Criar conta','Create account'):t('Entrar','Sign in')}</h1><button type="button" onClick={()=>setLocale(v=>v==='pt-BR'?'en':'pt-BR')}>{locale==='pt-BR'?'EN':'PT-BR'}</button></div><form onSubmit={submit}><label htmlFor="email">Email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/>{mode!=='reset'&&<><label htmlFor="password">{t('Senha','Password')}</label><input id="password" type="password" minLength={8} required autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></>}<button className="auth-primary" disabled={busy} type="submit">{busy?t('Aguarde…','Please wait…'):mode==='reset'?t('Enviar instruções','Send instructions'):mode==='signup'?t('Cadastrar','Sign up'):t('Entrar','Sign in')}</button></form><p role="status" aria-live="polite">{message}</p><div className="auth-links"><button type="button" onClick={()=>{setMode('login');setMessage('')}}>{t('Já tenho conta','Sign in')}</button><button type="button" onClick={()=>{setMode('signup');setMessage('')}}>{t('Criar conta','Create account')}</button><button type="button" onClick={()=>{setMode('reset');setMessage('')}}>{t('Esqueci a senha','Forgot password')}</button></div><small>{t('Apenas autenticação. Os dados reais do clube ainda não estão habilitados.','Authentication only. Live club data is not enabled yet.')}</small></section></main>
}
