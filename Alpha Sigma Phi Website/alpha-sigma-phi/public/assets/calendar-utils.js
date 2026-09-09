export const timeZone='America/Chicago';
export function dateKey(value){return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
export function parseDay(key){const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d,12);}
export function localKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
export function monthDays(year,month){const start=new Date(year,month,1,12);start.setDate(start.getDate()-start.getDay());return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return {key:localKey(d),day:d.getDate(),outside:d.getMonth()!==month};});}
export function validEvents(events){return events.filter(e=>e.id&&e.title&&Number.isFinite(Date.parse(e.start))&&Number.isFinite(Date.parse(e.end))&&Date.parse(e.end)>Date.parse(e.start)).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));}
const esc=value=>String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
function fold(line){let result='',length=0;for(const char of line){const size=new TextEncoder().encode(char).length;if(length+size>75){result+='\r\n ';length=1;}result+=char;length+=size;}return result;}
export function calendarFile(events,now=new Date()){const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Theta Rho//Chapter Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];for(const e of validEvents(events)){lines.push('BEGIN:VEVENT','UID:'+esc(e.id)+'@thetarho.alphasig','DTSTAMP:'+stamp(now),'DTSTART:'+stamp(e.start),'DTEND:'+stamp(e.end),'SUMMARY:'+esc(e.title),'LOCATION:'+esc(e.location),'DESCRIPTION:'+esc(e.description),'END:VEVENT');}lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';}

