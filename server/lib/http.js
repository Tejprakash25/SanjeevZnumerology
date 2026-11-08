function securityHeaders(){return {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'"}}
function send(res,status,payload,headers={}){Object.entries({...securityHeaders(),...headers}).forEach(([key,value])=>res.setHeader(key,value));res.status(status).json(payload)}
function isSameOrigin(req){
  const origin=req.headers.origin;
  if(!origin)return true;
  try{return new URL(origin).host===req.headers.host}catch{return false}
}
function readJson(req){
  let body=req.body;
  if(!body||typeof body!=='object'||Array.isArray(body)||Buffer.isBuffer(body)){
    try{body=JSON.parse(body||'{}')}catch{
      const error=new Error('Invalid JSON request body');
      error.statusCode=400;
      throw error;
    }
  }
  if(!body||typeof body!=='object'||Array.isArray(body)){
    const error=new Error('Request body must be a JSON object');
    error.statusCode=400;
    throw error;
  }
  return body;
}
module.exports={isSameOrigin,send,readJson,securityHeaders};
