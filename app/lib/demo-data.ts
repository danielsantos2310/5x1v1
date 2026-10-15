import type { Database } from './supabase.types';

export type Role = 'admin' | 'coach' | 'player';
export type Locale = 'pt-BR' | 'en';
export type Screen = 'overview' | 'teams' | 'events' | 'members' | 'attendance' | 'notifications' | 'settings';
export type RSVP = 'going' | 'maybe' | 'not_going' | 'waitlist' | null;
export type Team = Pick<Database['public']['Tables']['teams']['Row'], 'id' | 'name' | 'division' | 'gender'> & { players: number; coaches: number };
export type Event = Pick<Database['public']['Tables']['events']['Row'], 'id' | 'title' | 'type' | 'capacity' | 'venue_name' | 'starts_at' | 'ends_at' | 'status' | 'team_id'> & { going: number; maybe: number; waitlist: number };
export type Member = { id: string; name: string; team: string; role: 'coach' | 'player'; status: 'active' | 'pending' };
export type Notice = { id: string; kind: string; title: string; body: string; date: string; unread: boolean };

export const demoTeams: Team[] = [
  { id:'dragons', name:'IVI Dragons', division:'Division 3', gender:'men', players:14, coaches:2 },
  { id:'dinosaurs', name:'IVI Dinosaurs', division:'Division 2', gender:'men', players:13, coaches:2 },
  { id:'vixens', name:'IVI Vixens', division:'Division 4', gender:'women', players:12, coaches:1 },
  { id:'ravens', name:'IVI Ravens', division:'Division 3', gender:'men', players:15, coaches:2 },
  { id:'phoenix', name:'IVI Phoenix', division:'Regional', gender:'women', players:13, coaches:1 },
  { id:'lynx', name:'IVI Lynx', division:'Regional', gender:'women', players:12, coaches:1 },
];
export const demoEvents: Event[] = [
  {id:'e1',title:'Defensive systems training',type:'training',starts_at:'2026-10-19T18:00:00+01:00',ends_at:'2026-10-19T20:00:00+01:00',venue_name:'Collinstown Sports Complex',capacity:16,status:'scheduled',team_id:'dragons',going:11,maybe:2,waitlist:0},
  {id:'e2',title:'IVI Ravens vs Aer Lingus',type:'match',starts_at:'2026-10-18T13:30:00+01:00',ends_at:'2026-10-18T15:30:00+01:00',venue_name:'Collinstown Sports Complex',capacity:16,status:'scheduled',team_id:'ravens',going:14,maybe:1,waitlist:2},
  {id:'e3',title:'Club skills clinic',type:'training',starts_at:'2026-10-22T19:00:00+01:00',ends_at:'2026-10-22T21:00:00+01:00',venue_name:'Collinstown Sports Complex',capacity:18,status:'scheduled',team_id:null,going:9,maybe:3,waitlist:0},
  {id:'e4',title:'IVI Vixens vs Kilkenny Spartans',type:'match',starts_at:'2026-10-18T14:00:00+01:00',ends_at:'2026-10-18T16:00:00+01:00',venue_name:'Loreto Secondary School, Kilkenny',capacity:16,status:'scheduled',team_id:'vixens',going:13,maybe:0,waitlist:0},
];
export const demoMembers: Member[] = [
  {id:'m1',name:'Alexia',team:'IVI Vixens',role:'coach',status:'active'},
  {id:'m2',name:'Renato',team:'IVI Dragons',role:'coach',status:'active'},
  {id:'m3',name:'Sophie',team:'IVI Vixens',role:'player',status:'active'},
  {id:'m4',name:'Guido',team:'IVI Ravens',role:'player',status:'active'},
  {id:'m5',name:'Sandra',team:'IVI Phoenix',role:'player',status:'pending'},
  {id:'m6',name:'Lucio',team:'IVI Dinosaurs',role:'player',status:'active'},
];
export const demoNotices: Notice[] = [
  {id:'n1',kind:'event_changed',title:'Training updated',body:'Defensive systems training · new session details.',date:'15 Oct',unread:true},
  {id:'n2',kind:'waitlist_promoted',title:'You have a spot!',body:'You were moved from the waiting list to Going.',date:'14 Oct',unread:true},
  {id:'n3',kind:'event_created',title:'New club clinic',body:'Club skills clinic was added to the calendar.',date:'13 Oct',unread:false},
];
export const labels = {
  'pt-BR':{
    subtitle:'Gestão de voleibol',demo:'MODO DEMO · DADOS ILUSTRATIVOS',overview:'Visão geral',teams:'Equipes',events:'Eventos',members:'Membros',attendance:'Presenças',notifications:'Notificações',settings:'Configurações',club:'Clube',role:'Perfil demo',admin:'Administrador',coach:'Treinador',player:'Atleta',welcome:'Bem-vindo ao clube',overviewHeading:'O clube, em jogo.',overviewLead:'Tudo o que importa, de olho no próximo apito.',activeTeams:'Equipes',activeMembers:'Atletas ativos',upcoming:'Próximos eventos',attendanceRate:'Presença média',nextUp:'A seguir, na quadra',quickActions:'Acesso rápido',viewAll:'Ver todos',teamOverview:'Suas equipes',teamLead:'Elencos e divisões em um só lugar.',players:'Atletas',coaches:'Treinadores',calendar:'Agenda do clube',calendarLead:'Treinos, partidas e encontros.',all:'Todos',training:'Treino',match:'Partida',social:'Social',spots:'Vagas',rsvp:'Sua presença',going:'Vou',maybe:'Talvez',not_going:'Não vou',waitlist:'Em espera',respond:'Escolha uma resposta para este evento.',saved:'Resposta salva apenas nesta demonstração.',memberList:'Membros e aprovações',memberLead:'Confira o elenco e solicitações.',search:'Buscar por nome ou equipe',status:'Situação',active:'Ativo',pending:'Pendente',attendTitle:'Controle de presença',attendLead:'Marque a presença por treino ou jogo.',present:'Presente',absent:'Ausente',late:'Atrasado',unmarked:'Não marcado',saveAttendance:'Salvar demonstração',attendanceSaved:'Presenças atualizadas somente no demo.',notificationsLead:'Atualizações e avisos do clube.',markRead:'Marcar como lida',settingsLead:'Preferências locais de demonstração.',language:'Idioma',appearance:'Aparência',light:'Claro',dark:'Escuro',demoNote:'Dados ilustrativos. Nenhuma alteração é enviada ao Supabase.',empty:'Nenhum item encontrado.',selectedEvent:'Evento selecionado',close:'Fechar',goToEvents:'Abrir eventos',noPermission:'Esta seção requer perfil de administrador ou treinador.',switchDemo:'Alternar função para visualizar outro fluxo.',team:'Equipe',date:'Data',location:'Local',filter:'Filtrar',manage:'Gerenciar',notificationsZero:'Nenhum aviso novo',back:'Voltar',actionDemo:'Ação disponível apenas como protótipo. Nenhum dado real foi alterado.'},
  en:{
    subtitle:'Volleyball management',demo:'DEMO MODE · ILLUSTRATIVE DATA',overview:'Overview',teams:'Teams',events:'Events',members:'Members',attendance:'Attendance',notifications:'Notifications',settings:'Settings',club:'Club',role:'Demo role',admin:'Administrator',coach:'Coach',player:'Player',welcome:'Welcome to your club',overviewHeading:'Stay ahead of the game.',overviewLead:'Everything that matters before the next whistle.',activeTeams:'Teams',activeMembers:'Active players',upcoming:'Upcoming events',attendanceRate:'Average attendance',nextUp:'Next on court',quickActions:'Quick access',viewAll:'View all',teamOverview:'Your teams',teamLead:'Squads and divisions in one place.',players:'Players',coaches:'Coaches',calendar:'Club schedule',calendarLead:'Training sessions, matches and gatherings.',all:'All',training:'Training',match:'Match',social:'Social',spots:'Spots',rsvp:'Your response',going:'Going',maybe:'Maybe',not_going:'Not going',waitlist:'Waitlisted',respond:'Choose your response for this event.',saved:'Response stored in this demo only.',memberList:'Members and approvals',memberLead:'Review your squad and requests.',search:'Search by name or team',status:'Status',active:'Active',pending:'Pending',attendTitle:'Attendance register',attendLead:'Mark attendance for each session.',present:'Present',absent:'Absent',late:'Late',unmarked:'Not marked',saveAttendance:'Save demo',attendanceSaved:'Attendance updated in this demo only.',notificationsLead:'Club updates and messages.',markRead:'Mark as read',settingsLead:'Local demo preferences.',language:'Language',appearance:'Appearance',light:'Light',dark:'Dark',demoNote:'Illustrative data. No changes are sent to Supabase.',empty:'Nothing found.',selectedEvent:'Selected event',close:'Close',goToEvents:'Open events',noPermission:'This screen requires an administrator or coach role.',switchDemo:'Switch demo roles to explore another workflow.',team:'Team',date:'Date',location:'Location',filter:'Filter',manage:'Manage',notificationsZero:'No new notices',back:'Back',actionDemo:'Prototype action only. No real data was changed.'}
} as const;
