import {env} from 'cloudflare:workers';
import {catalog} from '../../../server/catalog.js';
import {createToken,validToken,equalPasscode,readToken,cookie} from '../../../server/store-security.js';
export const dynamic='force-dynamic';
const failures=new Map();
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff',...headers}});
function secrets(){return {passcode:env.STORE_PASSCODE||process.env.STORE_PASSCODE,secret:env.STORE_SESSION_SECRET||process.env.STORE_SESSION_SECRET};}
export async function GET(request){const {passcode,secret}=secrets();if(!passcode||!secret)return json({error:'The store is being prepared. Please check back soon.'},503);const token=readToken(request);if(!await validToken(token,secret,passcode))return json({error:'Enter your chapter passcode to continue.'},401);return json({...catalog,expiresAt:Number(token.split('.')[0])});}
export async function POST(request){
 const url=new URL(request.url);if(request.headers.get('origin')!==url.origin)return json({error:'Please open the store on this website and try again.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Invalid request.'},415);
 const text=await request.text();if(text.length>1024)return json({error:'Invalid request.'},413);
 let body;try{body=JSON.parse(text);}catch{return json({error:'Invalid request.'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid request.'},400);
 const secure=url.protocol==='https:';
 if(body.action==='logout')return json({ok:true},200,{'Set-Cookie':cookie('',secure,true)});
 const {passcode,secret}=secrets();if(!passcode||!secret)return json({error:'The store is being prepared. Please check back soon.'},503);
 const ip=request.headers.get('cf-connecting-ip')||request.headers.get('oai-authenticated-user-id')||'local';
 const now=Date.now();for(const [id,value] of failures){if(value.until<=now)failures.delete(id);}
 const previous=failures.get(ip);if(previous?.count>=8)return json({error:'Too many attempts. Please try again in 15 minutes.'},429,{'Retry-After':String(Math.ceil((previous.until-now)/1000))});
 if(typeof body.passcode!=='string'||body.passcode.length>128)return json({error:'Enter a valid passcode.'},400);
 if(!await equalPasscode(body.passcode,passcode)){
  if(failures.size>=10000)failures.delete(failures.keys().next().value);
  failures.set(ip,{count:(previous?.count||0)+1,until:previous?.until||now+900000});
  return json({error:'That passcode does not match. Please try again.'},401);
 }
 failures.delete(ip);return json({ok:true},200,{'Set-Cookie':cookie(await createToken(secret,passcode),secure)});
}
