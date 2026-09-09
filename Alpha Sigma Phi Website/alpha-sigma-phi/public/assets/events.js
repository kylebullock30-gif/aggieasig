import {events as source} from './events-data.js';
import {icon,escapeHTML as esc,safeLink} from './main.js';
import {timeZone,dateKey,parseDay,localKey,monthDays,validEvents,calendarFile} from './calendar-utils.js';
const events=validEvents(source);
const upcoming=events.filter(e=>new Date(e.end)>=new Date());
const format=(date,opts)=>new Intl.DateTimeFormat('en-US',{timeZone,...opts}).format(new Date(date));
const empty=(title='The next chapter is coming.',copy='No upcoming events have been announced. Check back for chapter gatherings and opportunities to give back.')=>'<div class="empty-state">'+icon('calendar')+'<h3>'+title+'</h3><p>'+copy+'</p></div>';
function eventCard(e){const url=e.rsvpUrl&&safeLink(e.rsvpUrl);return '<article class="event-card" id="event-'+esc(e.id)+'"><div class="date-tile"><span>'+format(e.start,{month:'short'})+'</span><strong>'+format(e.start,{day:'numeric'})+'</strong></div><div><span class="event-category">'+esc(e.category||'Chapter')+'</span><h3>'+esc(e.title)+'</h3><p class="event-meta">'+format(e.start,{weekday:'long',month:'short',day:'numeric',year:'numeric'})+' · '+format(e.start,{hour:'numeric',minute:'2-digit'})+' CT<br>'+esc(e.location||'Location to be announced')+'</p>'+(e.description?'<details><summary>Event details</summary><p class="event-description">'+esc(e.description)+'</p></details>':'')+'</div>'+(url?'<a class="button secondary small" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Event registration '+icon('arrow-up-right')+'</a>':'')+'</article>';}
const home=document.getElementById('home-events');if(home)home.innerHTML=upcoming.length?upcoming.slice(0,2).map(eventCard).join(''):empty();
const listing=document.getElementById('events-list');
if(listing){function filter(category){document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));const selected=category==='All'?upcoming:upcoming.filter(e=>e.category===category);listing.innerHTML=selected.length?selected.map(eventCard).join(''):empty(category==='All'?'The next chapter is coming.':'No '+category.toLowerCase()+' events announced.');}
 document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{const category=b.dataset.category;filter(category);const url=new URL(location.href);category==='All'?url.searchParams.delete('category'):url.searchParams.set('category',category);history.replaceState(null,'',url);}));
 const query=new URLSearchParams(location.search).get('category');filter(['Brotherhood','Philanthropy','Chapter'].includes(query)?query:'All');
}
const grid=document.getElementById('calendar-grid');
if(grid){
 let selected=dateKey(new Date()),view=parseDay(selected);
 const today=dateKey(new Date());
 const label=document.getElementById('calendar-month'),dayTitle=document.getElementById('selected-date'),dayEvents=document.getElementById('day-events');
 function render(focus=false){
 label.textContent=view.toLocaleDateString('en-US',{month:'long',year:'numeric'});
 grid.innerHTML=monthDays(view.getFullYear(),view.getMonth()).map(d=>{const count=events.filter(e=>dateKey(e.start)===d.key).length;return '<button class="calendar-day '+(d.outside?'outside ':'')+(d.key===today?'today ':'')+(d.key===selected?'selected':'')+'" data-date="'+d.key+'" aria-pressed="'+(d.key===selected)+'" tabindex="'+(d.key===selected?'0':'-1')+'" aria-label="'+parseDay(d.key).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})+(count?', '+count+' event'+(count===1?'':'s'):'')+'"><span class="day-number">'+d.day+'</span>'+(count?'<span class="event-dot" aria-hidden="true"></span>':'')+'</button>';}).join('');
 dayTitle.textContent=parseDay(selected).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
 const daily=events.filter(e=>dateKey(e.start)===selected);
 dayEvents.innerHTML=daily.length?daily.map(e=>'<article class="day-event"><span class="event-category">'+esc(e.category||'Chapter')+'</span><h4>'+esc(e.title)+'</h4><p>'+format(e.start,{hour:'numeric',minute:'2-digit'})+' CT · '+esc(e.location||'Location to be announced')+'</p><p>'+esc(e.description||'')+'</p></article>').join(''):'<p>No events scheduled for this day.</p>';
 const count=events.filter(e=>dateKey(e.start).startsWith(localKey(view).slice(0,7))).length;
 document.getElementById('calendar-status').textContent=count?count+' event'+(count===1?'':'s')+' this month.':'No chapter events announced for this month.';
 if(focus)grid.querySelector('[data-date="'+selected+'"]')?.focus();
 }
 grid.addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b)return;selected=b.dataset.date;view=parseDay(selected);render(true);});
 grid.addEventListener('keydown',e=>{const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};if(!(e.key in offsets))return;e.preventDefault();const d=parseDay(selected);d.setDate(d.getDate()+offsets[e.key]);selected=localKey(d);view=d;render(true);});
 function changeMonth(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1,12);selected=localKey(view);render();}
 document.getElementById('prev-month').addEventListener('click',()=>changeMonth(-1));
 document.getElementById('next-month').addEventListener('click',()=>changeMonth(1));
 document.getElementById('today-button').addEventListener('click',()=>{selected=dateKey(new Date());view=parseDay(selected);render();});
 const exportButton=document.getElementById('export-calendar');exportButton.disabled=!upcoming.length;exportButton.title=upcoming.length?'Download announced upcoming events':'Available when upcoming events are announced';
 exportButton.addEventListener('click',()=>{if(!upcoming.length)return;const url=URL.createObjectURL(new Blob([calendarFile(upcoming)],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='theta-rho-events.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});render();
}

