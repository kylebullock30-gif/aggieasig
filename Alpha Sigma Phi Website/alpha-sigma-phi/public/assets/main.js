import {siteConfig} from './site-config.js';
const shapes={
 'arrow-right':'<path d="M4 12h16M13 5l7 7-7 7"/>','arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 'chevron-left':'<path d="m15 18-6-6 6-6"/>','chevron-right':'<path d="m9 18 6-6-6-6"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/>'
};
export function icon(name){return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[name]||shapes['arrow-up-right'])+'</svg>';}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function safeLink(value){try{const url=new URL(value,location.origin);return ['https:','http:','mailto:'].includes(url.protocol)?url.href:'';}catch{return '';}}
export function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
const links=[['home','Home','/'],['about','About Us','/about.html'],['philanthropy','Philanthropy','/philanthropy.html'],['calendar','Calendar','/calendar.html'],['events','Events','/events.html'],['store','Store','/store.html']];
const brand='<a class="brand" href="/" aria-label="Alpha Sigma Phi home"><span class="brand-letters" aria-hidden="true">ΑΣΦ</span><span><span class="brand-name">Alpha Sigma Phi</span><span class="brand-sub">'+escapeHTML(siteConfig.chapter)+' · Texas A&M</span></span></a>';
const header=document.getElementById('site-header');
if(header)header.innerHTML='<div class="topbar">'+escapeHTML(siteConfig.university)+' &nbsp; / &nbsp; '+escapeHTML(siteConfig.chapter)+' Chapter</div><header class="site-header"><div class="container header-inner">'+brand+'<button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="site-nav"><span class="menu-label">Menu</span>'+icon('menu')+'</button><nav id="site-nav" class="desktop-nav" aria-label="Main navigation">'+links.map(([key,label,url])=>'<a href="'+url+'" '+(key===document.body.dataset.page?'aria-current="page"':'')+' '+(key==='store'?'class="nav-store"':'')+'>'+(key==='store'?icon('lock'):'')+label+'</a>').join('')+'</nav></div></header>';
const footer=document.getElementById('site-footer');
if(footer)footer.innerHTML='<footer class="site-footer"><div class="container"><div class="footer-main"><div class="footer-brand">'+brand+'<p>To Better the Man.<br>'+escapeHTML(siteConfig.university)+'<br>'+escapeHTML(siteConfig.location)+'</p></div><div><div class="footer-heading">Around the chapter</div><nav class="footer-links" aria-label="Footer navigation">'+links.slice(1).map(([,label,url])=>'<a href="'+url+'">'+label+'</a>').join('')+'</nav></div><div class="footer-social"><div class="footer-heading">Stay connected</div><div class="social-links">'+siteConfig.socials.filter(s=>safeLink(s.href)).map(s=>'<a class="social-link" href="'+escapeHTML(safeLink(s.href))+'" target="_blank" rel="noopener noreferrer" aria-label="'+escapeHTML(s.label)+'" title="'+escapeHTML(s.label)+'">'+(s.iconImage?'<img src="'+escapeHTML(s.iconImage)+'" alt="">':icon(s.icon))+'</a>').join('')+'</div></div></div><div class="footer-bottom"><span>© '+new Date().getFullYear()+' Alpha Sigma Phi · '+escapeHTML(siteConfig.chapter)+' Chapter</span><span><a href="/image-guide.html">Website & image guide</a> &nbsp; · &nbsp; <a href="https://www.alphasig.org/" target="_blank" rel="noopener noreferrer">National organization ↗</a></span></div></div></footer>';
const menuButton=document.querySelector('.menu-toggle'),nav=document.getElementById('site-nav');
function closeMenu(){menuButton?.setAttribute('aria-expanded','false');nav?.classList.remove('open');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menuButton.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
export function applyImages(root=document){root.querySelectorAll('[data-image-slot]').forEach(slot=>{const entry=siteConfig.images[slot.dataset.imageSlot];if(!entry?.src)return;const img=new Image();img.alt=entry.alt||'';img.loading=slot.dataset.imageSlot==='home-banner'?'eager':'lazy';img.decoding='async';img.addEventListener('load',()=>{slot.replaceChildren(img);slot.classList.add('has-image');});img.src=entry.src;});}
hydrateIcons();applyImages();
if(['home','events','calendar'].includes(document.body.dataset.page))import('./events.js');
if(document.body.dataset.page==='store')import('./store.js');

