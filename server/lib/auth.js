const crypto=require('node:crypto');
const COOKIE='anka_session';
const maxAge=()=>Math.max(300,Number(process.env.SESSION_MAX_AGE_SECONDS||3600));
function required(name){if(!process.env[name])throw new Error(`Missing required environment variable: ${name}`);return process.env[name]}
function safeEqual(a,b){const left=Buffer.from(String(a));const right=Buffer.from(String(b));return left.length===right.length&&crypto.timingSafeEqual(left,right)}
function sign(value){return crypto.createHmac('sha256',required('SESSION_SECRET')).update(value).digest('base64url')}
function issueSession(username){const payload=Buffer.from(JSON.stringify({sub:username,exp:Date.now()+maxAge()*1000})).toString('base64url');return `${payload}.${sign(payload)}`}
function parseCookies(header=''){
  const cookies={};
  for(const item of header.split(';')){
    const separator=item.indexOf('=');
    if(separator<0)continue;
    try{
      const name=decodeURIComponent(item.slice(0,separator).trim());
      const value=decodeURIComponent(item.slice(separator+1).trim());
      cookies[name]=value;
    }catch{continue}
  }
  return cookies;
}
function readSession(req){const token=parseCookies(req.headers.cookie||'')[COOKIE];if(!token)return null;const [payload,signature]=token.split('.');if(!payload||!signature||!safeEqual(signature,sign(payload)))return null;try{const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));return data.exp>Date.now()?data:null}catch{return null}}
function requireSession(req){const session=readSession(req);if(!session){const error=new Error('Authentication required');error.statusCode=401;throw error}return session}
function login(username,password){const expectedUser=required('AUTH_USERNAME');const expectedPassword=required('AUTH_PASSWORD');if(!safeEqual(username,expectedUser)||!safeEqual(password,expectedPassword)){const error=new Error('Invalid credentials');error.statusCode=401;throw error}return issueSession(expectedUser)}
function sessionCookie(token){return `${COOKIE}=${encodeURIComponent(token)}; Max-Age=${maxAge()}; Path=/; HttpOnly; Secure; SameSite=Strict`}
function clearCookie(){return `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`}
module.exports={clearCookie,login,readSession,requireSession,sessionCookie};
