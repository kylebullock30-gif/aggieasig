const encoder=new TextEncoder();
export const cookieName='theta_rho_store';
const hours=8;
async function key(secret,passcode){return crypto.subtle.importKey('raw',encoder.encode(secret+'|'+passcode),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function base64url(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(value){const s=value.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(s.padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));}
export async function equalPasscode(candidate,expected){const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(candidate)),crypto.subtle.digest('SHA-256',encoder.encode(expected))]);const av=new Uint8Array(a),bv=new Uint8Array(b);let diff=0;for(let i=0;i<av.length;i++)diff|=av[i]^bv[i];return diff===0;}
export async function createToken(secret,passcode,now=Date.now()){const payload=String(now+hours*3600000)+'.'+base64url(crypto.getRandomValues(new Uint8Array(16)));const signature=new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret,passcode),encoder.encode(payload)));return payload+'.'+base64url(signature);}
export async function validToken(token,secret,passcode,now=Date.now()){if(!token||token.length>256)return false;try{const parts=token.split('.');if(parts.length!==3||!/^\d+$/.test(parts[0]))return false;const expires=Number(parts[0]);if(expires<=now||expires>now+hours*3600000)return false;return await crypto.subtle.verify('HMAC',await key(secret,passcode),decode(parts[2]),encoder.encode(parts[0]+'.'+parts[1]));}catch{return false;}}
export function readToken(request){const part=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='));return part?.slice(cookieName.length+1)||'';}
export function cookie(value,secure,remove=false){return cookieName+'='+value+'; Path=/api/store; HttpOnly; SameSite=Strict; Max-Age='+(remove?0:hours*3600)+(secure?'; Secure':'');}

