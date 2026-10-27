'use client';

import {useState,type FormEvent} from 'react';
import {createEvent,type LiveSnapshot} from '../../lib/supabase/data';
import styles from './live.module.css';

type Props={snapshot:LiveSnapshot; isAdmin:boolean; onCreated:()=>Promise<void>};
type EventKind='training'|'match'|'social';

export default function CreateEventForm({snapshot,isAdmin,onCreated}:Props){
 const [open,setOpen]=useState(false);
 const [title,setTitle]=useState('');
 const [kind,setKind]=useState<EventKind>('training');
 const [teamId,setTeamId]=useState('');
 const [start,setStart]=useState('');
 const [end,setEnd]=useState('');
 const [deadline,setDeadline]=useState('');
 const [venue,setVenue]=useState('');
 const [capacity,setCapacity]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(busy)return;
  setError('');setSuccess('');
  const name=title.trim();
  if(!name||name.length>160){setError('O título deve ter entre 1 e 160 caracteres.');return;}
  if(!isAdmin&&!teamId){setError('Treinadores precisam selecionar uma equipe.');return;}
  if(teamId&&!snapshot.teams.some(t=>t.id===teamId)){setError('Selecione uma equipe válida deste clube.');return;}
  const a=new Date(start), b=new Date(end), c=deadline?new Date(deadline):null;
  if(!start||!end||!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||b<=a){setError('A data final deve ser posterior à inicial.');return;}
  if(c&&(!Number.isFinite(c.getTime())||c>a)){setError('O prazo de inscrição não pode ser posterior ao início.');return;}
  let cap:number|null=null;
  if(capacity.trim()){
    cap=Number(capacity);
    if(!Number.isSafeInteger(cap)||cap<1||cap>10000){setError('A capacidade deve ser um número inteiro entre 1 e 10000.');return;}
  }
  setBusy(true);
  try{
   await createEvent({
    club_id:snapshot.activeClub.id,
    team_id:teamId||null,
    title:name,type:kind,
    starts_at:a.toISOString(),ends_at:b.toISOString(),
    rsvp_deadline:c?c.toISOString():null,
    venue_name:venue.trim()||null,capacity:cap
   });
   await onCreated();
   setOpen(false);setTitle('');setStart('');setEnd('');setDeadline('');setVenue('');setTeamId('');setCapacity('');setKind('training');
   setSuccess('Evento criado e confirmado pelo Supabase.');
  }catch(ex){setError(ex instanceof Error?ex.message:'Não foi possível criar o evento.');}
  finally{setBusy(false);}
 }
 return <div className={styles.teamCreate}>
  <button type="button" className={styles.createToggle} aria-expanded={open} onClick={()=>{setOpen(x=>!x);setError('');setSuccess('');}}>{open?'Cancelar':'＋ Criar evento'}</button>
  {open&&<form className={styles.teamForm} onSubmit={e=>void submit(e)}>
   <h3>Novo evento</h3>
   <p>As datas são introduzidas no horário local deste dispositivo e convertidas para UTC. Confirme o fuso horário antes de salvar. O Supabase valida as permissões do clube e da equipe.</p>
   <label>Título<input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Treino de defesa"/></label>
   <label>Tipo<select value={kind} onChange={e=>setKind(e.target.value as EventKind)}><option value="training">Treino</option><option value="match">Jogo</option><option value="social">Social</option></select></label>
   <label>Equipe<select value={teamId} required={!isAdmin} onChange={e=>setTeamId(e.target.value)}><option value="">{isAdmin?'Clube inteiro (sem equipe)':'Selecione uma equipe'}</option>{snapshot.teams.map(t=><option key={t.id} value={t.id}>{t.name} · {t.division}</option>)}</select></label>
   <div className={styles.eventFormGrid}><label>Início<input type="datetime-local" required value={start} onChange={e=>setStart(e.target.value)}/></label><label>Fim<input type="datetime-local" required value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
   <label>Local<input maxLength={250} value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Ex.: Collinstown Sports Complex"/></label>
   <div className={styles.eventFormGrid}><label>Vagas (opcional)<input type="number" min="1" max="10000" step="1" value={capacity} onChange={e=>setCapacity(e.target.value)} placeholder="Sem limite"/></label><label>Inscrições até (opcional)<input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label></div>
   <button type="submit" className={styles.confirmCreate} disabled={busy}>{busy?'Salvando…':'Criar evento no Supabase'}</button>
  </form>}
  {error&&<p role="alert" className={styles.teamFormError}>{error}</p>}
  {success&&<p role="status" className={styles.teamFormSuccess}>{success}</p>}
 </div>;
}
