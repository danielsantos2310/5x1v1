'use client';

import {useMemo,useState} from 'react';
import {demoEvents,demoMembers,demoNotices,demoTeams,labels,type Role,type Locale,type Screen,type RSVP,type Event} from '../lib/demo-data';
import styles from './workspace.module.css';

const navIcons:Record<Screen,string>={overview:'◫',teams:'◈',events:'▦',members:'♙',attendance:'✓',notifications:'◉',settings:'⚙'};
const readableDate=(iso:string,locale:Locale)=>new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short',timeZone:'Europe/Dublin'}).format(new Date(iso));
const readableTime=(iso:string,locale:Locale)=>new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Dublin'}).format(new Date(iso));
const allowed=(s:Screen,r:Role)=>s!=='members'||r==='admin';
const initials=(name:string)=>name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

export default function HomePage(){
 const [locale,setLocale]=useState<Locale>('pt-BR');
 const [theme,setTheme]=useState<'light'|'dark'>('light');
 const [role,setRole]=useState<Role>('admin');
 const [screen,setScreen]=useState<Screen>('overview');
 const [teamFilter,setTeamFilter]=useState('all');
 const [eventFilter,setEventFilter]=useState('all');
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState<string|null>(null);
 const [responses,setResponses]=useState<Record<string,RSVP>>({});
 const [attendance,setAttendance]=useState<Record<string,'present'|'absent'|'late'|null>>({});
 const [notices,setNotices]=useState(demoNotices);
 const [toast,setToast]=useState('');
 const t=labels[locale];
 const activeScreen=allowed(screen,role)?screen:'overview';
 const teams=useMemo(()=>demoTeams.filter(x=>teamFilter==='all'||x.id===teamFilter),[teamFilter]);
 const events=useMemo(()=>demoEvents.filter(x=>(eventFilter==='all'||x.type===eventFilter)&&(teamFilter==='all'||x.team_id===teamFilter||x.team_id===null)).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)),[eventFilter,teamFilter]);
 const event=demoEvents.find(e=>e.id===selected);
 const show=(text:string)=>{setToast(text);};
 const changeScreen=(to:Screen)=>{setScreen(to);setSelected(null);setToast('');};
 const changeRole=(next:Role)=>{setRole(next);if(!allowed(screen,next))setScreen('overview');setSelected(null);setToast('');};
 const nav:Screen[]=role==='admin'?['overview','teams','events','members','attendance','notifications','settings']:role==='coach'?['overview','teams','events','attendance','notifications','settings']:['overview','teams','events','notifications','settings'];
 const attendanceMembers=demoMembers.filter(m=>m.status==='active');
 const title:Record<Screen,string>={overview:t.overviewHeading,teams:t.teamOverview,events:t.calendar,members:t.memberList,attendance:t.attendTitle,notifications:t.notifications,settings:t.settings};
 const description:Record<Screen,string>={overview:t.overviewLead,teams:t.teamLead,events:t.calendarLead,members:t.memberLead,attendance:t.attendLead,notifications:t.notificationsLead,settings:t.settingsLead};
 const formatGender=(g:string)=>g==='men'?locale==='en'?'Men':'Masculino':g==='women'?locale==='en'?'Women':'Feminino':locale==='en'?'Mixed':'Misto';

 const eventCard=(e:Event)=> <button type="button" className={styles.eventCard} key={e.id} onClick={()=>{setSelected(e.id);setToast('');}} aria-label={e.title}>
   <span className={styles.dateSquare}><b>{new Date(e.starts_at).toLocaleDateString('en-GB',{day:'2-digit',timeZone:'Europe/Dublin'})}</b><small>{new Date(e.starts_at).toLocaleDateString(locale,{month:'short',timeZone:'Europe/Dublin'})}</small></span>
   <span className={styles.eventInfo}><span className={styles.eventType}>{e.type==='training'?t.training:e.type==='match'?t.match:t.social} · {e.team_id?demoTeams.find(x=>x.id===e.team_id)?.name:'IVI'}</span><strong>{e.title}</strong><span className={styles.muted}>{readableTime(e.starts_at,locale)} · {e.venue_name}</span></span>
   <span className={styles.eventArrow} aria-hidden="true">↗</span>
 </button>;

 return <div className={styles.app} data-theme={theme}>
  <a href="#main-content" className={styles.skip}>Skip to content</a>
  <aside className={styles.sidebar} aria-label="Main menu">
    <div className={styles.brand}><span className={styles.brandMark}>5<span>×</span>1</span><span className={styles.brandCaption}>COURT-SIDE<br/><small>{t.subtitle}</small></span></div>
    <div className={styles.sideClub}><span className={styles.clubBadge}>IVI</span><span><b>International Volleyball</b><small>Ireland · Dublin</small></span><span className={styles.sideChevron}>⌄</span></div>
    <div className={styles.menuCaption}>{locale==='en'?'WORKSPACE':'ÁREA DE TRABALHO'}</div>
    <nav className={styles.sideNav}>{nav.map(s=><button key={s} type="button" aria-current={activeScreen===s?'page':undefined} className={activeScreen===s?styles.navActive:''} onClick={()=>changeScreen(s)}><span className={styles.navIcon}>{navIcons[s]}</span>{t[s]}{s==='notifications'&&notices.filter(n=>n.unread).length>0&&<span className={styles.bubble}>{notices.filter(n=>n.unread).length}</span>}</button>)}</nav>
    <div className={styles.sidebarBottom}><span className={styles.liveDot}/><span>{t.demo}</span></div>
  </aside>
  <div className={styles.workspace}>
   <header className={styles.topbar}>
    <div className={styles.crumb}>IVI <span>/</span> {t[activeScreen]}</div>
    <div className={styles.topActions}>
      <label className={styles.roleControl}><span>{t.role}</span><select aria-label={t.role} value={role} onChange={e=>changeRole(e.target.value as Role)}><option value="admin">{t.admin}</option><option value="coach">{t.coach}</option><option value="player">{t.player}</option></select></label>
      <button className={styles.iconButton} type="button" aria-label={t.notifications} onClick={()=>changeScreen('notifications')}>♧{notices.some(n=>n.unread)&&<span className={styles.dot}/>}</button>
      <span className={styles.avatar} title="5x1 demo account">5X</span>
    </div>
   </header>
   <main id="main-content" className={styles.main}>
    <div className={styles.eyebrow}><span className={styles.line}/> {t.welcome} <span className={styles.localeDate}>15 OCT 2026</span></div>
    <div className={styles.headRow}><div><h1>{title[activeScreen]}</h1><p>{description[activeScreen]}</p></div><span className={styles.demoPill}>● {t.demo}</span></div>
    {activeScreen==='overview'&&<>
     <section className={styles.hero}><div><div className={styles.heroKicker}>INTERNATIONAL VOLLEYBALL IRELAND <span> / 2026—27</span></div><h2>{locale==='en'?'One team. Multi nations.':'Um time. Muitas nações.'}</h2><p>{locale==='en'?'Your next training, match and team update — all in one place.':'Seu próximo treino, jogo e atualização de equipe — tudo em um lugar.'}</p><button type="button" className={styles.heroButton} onClick={()=>changeScreen('events')}>{t.goToEvents} <span>↗</span></button></div><div className={styles.court} aria-hidden="true"><div className={styles.courtInner}><span className={styles.courtCenter}>5×1</span></div></div></section>
     <section className={styles.stats} aria-label="Overview metrics"><Metric label={t.activeTeams} value="06" detail="IVI / 2026" accent="green"/><Metric label={t.activeMembers} value="79" detail={locale==='en'?'Example roster':'Elenco ilustrativo'}/><Metric label={t.upcoming} value="04" detail={locale==='en'?'Next 7 days':'Próximos 7 dias'}/><Metric label={t.attendanceRate} value="84%" detail={locale==='en'?'Sample metric':'Métrica ilustrativa'} accent="orange"/></section>
     <div className={styles.twoColumns}><section className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.miniHeading}>{locale==='en'?'SCHEDULE':'AGENDA'}</span><h2>{t.nextUp}</h2></div><button type="button" className={styles.linkButton} onClick={()=>changeScreen('events')}>{t.viewAll} ↗</button></div>{events.slice(0,3).map(eventCard)}</section><section className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.miniHeading}>IVI / DIVISIONS</span><h2>{t.teamOverview}</h2></div><button type="button" className={styles.linkButton} onClick={()=>changeScreen('teams')}>{t.viewAll} ↗</button></div>{demoTeams.slice(0,4).map(tm=><button key={tm.id} className={styles.teamMini} type="button" onClick={()=>{setTeamFilter(tm.id);changeScreen('teams');}}><span className={styles.teamAvatar}>{tm.name.split(' ').slice(-1)[0].slice(0,2).toUpperCase()}</span><span><b>{tm.name}</b><small>{tm.division} · {formatGender(tm.gender)}</small></span><span className={styles.teamCount}>{tm.players} {t.players.toLowerCase()}</span></button>)}</section></div>
    </>}
    {activeScreen==='teams'&&<><div className={styles.filterRow}><label>{t.filter} <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}><option value="all">{t.all}</option>{demoTeams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}</select></label></div><div className={styles.teamGrid}>{teams.map(tm=><article key={tm.id} className={styles.teamCard}><span className={styles.teamMonogram}>{initials(tm.name.split(' ').slice(-1)[0])}</span><div className={styles.teamCardCopy}><span className={styles.miniHeading}>{tm.division} / {formatGender(tm.gender)}</span><h2>{tm.name}</h2></div><div className={styles.teamCardFooter}><span><b>{tm.players}</b> {t.players.toLowerCase()}</span><span><b>{tm.coaches}</b> {t.coaches.toLowerCase()}</span></div></article>)}</div></>}
    {activeScreen==='events'&&<><div className={styles.filterRow}><label>{t.filter} <select value={eventFilter} onChange={e=>setEventFilter(e.target.value)}><option value="all">{t.all}</option><option value="training">{t.training}</option><option value="match">{t.match}</option><option value="social">{t.social}</option></select></label><label>{t.team} <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}><option value="all">{t.all}</option>{demoTeams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}</select></label></div><section className={styles.panel}>{events.length?events.map(eventCard):<p>{t.empty}</p>}</section></>}
    {activeScreen==='members'&&<section className={styles.panel}><div className={styles.filterRow}><label className={styles.searchField}>{t.search}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/></label></div><div className={styles.memberTable}><div className={styles.tableHead}><span>{t.members}</span><span>{t.team}</span><span>{t.role}</span><span>{t.status}</span></div>{demoMembers.filter(m=>(m.name+' '+m.team).toLowerCase().includes(query.toLowerCase())).map(m=><div key={m.id} className={styles.tableRow}><span className={styles.memberName}><span className={styles.miniAvatar}>{initials(m.name)}</span>{m.name}</span><span>{m.team}</span><span>{m.role==='coach'?t.coach:t.player}</span><span className={m.status==='active'?styles.statusActive:styles.statusPending}>{m.status==='active'?t.active:t.pending}</span></div>)}</div></section>}
    {activeScreen==='attendance'&&<section className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.miniHeading}>IVI / TRAINING REGISTER</span><h2>{t.attendTitle}</h2></div><span className={styles.summaryNumber}>{Object.values(attendance).filter(Boolean).length} / {attendanceMembers.length}</span></div><div className={styles.attendList}>{attendanceMembers.map(m=><div key={m.id} className={styles.attendRow}><span className={styles.memberName}><span className={styles.miniAvatar}>{initials(m.name)}</span><span>{m.name}<small>{m.team}</small></span></span><div className={styles.attendButtons}>{(['present','late','absent'] as const).map(v=><button key={v} type="button" aria-pressed={attendance[m.id]===v} className={attendance[m.id]===v?styles.pressed:''} onClick={()=>setAttendance(old=>({...old,[m.id]:old[m.id]===v?null:v}))}>{t[v]}</button>)}</div></div>)}</div><button type="button" className={styles.primaryButton} onClick={()=>show(t.attendanceSaved)}>{t.saveAttendance}</button></section>}
    {activeScreen==='notifications'&&<section className={styles.panel}>{notices.map(n=><div key={n.id} className={styles.noticeRow}><span className={n.unread?styles.noticeUnread:styles.noticeRead}>●</span><div><span className={styles.miniHeading}>{n.kind.replaceAll('_',' ').toUpperCase()} · {n.date}</span><h3>{n.title}</h3><p>{n.body}</p></div>{n.unread&&<button type="button" className={styles.linkButton} onClick={()=>setNotices(old=>old.map(v=>v.id===n.id?{...v,unread:false}:v))}>{t.markRead}</button>}</div>)}</section>}
    {activeScreen==='settings'&&<section className={styles.panel}><h2>{t.settings}</h2><div className={styles.settingRow}><div><b>{t.language}</b><p>Português / English</p></div><select value={locale} onChange={e=>setLocale(e.target.value as Locale)}><option value="pt-BR">Português</option><option value="en">English</option></select></div><div className={styles.settingRow}><div><b>{t.appearance}</b><p>{t.light} / {t.dark}</p></div><select value={theme} onChange={e=>setTheme(e.target.value as 'light'|'dark')}><option value="light">{t.light}</option><option value="dark">{t.dark}</option></select></div><div className={styles.settingRow}><div><b>{t.role}</b><p>{t.switchDemo}</p></div><select value={role} onChange={e=>changeRole(e.target.value as Role)}><option value="admin">{t.admin}</option><option value="coach">{t.coach}</option><option value="player">{t.player}</option></select></div><p className={styles.noticeDisclaimer}>{t.demoNote}</p></section>}
    {toast&&<div role="status" className={styles.toast}>{toast}<button type="button" onClick={()=>setToast('')} aria-label={t.close}>×</button></div>}
    <footer className={styles.footer}>5×1 COURT-SIDE <span>·</span> {t.demoNote}</footer>
   </main>
  </div>
  <nav className={styles.mobileNav} aria-label="Mobile navigation">{nav.map(s=><button type="button" key={s} aria-current={activeScreen===s?'page':undefined} onClick={()=>changeScreen(s)}><span>{navIcons[s]}</span><small>{t[s]}</small></button>)}</nav>
  {event&&<div className={styles.overlay} onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section role="dialog" aria-modal="true" aria-labelledby="event-detail-title" className={styles.drawer}><div className={styles.drawerHead}><span className={styles.miniHeading}>{t.selectedEvent}</span><button aria-label={t.close} type="button" className={styles.iconButton} onClick={()=>setSelected(null)}>×</button></div><span className={styles.eventType}>{event.type==='training'?t.training:event.type==='match'?t.match:t.social}</span><h2 id="event-detail-title">{event.title}</h2><div className={styles.drawerFacts}><p><b>{t.date}</b><span>{readableDate(event.starts_at,locale)} · {readableTime(event.starts_at,locale)}–{readableTime(event.ends_at,locale)}</span></p><p><b>{t.location}</b><span>{event.venue_name}</span></p><p><b>{t.spots}</b><span>{event.going} / {event.capacity ?? '∞'} · {event.waitlist} {t.waitlist.toLowerCase()}</span></p></div><h3>{t.rsvp}</h3><p className={styles.muted}>{t.respond}</p><div className={styles.rsvpButtons}>{(['going','maybe','not_going'] as const).map(r=><button type="button" key={r} aria-pressed={responses[event.id]===r} className={responses[event.id]===r?styles.pressed:''} onClick={()=>{setResponses(old=>({...old,[event.id]:r}));show(t.saved);}}>{r==='going'?'✓':r==='maybe'?'?':'×'} {t[r]}</button>)}</div><p className={styles.noticeDisclaimer}>{t.demoNote}</p></section></div>}
 </div>;
}

function Metric({label,value,detail,accent}:{label:string;value:string;detail:string;accent?:'green'|'orange'}){
 return <div className={styles.metric}><span className={styles.metricLabel}>{label}</span><div className={styles.metricMain}><strong>{value}</strong><span className={accent==='green'?styles.metricGreen:accent==='orange'?styles.metricOrange:styles.metricDot}>↗</span></div><small>{detail}</small></div>;
}
