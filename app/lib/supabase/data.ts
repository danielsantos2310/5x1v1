'use client';

import {getSupabaseBrowserClient} from './browser';
import type {Database} from '../supabase.types';
import {requireUuid,validateTeam,validateEvent,validateAttendance} from '../security/validation';

type Tables = Database['public']['Tables'];
type Club = Tables['clubs']['Row'];
type Team = Tables['teams']['Row'];
type Event = Tables['events']['Row'];
type Notification = Tables['notifications']['Row'];
type Attendance = Tables['attendance_records']['Row'];
type RSVP = Tables['rsvps']['Row'];
type Membership = Tables['club_memberships']['Row'];

export type LiveClub = Club & {membership:Membership; roles:string[]};
export type LiveSnapshot = {
  userId:string;
  clubs: LiveClub[];
  activeClub: Club;
  teams:Team[];
  events:Event[];
  rsvps:RSVP[];
  attendance:Attendance[];
  notifications:Notification[];
};
export type LiveMutationResult<T> = {data:T; message:string};

function requireClub(clubId:string) {
  requireUuid(clubId,'Club ID');
}
function throwIfError(error:{message:string}|null) {
  if(error) {
    const code='code' in error ? String(error.code) : '';
    if(code==='42501'||code==='PGRST301')throw new Error('You do not have permission to complete this request.');
    if(code==='23505')throw new Error('This record already exists.');
    if(code==='23514'||code==='22P02')throw new Error('The supplied data is invalid.');
    throw new Error('Request failed. Please try again or contact your club administrator.');
  }
}

/**
 * This is a real, RLS-backed data layer. It does not accept a simulated
 * identity or use a service-role key. All reads/writes are made using the
 * actual Supabase browser session. No signed-in session => no live data.
 */
export async function getLiveSnapshot(preferredClubId?:string):Promise<LiveSnapshot> {
  const supabase=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await supabase.auth.getUser();
  if(authError?.message.toLowerCase().includes('session missing')) throw new Error('Sign in to access live club information.');
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in to access live club information.');

  const {data:memberships,error:membershipError}=await supabase
    .from('club_memberships').select('*').eq('user_id',auth.user.id).eq('status','active');
  throwIfError(membershipError);
  const ids=(memberships??[]).map(m=>m.club_id);
  if(!ids.length) throw new Error('Your account has no active club membership.');

  const {data:clubRows,error:clubError}=await supabase.from('clubs').select('*').in('id',ids);
  throwIfError(clubError);
  const visibleClubs=clubRows??[];
  if(!visibleClubs.length) throw new Error('You cannot view any clubs.');
  const club=visibleClubs.find(c=>c.id===preferredClubId)??visibleClubs[0];
  requireClub(club.id);

  const [rolesResult,teamsResult,eventsResult,rsvpResult,attendanceResult,notificationResult]=await Promise.all([
    supabase.from('club_roles').select('*').in('membership_id',(memberships??[]).map(m=>m.id)),
    supabase.from('teams').select('*').eq('club_id',club.id).order('name'),
    supabase.from('events').select('*').eq('club_id',club.id).order('starts_at',{ascending:true}).limit(100),
    supabase.from('rsvps').select('*').eq('club_id',club.id).order('created_at',{ascending:false}).limit(250),
    supabase.from('attendance_records').select('*').eq('club_id',club.id).order('marked_at',{ascending:false}).limit(250),
    supabase.from('notifications').select('*').eq('club_id',club.id).eq('recipient_id',auth.user.id).order('created_at',{ascending:false}).limit(100),
  ]);
  [rolesResult,teamsResult,eventsResult,rsvpResult,attendanceResult,notificationResult].forEach(r=>throwIfError(r.error));
  const roles=rolesResult.data??[];
  return {
    userId:auth.user.id,
    clubs:visibleClubs.map(c=>({
      ...c,membership:(memberships??[]).find(m=>m.club_id===c.id)!,
      roles:roles.filter(r=>(memberships??[]).some(m=>m.club_id===c.id&&m.id===r.membership_id)).map(r=>r.role)
    })),
    activeClub:club,
    teams:teamsResult.data??[],
    events:eventsResult.data??[],
    rsvps:rsvpResult.data??[],
    attendance:attendanceResult.data??[],
    notifications:notificationResult.data??[],
  };
}

