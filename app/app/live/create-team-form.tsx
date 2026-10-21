'use client';

import {useState,type FormEvent} from 'react';
import {createTeam} from '../../lib/supabase/data';
import styles from './live.module.css';

type Props={
 clubId:string;
 onCreated:()=>Promise<void>;
};
export default function CreateTeamForm({clubId,onCreated}:Props){
 const [open,setOpen]=useState(false);
 const [name,setName]=useState('');
 const [division,setDivision]=useState('');
 const [gender,setGender]=useState<'men'|'women'|'mixed'>('men');
 const [busy,setBusy]=useState(false);
 const [feedback,setFeedback]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   if(busy)return;
   const n=name.trim();const d=division.trim();
   if(n.length<2||n.length>100||d.length<2||d.length>80){
     setFeedback('Preencha nome (2–100 caracteres) e divisão (2–80 caracteres).');
     return;
   }
   setBusy(true);setFeedback('');
   try{
     await createTeam({club_id:clubId,name:n,division:d,gender});
     setName('');setDivision('');setGender('men');setOpen(false);
     await onCreated();
   }catch(error){
     setFeedback(error instanceof Error?error.message:'Não foi possível criar a equipe.');
   }finally{setBusy(false);}
 }
 return <div className={styles.teamCreate}>
  <button type="button" className={styles.createToggle} aria-expanded={open} onClick={()=>{setOpen(x=>!x);setFeedback('');}}>{open?'Cancelar':'+ Criar equipe'}</button>
  {open&&<form className={styles.teamForm} onSubmit={e=>void submit(e)}>
   <h3>Nova equipe</h3>
   <p>Esta ação cria um registro real no clube selecionado. Apenas administradores autorizados podem salvar.</p>
   <label>Nome da equipe<input required minLength={2} maxLength={100} autoComplete="off" value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: IVI Dragons"/></label>
   <label>Divisão<input required minLength={2} maxLength={80} autoComplete="off" value={division} onChange={e=>setDivision(e.target.value)} placeholder="Ex.: Division 3"/></label>
   <label>Categoria<select value={gender} onChange={e=>setGender(e.target.value as 'men'|'women'|'mixed')}><option value="men">Masculino</option><option value="women">Feminino</option><option value="mixed">Misto</option></select></label>
   <button className={styles.confirmCreate} disabled={busy} type="submit">{busy?'Salvando…':'Confirmar criação'}</button>
  </form>}
  {feedback&&<p role="alert" className={styles.teamFormError}>{feedback}</p>}
 </div>;
}
