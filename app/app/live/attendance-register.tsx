'use client';

import {useEffect,useState} from 'react';
import {getEventAttendance,saveAttendance,type LiveSnapshot} from '../../lib/supabase/data';
import styles from './live.module.css';

type Mark='present'|'absent'|'late';
type Participant={user_id:string;display_name:string;rsvp_status:string|null};
type Saved={user_id:string;status:string;marked_at:string};
const choices:{value:Mark;label:string}[]=[{value:'present',label:'Presente'},{value:'late',label:'Atrasado'},{value:'absent',label:'Ausente'}];
export default function AttendanceRegister({snapshot,onSaved}:{snapshot:LiveSnapshot;onSaved:()=>Promise<void>}){
 const [eventId,setEventId]=useState('');
 const [participants,setParticipants]=useState<Participant[]>([]);
 const [saved,setSaved]=useState<Saved[]>([]);
 const [draft,setDraft]=useState<Record<string,Mark>>({});
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const event=snapshot.events.find(e=>e.id===eventId);
 const marked=saved.reduce<Record<string,Mark>>((acc,row)=>{if(row.status==='present'||row.status==='late'||row.status==='absent')acc[row.user_id]=row.status;return acc;},{});
 const changes=Object.entries(draft).filter(([id,value])=>marked[id]!==value);
 const eligible=participants;
 const markedCount=eligible.filter(p=>draft[p.user_id]||marked[p.user_id]).length;

 useEffect(()=>{setEventId('');setParticipants([]);setSaved([]);setDraft({});setError('');setNotice('');},[snapshot.activeClub.id]);
 useEffect(()=>{
  let active=true;
  setError('');setNotice('');setDraft({});setParticipants([]);setSaved([]);
  const selected=snapshot.events.find(e=>e.id===eventId);
  if(!selected)return;
  setLoading(true);
  void getEventAttendance(selected).then(result=>{if(active){setParticipants(result.participants);setSaved(result.marks);}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Não foi possível carregar os participantes.');}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[eventId,snapshot.activeClub.id,snapshot.events]);

 async function submit(){
  if(!event||busy||!changes.length)return;
  setBusy(true);setError('');setNotice('');
  let completed=0;
  try{
   for(const [userId,status] of changes){
    await saveAttendance({club_id:event.club_id,event_id:event.id,user_id:userId,status});
    completed++;
   }
   const data=await getEventAttendance(event);
   setParticipants(data.participants);setSaved(data.marks);setDraft({});
   setNotice(completed+' registro(s) confirmado(s) no Supabase.');
   await onSaved();
  }catch(e){
   setError((e instanceof Error?e.message:'Erro ao salvar.')+' '+completed+' de '+changes.length+' alterações foram enviadas antes do erro. Atualize o evento antes de tentar novamente.');
  }finally{setBusy(false);}
 }
 return <section className={styles.section} aria-labelledby="attendance-heading">
  <div className={styles.sectionHead}><div><p className={styles.eyebrow}>IVI / EVENT REGISTER</p><h2 id="attendance-heading">Controle de presença</h2></div>{event&&<strong>{markedCount} / {eligible.length}</strong>}</div>
  <p className={styles.attendanceHelp}>Marque atletas do elenco autorizado, mesmo sem RSVP. Os nomes são obtidos por consulta protegida, apenas para administradores e treinadores autorizados.</p>
  <label className={styles.attendanceSelect}>Evento
   <select value={eventId} onChange={e=>setEventId(e.target.value)} disabled={busy}><option value="">Selecione um evento</option>{snapshot.events.filter(e=>e.status==='scheduled').map(e=><option value={e.id} key={e.id}>{e.title} · {new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',timeZone:snapshot.activeClub.timezone}).format(new Date(e.starts_at))}</option>)}</select>
  </label>
  {loading&&<p role="status">Carregando participantes…</p>}
  {event&&!loading&&!error&&<>{!eligible.length?<p>Não há atletas ativos neste elenco ou você não tem acesso ao evento.</p>:<div className={styles.attendanceRoster}>{eligible.map((p,index)=><div key={p.user_id} className={styles.attendancePerson}><div><strong>{p.display_name.trim()||'Atleta '+(index+1)}</strong><small>RSVP: {p.rsvp_status??'Sem resposta'}</small></div><div role="group" aria-label={'Presença de '+(p.display_name.trim()||'atleta '+(index+1))} className={styles.attendanceChoices}>{choices.map(c=><button key={c.value} type="button" disabled={busy} aria-pressed={(draft[p.user_id]??marked[p.user_id])===c.value} onClick={()=>setDraft(d=>({...d,[p.user_id]:c.value}))}>{c.label}</button>)}</div></div>)}</div>}
   {eligible.length>0&&<div className={styles.attendanceFooter}><span>{changes.length} alteração(ões) pendente(s)</span><button type="button" className={styles.confirmCreate} disabled={busy||changes.length===0} onClick={()=>void submit()}>{busy?'Salvando…':'Salvar presença'}</button></div>}
  </>}
  {error&&<p className={styles.teamFormError} role="alert">{error}</p>}
  {notice&&<p role="status" className={styles.teamFormSuccess}>{notice}</p>}
 </section>;
}
