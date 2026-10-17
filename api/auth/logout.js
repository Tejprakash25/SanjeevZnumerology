const {send}=require('../../server/lib/http');const {clearCookie}=require('../../server/lib/auth');
module.exports=(req,res)=>{if(req.method!=='POST')return send(res,405,{error:'Method not allowed'},{Allow:'POST'});return send(res,200,{ok:true},{'Set-Cookie':clearCookie()})};
