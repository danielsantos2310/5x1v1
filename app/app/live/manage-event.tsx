'use client';

import {useEffect,useState,type FormEvent} from 'react';
import {cancelEvent,updateEvent,type EditableEvent} from '../../lib/supabase/data';
import styles from './live.module.css';

type Props={event:EditableEvent;onChanged:()=>Promise<void>};
const localValue=(iso:string|null)=>{
 if(!iso)return '';
 const date=new Date(iso);
 const pad=(n:number)=>String(n).padStart(2,'0');
 return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes());
};

export default function ManageEvent({event,onChanged}:Props){
 const [open,setOpen]=useState(false);
 const [confirm,setConfirm]=useState(false);
 const [title,setTitle]=useState(event.title);
 const [kind,setKind]=useState(event.type);
 const [start,setStart]=useState(localValue(event.starts_at));
 const [end,setEnd]=useState(localValue(event.ends_at));
 const [venue,setVenue]=useState(event.venue_name??'');
 const [capacity,setCapacity]=useState(event.capacity===null?'':String(event.capacity));
 const [deadline,setDeadline]=useState(localValue(event.rsvp_deadline));
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{setTitle(event.title);setKind(event.type);setStart(localValue(event.starts_at));setEnd(localValue(event.ends_at));setVenue(event.venue_name??'');setCapacity(event.capacity===null?'':String(event.capacity));setDeadline(localValue(event.rsvp_deadline));setConfirm(false);setOpen(false);setError('');},[event.id,event.updated_at,event.status,event.title,event.type,event.starts_at,event.ends_at,event.venue_name,event.capacity,event.rsvp_deadline]);
 const canManage=event.status==='scheduled';
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setError('');
  const a=new Date(start),b=new Date(end),d=deadline?new Date(deadline):null;
  if(!title.trim()||title.trim().length>160){setError('Informe um título válido (até 160 caracteres).');return;}
  if(!['training','match','social'].includes(kind)){setError('Tipo de evento inválido.');return;}
  if(!start||!end||!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||b<=a){setError('Fim deve ser depois do início.');return;}
  if(d&&(!Number.isFinite(d.getTime())||d>a)){setError('Prazo de RSVP deve ser antes do início.');return;}
  const cap=capacity.trim()?Number(capacity):null;
  if(cap!==null&&(!Number.isSafeInteger(cap)||cap<1||cap>10000)){setError('Vagas devem ser um inteiro entre 1 e 10000.');return;}
  setBusy(true);
  try{
   await updateEvent(event,{title:title.trim(),type:kind,starts_at:a.toISOString(),ends_at:b.toISOString(),venue_name:venue.trim()||null,capacity:cap,rsvp_deadline:d?d.toISOString():null});
   await onChanged();setOpen(false);
  }catch(e){setError(e instanceof Error?e.message:'Erro ao atualizar evento.');}
  finally{setBusy(false);}
 }
 async function cancel(){
  if(!confirm||busy)return;setBusy(true);setError('');
  try{await cancelEvent(event);await onChanged();setConfirm(false);setOpen(false);}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível cancelar.');}
  finally{setBusy(false);}
 }
 if(!canManage)return <span className={styles.cancelledStatus}>Cancelado</span>;
 return <div className={styles.manageEvent}>
  <button type="button" aria-expanded={open} onClick={()=>{setOpen(v=>!v);setConfirm(false);setError('');}} disabled={busy}>{open?'Fechar gestão':'Gerir evento'}</button>
  {open&&<div className={styles.managePanel}>
   <form className={styles.teamForm} onSubmit={e=>void submit(e)}>
    <h4>Editar evento</h4>
    <p>Data e hora no fuso local do seu dispositivo; confirme o horário antes de salvar. Alterações confirmadas são gravadas no Supabase.</p>
    <label>Título<input value={title} required maxLength={160} onChange={e=>setTitle(e.target.value)}/></label>
    <label>Tipo<select value={kind} onChange={e=>setKind(e.target.value)}><option value="training">Treino</option><option value="match">Jogo</option><option value="social">Social</option></select></label>
    <div className={styles.eventFormGrid}><label>Início<input type="datetime-local" required value={start} onChange={e=>setStart(e.target.value)}/></label><label>Fim<input type="datetime-local" required value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
    <label>Local<input value={venue} maxLength={250} onChange={e=>setVenue(e.target.value)}/></label>
    <div className={styles.eventFormGrid}><label>Capacidade<input type="number" min={1} max={10000} value={capacity} onChange={e=>setCapacity(e.target.value)} placeholder="Sem limite"/></label><label>Prazo RSVP<input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label></div>
    <button className={styles.confirmCreate} type="submit" disabled={busy}>{busy?'Salvando…':'Salvar alterações'}</button>
   </form>
   <div className={styles.cancelPanel}><strong>Cancelar evento</strong><p>O evento continuará no histórico como cancelado. O banco pode criar avisos para os membros afetados.</p>
    {!confirm?<button type="button" className={styles.cancelButton} disabled={busy} onClick={()=>setConfirm(true)}>Solicitar cancelamento</button>:<div className={styles.confirmCancel} role="group" aria-label="Confirmar cancelamento"><p>Confirma cancelar “{event.title}”? Esta ação não pode ser desfeita nesta interface.</p><button type="button" className={styles.cancelButton} disabled={busy} onClick={()=>void cancel()}>{busy?'Cancelando…':'Sim, cancelar evento'}</button><button type="button" disabled={busy} onClick={()=>setConfirm(false)}>Não, manter evento</button></div>}
   </div>
   {error&&<p role="alert" className={styles.teamFormError}>{error}</p>}
  </div>}
 </div>;
}
