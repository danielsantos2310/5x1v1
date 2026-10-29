/** Client-side consistency checks. Database constraints and RLS remain authoritative. */
export function isUuid(value:string):boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
export function requireUuid(value:string,label='Identifier'):void {
  if(!isUuid(value))throw new Error(label+' is invalid.');
}
export function validateTeam(input:{name:string;division:string;gender:string}):void {
  if(input.name.trim().length<2||input.name.trim().length>100)throw new Error('Team name must be 2–100 characters.');
  if(input.division.trim().length<2||input.division.trim().length>80)throw new Error('Division must be 2–80 characters.');
  if(!['men','women','mixed'].includes(input.gender))throw new Error('Team category is invalid.');
}
export function validateEvent(input:{title:string;type:string;starts_at:string;ends_at:string;capacity:number|null;venue_name:string|null;rsvp_deadline:string|null}):void {
  if(!input.title.trim()||input.title.trim().length>160)throw new Error('Event title must be 1–160 characters.');
  if(!['training','match','social'].includes(input.type))throw new Error('Event type is invalid.');
  const start=Date.parse(input.starts_at),end=Date.parse(input.ends_at);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw new Error('Event end must follow its start.');
  if(input.rsvp_deadline!==null){const deadline=Date.parse(input.rsvp_deadline);if(!Number.isFinite(deadline)||deadline>start)throw new Error('RSVP deadline must be before the event.');}
  if(input.capacity!==null&&(!Number.isSafeInteger(input.capacity)||input.capacity<1||input.capacity>10000))throw new Error('Event capacity is invalid.');
  if(input.venue_name!==null&&input.venue_name.length>250)throw new Error('Venue name is too long.');
}
export function validateAttendance(status:string):void {
  if(!['present','absent','late'].includes(status))throw new Error('Attendance status is invalid.');
}
