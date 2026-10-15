'use client';

import {getSupabaseBrowserClient} from './browser';
import type {Database} from '../supabase.types';

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
  if (!clubId || typeof clubId!=='string') throw new Error('Select a club first.');
}
function throwIfError(error:{message:string}|null) {
  if(error) throw new Error(error.message);
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
  requireClub(input.club_id);
  const client=getSupabaseBrowserClient();
  const {data,error}=await client.from('teams').insert(input).select('*').single();
  throwIfError(error);
  if(!data) throw new Error('The team was not created.');
  return data;
}

export async function createEvent(input:Pick<Event,'club_id'|'team_id'|'title'|'type'|'starts_at'|'ends_at'|'capacity'|'venue_name'|'rsvp_deadline'>) {
  requireClub(input.club_id);
  const client=getSupabaseBrowserClient();
  const {data:auth,error:authError}=await client.auth.getUser();
  throwIfError(authError);
  if(!auth.user) throw new Error('Sign in to create an event.');
  const {data,error}=await client.from('events').insert({...input,created_by:auth.user.id,status:'scheduled'}).select('*').single();
  throwIfError(error);
  if(!data) throw new Error('The event was not created.');
  return data;
}
