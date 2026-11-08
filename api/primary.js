const {isSameOrigin,readJson,send}=require('../server/lib/http');
const {requireSession}=require('../server/lib/auth');
const {calculate}=require('../server/features/primary');

module.exports=(req,res)=>{
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'},{Allow:'POST'});
  if(!isSameOrigin(req))return send(res,403,{error:'Cross-origin request blocked'});
  try{requireSession(req);return send(res,200,calculate(readJson(req)))}catch(error){return send(res,error.statusCode||500,{error:error.statusCode?error.message:'Unable to calculate primary report'})}
};
