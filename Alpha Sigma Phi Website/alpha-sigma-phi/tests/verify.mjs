import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createToken,validToken,equalPasscode} from '../server/store-security.js';
import {monthDays,dateKey,calendarFile,validEvents} from '../public/assets/calendar-utils.js';
const secret='a-secure-test-secret-only-for-testing',pass='test-passcode';
const now=Date.now(),token=await createToken(secret,pass,now);
assert(await validToken(token,secret,pass,now));
assert(!await validToken(token,secret,'rotated-pass',now));
assert(!await validToken(token,'rotated-secret',pass,now));
assert(!await validToken(token.slice(0,-2)+'xx',secret,pass,now));
assert(!await validToken(token,secret,pass,now+8*3600000));
assert(!await validToken('malformed',secret,pass,now));
assert(await equalPasscode('match','match'));
assert(!await equalPasscode('match','mismatch'));
assert.equal(monthDays(2024,1).filter(d=>!d.outside).length,29);
assert.equal(monthDays(2026,1).filter(d=>!d.outside).length,28);
assert.equal(monthDays(2026,11).length,42);
assert.equal(new Set(monthDays(2026,11).map(d=>d.key)).size,42);
assert.equal(dateKey('2026-10-11T00:30:00Z'),'2026-10-10');
const event={id:'test',title:'Service, chapter; together',start:'2026-10-10T09:00:00-05:00',end:'2026-10-10T11:00:00-05:00',description:'Line 1\nLine 2'};
const ics=calendarFile([event]);
assert(ics.includes('DTSTART:20261010T140000Z'));
assert(ics.includes('SUMMARY:Service\\, chapter\\; together'));
assert(ics.includes('DESCRIPTION:Line 1\\nLine 2'));
assert.equal(validEvents([{...event,end:event.start}]).length,0);
for(const page of ['index','about','philanthropy','calendar','events','store','image-guide']){
 const text=readFileSync('public/'+page+'.html','utf8');
 assert(text.includes('<title>'));assert(text.includes('id="main"'));
 for(const match of text.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){
  const link=match[1];if(link==='/'||link.startsWith('/api/'))continue;
  assert(existsSync('public'+link),'Missing local target '+link+' on '+page);
 }
}
assert(existsSync('dist/server/index.js'));
const buildEntry=readFileSync('dist/server/index.js','utf8');assert(buildEntry.includes('export'));
console.log('PASS: token protection, rotation and expiry; calendar dates and export; page links and build.');
if(process.argv.includes('--integration')){
 const base='http://localhost:3000';
 const env=readFileSync('.env','utf8');
 const actual=env.match(/^STORE_PASSCODE=(.+)$/m)[1].trim();
 const request=(method,body,cookie,origin=base)=>fetch(base+'/api/store',{method,headers:{'Content-Type':'application/json','Origin':origin,...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await request('GET')).status,401);
 assert.equal((await request('POST',{passcode:'incorrect'})).status,401);
 assert.equal((await request('POST',{passcode:actual},null,'https://untrusted.example')).status,403);
 const login=await request('POST',{passcode:actual});assert.equal(login.status,200);
 const header=login.headers.get('set-cookie');assert(header.includes('HttpOnly'));assert(header.includes('SameSite=Strict'));assert(header.includes('Path=/api/store'));
 const cookie=header.split(';')[0];const catalog=await request('GET',null,cookie);assert.equal(catalog.status,200);assert(catalog.headers.get('cache-control').includes('no-store'));
 assert.equal((await catalog.json()).products.length,3);
 assert.equal((await request('GET',null,cookie.slice(0,-3)+'bad')).status,401);
 const logout=await request('POST',{action:'logout'},cookie);assert.equal(logout.status,200);assert(logout.headers.get('set-cookie').includes('Max-Age=0'));
 for(let i=0;i<8;i++)assert.equal((await request('POST',{passcode:'incorrect'})).status,401);
 assert.equal((await request('POST',{passcode:'incorrect'})).status,429);
 for(const page of ['','about.html','philanthropy.html','calendar.html','events.html','store.html','image-guide.html'])assert.equal((await fetch(base+'/'+page)).status,200);
 for(const file of readdirSync('public/assets').filter(f=>f.endsWith('.js')))assert(!readFileSync('public/assets/'+file,'utf8').includes(actual));
 console.log('PASS: all routes, unauthorized/wrong/valid/tampered store sessions, origin protection, lock and attempt limit.');
}

