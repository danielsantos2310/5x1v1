'use client';

import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
import {getLiveSnapshot,saveMyRSVP,markNotificationRead,type LiveSnapshot} from '../../lib/supabase/data';
import {getSupabaseBrowserClient,isSupabaseConfigured} from '../../lib/supabase/browser';
import styles from './live.module.css';
import CreateTeamForm from './create-team-form';
import CreateEventForm from './create-event-form';
import ManageEvent from './manage-event';

type Phase = 'checking' | 'signed-out' | 'missing-configuration' | 'ready' | 'error';
const dt=(date:string)=>new Intl.DateTimeFormat('pt-BR',{timeZone:'Europe/Dublin',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(date));

export default function LivePage(){
 const [phase,setPhase]=useState<Phase>('checking');
 const [snapshot,setSnapshot]=useState<LiveSnapshot|null>(null);
 const [clubId,setClubId]=useState<string|undefined>(undefined);
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState<string|null>(null);
 const reload=useCallback(async(id?:string)=>{
   if(!isSupabaseConfigured()){setPhase('missing-configuration');return;}
   setPhase('checking');
   try{
     const data=await getLiveSnapshot(id);
     setSnapshot(data);setClubId(data.activeClub.id);setPhase('ready');setMessage('');
   }catch(err){
     const description=err instanceof Error?err.message:String(err);
     if(description.includes('Sign in'))setPhase('signed-out');
     else setPhase('error');
     setMessage(description);setSnapshot(null);
   }
 },[]);
 useEffect(()=>{
   let valid=true;
   if(!isSupabaseConfigured()){setPhase('missing-configuration');return;}
   const client=getSupabaseBrowserClient();
   void reload();
   const {data:{subscription}}=client.auth.onAuthStateChange((_event,_session)=>{
     // Defer reads out of the auth callback to avoid client-auth lock contention.
     if(valid) queueMicrotask(()=>{if(valid)void reload();});
   });
   return ()=>{valid=false;subscription.unsubscribe();};
 },[reload]);
 async function respond(id:string,status:'going'|'maybe'|'not_going'){
   if(!snapshot)return;
   const event=snapshot.events.find(x=>x.id===id);if(!event)return;
   setBusy(id);setMessage('');
   try{
     const result=await saveMyRSVP(event,status);
     setMessage(result.status==='waitlist'?'Sem vaga disponível: você entrou na lista de espera.':'Resposta confirmada no Supabase.');
     const next=await getLiveSnapshot(snapshot.activeClub.id);setSnapshot(next);
   }catch(e){setMessage(e instanceof Error?e.message:'Não foi possível salvar a resposta.');}
   finally{setBusy(null);}
 }
 async function readNotice(id:string){
   if(!snapshot)return;
   setBusy(id);setMessage('');
   try{await markNotificationRead(id);setSnapshot(await getLiveSnapshot(snapshot.activeClub.id));}
   catch(e){setMessage(e instanceof Error?e.message:'Não foi possível atualizar.');}
   finally{setBusy(null);}
 }
 const ownRSVP=(id:string)=>snapshot?.rsvps.find(r=>r.event_id===id&&r.user_id===snapshot.userId)?.status;
 const roles=snapshot?.clubs.find(c=>c.id===snapshot.activeClub.id)?.roles??[];
 return <main className={styles.page}><div className={styles.shell}>
   <header className={styles.header}><div className={styles.logo}>5<span>×</span>1 <small>LIVE DATA</small></div><div className={styles.headerLinks}><Link href="/">Demonstração</Link><Link href="/login">Entrar</Link></div></header>
   <div className={styles.intro}><p className={styles.eyebrow}>SUPABASE / REAL SESSION REQUIRED</p><h1>Dados reais do clube</h1><p>Esta área só consulta o banco usando sua própria sessão. O seletor de papéis da demonstração não autoriza acesso.</p></div>
   {phase==='missing-configuration'&&<section className={styles.state}><h2>Configuração pendente</h2><p>Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para habilitar consultas reais.</p><Link href="/">Voltar à demonstração</Link></section>}
   {phase==='checking'&&<section className={styles.state} role="status"><h2>Verificando acesso…</h2><p>Consultando a sessão e as permissões no Supabase.</p></section>}
   {phase==='signed-out'&&<section className={styles.state}><h2>Login necessário</h2><p>Faça login para visualizar equipes e eventos reais. Sem sessão autenticada, nenhum dado privado é carregado.</p><Link href="/login" className={styles.primary}>Abrir login</Link></section>}
   {phase==='error'&&<section className={styles.state} role="alert"><h2>Não foi possível carregar</h2><p>{message}</p><button onClick={()=>void reload(clubId)}>Tentar novamente</button><Link href="/">Demo sem login</Link></section>}
   {phase==='ready'&&snapshot&&<>
    <div className={styles.clubLine}><div><p className={styles.eyebrow}>CLUBE ATIVO</p><h2>{snapshot.activeClub.name}</h2><p>Perfis reais: {roles.length?roles.join(', '):'membro'} · {snapshot.activeClub.timezone}</p></div><label>Clube <select value={snapshot.activeClub.id} onChange={e=>{setClubId(e.target.value);void reload(e.target.value);}}>{snapshot.clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
    <div className={styles.stats}><div><span>Equipes</span><strong>{snapshot.teams.length}</strong></div><div><span>Eventos</span><strong>{snapshot.events.length}</strong></div><div><span>Meus RSVPs visíveis</span><strong>{snapshot.rsvps.filter(r=>r.user_id===snapshot.userId).length}</strong></div><div><span>Notificações</span><strong>{snapshot.notifications.length}</strong></div></div>
    <section className={styles.section}><div className={styles.sectionHead}><h2>Eventos reais</h2><button disabled={busy!==null} onClick={()=>void reload(snapshot.activeClub.id)}>Atualizar</button></div>{(roles.includes('admin')||roles.includes('coach'))&&<CreateEventForm key={snapshot.activeClub.id} snapshot={snapshot} isAdmin={roles.includes('admin')} onCreated={async()=>{setSnapshot(await getLiveSnapshot(snapshot.activeClub.id));setMessage('Evento criado e confirmado pelo Supabase.');}}/>}{!snapshot.events.length?<p>Nenhum evento visível para esta conta.</p>:snapshot.events.map(e=><article key={e.id} className={styles.event}><div><span className={styles.eyebrow}>{e.type} · {dt(e.starts_at)}</span><h3>{e.title}</h3><p>{e.venue_name??'Local não definido'} · {e.status}</p><small>Minha resposta: {ownRSVP(e.id)??'Não respondido'}</small></div>{(roles.includes('admin')||roles.includes('coach'))&&<ManageEvent key={e.id} event={e} onChanged={async()=>{setSnapshot(await getLiveSnapshot(snapshot.activeClub.id));setMessage('Alteração confirmada no Supabase.');}}/>}<div className={styles.actions}>{(['going','maybe','not_going'] as const).map(status=><button type="button" key={status} disabled={busy!==null||e.status!=='scheduled'} aria-pressed={ownRSVP(e.id)===status} onClick={()=>void respond(e.id,status)}>{status==='going'?'Vou':status==='maybe'?'Talvez':'Não vou'}</button>)}</div></article>)}</section>
    <div className={styles.columns}><section className={styles.section}><h2>Equipes reais</h2>{roles.includes('admin')&&<CreateTeamForm key={snapshot.activeClub.id} clubId={snapshot.activeClub.id} onCreated={async()=>{setSnapshot(await getLiveSnapshot(snapshot.activeClub.id));setMessage('Equipe criada e confirmada no Supabase.');}}/>}{snapshot.teams.length?snapshot.teams.map(team=><div key={team.id} className={styles.item}><strong>{team.name}</strong><span>{team.division} · {team.gender}</span></div>):<p>Nenhuma equipe visível.</p>}</section><section className={styles.section}><h2>Notificações reais</h2>{snapshot.notifications.length?snapshot.notifications.map(n=><div className={styles.item} key={n.id}><strong>{n.title}</strong><span>{n.message}</span>{!n.read_at&&<button disabled={busy!==null} onClick={()=>void readNotice(n.id)}>Marcar como lida</button>}</div>):<p>Nenhuma notificação.</p>}</section></div>
    {message&&<p className={styles.feedback} role="status">{message}</p>}
   </>}
   <footer>5×1 Court-Side · Consulta real protegida por RLS · Login ainda não testado de ponta a ponta</footer>
 </div></main>;
}
