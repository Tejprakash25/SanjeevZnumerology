const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const querystring=require('node:querystring');
const root=__dirname;
for(const line of (fs.existsSync(path.join(root,'.env'))?fs.readFileSync(path.join(root,'.env'),'utf8'):'').split(/\r?\n/)){const match=/^([A-Z0-9_]+)=(.*)$/.exec(line);if(match&&!process.env[match[1]])process.env[match[1]]=match[2]}
const handlers={'/api/auth/login':require('./api/auth/login'),'/api/auth/logout':require('./api/auth/logout'),'/api/auth/session':require('./api/auth/session'),'/api/primary':require('./api/primary'),'/api/vedic':require('./api/vedic'),'/api/mobile':require('./api/mobile')};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
function invoke(handler,req,res,body){const response={statusCode:200,headers:{},setHeader(key,value){this.headers[key]=value},status(code){this.statusCode=code;return this},json(payload){for(const [key,value] of Object.entries(this.headers))res.setHeader(key,value);res.statusCode=this.statusCode;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(payload));return this}};req.body=body;handler(req,response)}
const server=http.createServer((req,res)=>{const url=new URL(req.url,`http://${req.headers.host}`);const handler=handlers[url.pathname];if(handler){let body='';req.on('data',chunk=>{body+=chunk});req.on('end',()=>invoke(handler,req,res,body));return}const requested=url.pathname==='/'?'/index.html':url.pathname;const file=path.resolve(root,'.'+requested);const relative=path.relative(root,file);if(relative==='..'||relative.startsWith(`..${path.sep}`)||path.isAbsolute(relative)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;res.end('Not found');return}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res)});
const port=Number(process.env.PORT||3000);server.listen(port,'127.0.0.1',()=>console.log(`ANKA local server: http://127.0.0.1:${port}`));