export async function saveMyRSVP(event:Event, status:'going'|'maybe'|'not_going') {
  const client=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await client.auth.getUser();
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in before responding to an event.');
  // The database trigger controls capacity and decides whether Going => Waitlist.
  const {data,error}=await client.from('rsvps').upsert({
    event_id:event.id,club_id:event.club_id,user_id:auth.user.id,status
  },{onConflict:'event_id,user_id'}).select('*').single();
  throwIfError(error);
  if(!data) throw new Error('The server did not confirm your response.');
  return data;
}

export async function saveAttendance(input:{
  club_id:string;event_id:string;user_id:string;status:'present'|'absent'|'late'
}) {
  requireUuid(input.club_id,'Club ID');requireUuid(input.event_id,'Event ID');requireUuid(input.user_id,'Player ID');validateAttendance(input.status);
  const client=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await client.auth.getUser();
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in to manage attendance.');
  const {data,error}=await client.from('attendance_records').upsert({
    ...input,marked_by:auth.user.id
  },{onConflict:'event_id,user_id'}).select('*').single();
  throwIfError(error);
  if(!data) throw new Error('Attendance was not confirmed by the server.');
  return data;
}

export async function markNotificationRead(id:string) {
  const client=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await client.auth.getUser();
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in to update notifications.');
  const {data,error}=await client.from('notifications').update({read_at:new Date().toISOString()})
    .eq('id',id).eq('recipient_id',auth.user.id).select('id,read_at').single();
  throwIfError(error);
  if(!data) throw new Error('The notification could not be marked as read.');
  return data;
}

export async function createTeam(input:Pick<Team,'club_id'|'name'|'division'|'gender'>) {
  requireClub(input.club_id);validateTeam(input);
  const client=getSupabaseBrowserClient();
  const {data,error}=await client.from('teams').insert(input).select('*').single();
  throwIfError(error);
  if(!data) throw new Error('The team was not created.');
  return data;
}

export async function createEvent(input:Pick<Event,'club_id'|'team_id'|'title'|'type'|'starts_at'|'ends_at'|'capacity'|'venue_name'|'rsvp_deadline'>) {
  requireClub(input.club_id);validateEvent(input);if(input.team_id!==null)requireUuid(input.team_id,'Team ID');
  const client=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await client.auth.getUser();
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in to create an event.');
  const {data,error}=await client.from('events').insert({...input,created_by:auth.user.id,status:'scheduled'}).select('*').single();
  throwIfError(error);
  if(!data) throw new Error('The event was not created.');
  return data;
}


export type EditableEvent = Event;

export async function updateEvent(event:Event, changes:Pick<Event,'title'|'type'|'starts_at'|'ends_at'|'venue_name'|'capacity'|'rsvp_deadline'>){
  requireUuid(event.id,'Event ID');validateEvent(changes);
  const client=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await client.auth.getUser();
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in to edit an event.');
  if(event.status!=='scheduled') throw new Error('Cancelled events cannot be edited.');
  const {data,error}=await client.from('events').update(changes)
    .eq('id',event.id).eq('club_id',event.club_id).eq('status','scheduled')
    .eq('updated_at',event.updated_at).select('*').maybeSingle();
  throwIfError(error);
  if(!data) throw new Error('Event was changed or is no longer available. Refresh and try again.');
  return data;
}

export async function cancelEvent(event:Event){
  const client=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await client.auth.getUser();
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in to cancel an event.');
  if(event.status!=='scheduled') throw new Error('This event is already cancelled.');
  const {data,error}=await client.from('events').update({status:'cancelled'})
    .eq('id',event.id).eq('club_id',event.club_id).eq('status','scheduled')
    .eq('updated_at',event.updated_at).select('*').maybeSingle();
  throwIfError(error);
  if(!data) throw new Error('Event was changed or cancelled elsewhere. Refresh first.');
  return data;
}


/** Restricted event roster: names are returned only by the authorized SQL function. */
export async function getEventAttendance(event:Event){
 const client=getSupabaseBrowserClient();
 const {data:auth,error:authError}=await client.auth.getUser();
 throwIfError(authError);
 if(!auth.user)throw new Error('Sign in to view attendance.');
 const [roster,marks]=await Promise.all([
  client.rpc('event_attendance_roster',{p_event_id:event.id}),
  client.from('attendance_records').select('user_id,status,marked_at').eq('club_id',event.club_id).eq('event_id',event.id)
 ]);
 throwIfError(roster.error);throwIfError(marks.error);
 return {participants:roster.data??[], marks:marks.data??[]};
}
