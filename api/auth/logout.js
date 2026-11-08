const {isSameOrigin,send}=require('../../server/lib/http');const {clearCookie}=require('../../server/lib/auth');
module.exports=(req,res)=>{if(req.method!=='POST')return send(res,405,{error:'Method not allowed'},{Allow:'POST'});if(!isSameOrigin(req))return send(res,403,{error:'Cross-origin request blocked'});return send(res,200,{ok:true},{'Set-Cookie':clearCookie()})};
