function fail(message){
  const error=new Error(message);
  error.statusCode=400;
  throw error;
}
function bodyString(value,name,max=120){
  if(typeof value!=='string'||!value.trim()||value.length>max)fail('Invalid '+name);
  return value.trim();
}
function parseDate(value){
  const raw=bodyString(value,'birthdate',10);
  if(!/^\d{2}\/\d{2}\/\d{4}$/.test(raw))fail('Birthdate must use DD/MM/YYYY');
  const parts=raw.split('/');
  const day=Number(parts[0]);
  const month=Number(parts[1]);
  const year=Number(parts[2]);
  const date=new Date(Date.UTC(year,month-1,day));
  if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day||year<1900||year>2100)fail('Birthdate is not a valid calendar date');
  return {day,month,year,raw};
}
function parseTime(value,name='birth time'){
  const parts=typeof value==='string'?value.split(':'):[];
  const hour=Number(parts[0]);
  const minute=Number(parts[1]);
  const valid=parts.length===2&&parts[0].length===2&&parts[1].length===2&&Number.isInteger(hour)&&Number.isInteger(minute)&&hour>=0&&hour<=23&&minute>=0&&minute<=59;
  if(!valid)fail('Invalid '+name+'; use 24-hour HH:MM');
  return value;
}
function digits(value){return String(value).replace(/\D/g,'').split('').map(Number)}
function root(value){let number=Math.abs(Number(value));while(number>9)number=String(number).split('').reduce((sum,digit)=>sum+Number(digit),0);return number}
function sumDigits(values){return values.reduce((sum,value)=>sum+Number(value),0)}
module.exports={bodyString,digits,fail,parseDate,parseTime,root,sumDigits};
