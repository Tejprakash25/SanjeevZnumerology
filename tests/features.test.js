const test=require('node:test');
const assert=require('node:assert/strict');
process.env.AUTH_USERNAME='synthetic-operator';
process.env.AUTH_PASSWORD='synthetic-password';
process.env.SESSION_SECRET='synthetic-session-secret-that-is-long-enough';
process.env.SESSION_MAX_AGE_SECONDS='3600';
const primary=require('../server/features/primary');
const vedic=require('../server/features/vedic');
const mobile=require('../server/features/mobile');
const auth=require('../server/lib/auth');
const primaryApi=require('../api/primary');
const postApis=[
  require('../api/auth/login'),
  require('../api/auth/logout'),
  primaryApi,
  require('../api/vedic'),
  require('../api/mobile')
];

function mockResponse(){return {statusCode:200,headers:{},body:null,setHeader(key,value){this.headers[key]=value},status(code){this.statusCode=code;return this},json(body){this.body=body;return this}}}

test('primary uses synthetic input and requires an approved unknown-time choice',()=>{
  assert.throws(()=>primary.calculate({fullName:'Synthetic Person',birthDate:'31/02/1990',assumedTime:'05:00'}),/valid calendar date/);
  assert.throws(()=>primary.calculate({fullName:'Synthetic Person',birthDate:'01/01/1990'}),/requires birth time/);
  const report=primary.calculate({fullName:'Synthetic Person',birthDate:'01/01/1990',assumedTime:'05:00'});
  assert.equal(report.report.birthTimeLabel,'05:00 IST (assumed)');
  assert.equal(report.feature,'primary');
  assert.ok(report.report.sections.some(section=>section.title==='Remedies'));
});
test('primary accepts known IST time and does not add Vedic or mobile rules',()=>{
  const report=primary.calculate({fullName:'Synthetic Person',birthDate:'14/03/1992',birthTime:'09:30'});
  assert.equal(report.report.birthTimeLabel,'09:30 IST');
  assert.equal(report.report.sections.some(section=>section.title==='Vedik Grid'),false);
});
test('primary keeps name compound totals separate from root reduction',()=>{
  assert.equal(primary.nameCompound('ABC'),6);
  assert.equal(primary.nameRoot('ABC'),6);
  const report=primary.calculate({fullName:'ABC',birthDate:'14/03/1992',birthTime:'09:30'});
  const name=report.report.sections.find(section=>section.title==='Name characteristics').items;
  assert.equal(name.find(item=>item.label==='Name compound / root').value,'6 → 6');
});
test('primary rejects dates that are not exactly DD/MM/YYYY',()=>{
  assert.throws(()=>primary.calculate({fullName:'Synthetic',birthDate:'1/01/1990',assumedTime:'05:00'}),/DD\/MM\/YYYY/);
  assert.throws(()=>primary.calculate({fullName:'Synthetic',birthDate:'01/1/1990',assumedTime:'05:00'}),/DD\/MM\/YYYY/);
});
test('primary calculates the required 17/04/2000 numbers and exact Lo Shu grid',()=>{
  const report=primary.calculate({fullName:'Synthetic Person',birthDate:'17/04/2000',assumedTime:'05:00'});
  const numbers=report.report.sections.find(section=>section.title==='Primary numbers').items;
  assert.equal(numbers.find(item=>item.label==='Personality / Mulank (P)').value,'8 · birthday 17');
  assert.equal(numbers.find(item=>item.label==='Destiny / Bhagyank (D)').value,'14 → 5');
  const grid=report.report.sections.find(section=>section.title==='Lo Shu grid').items;
  assert.deepEqual(grid.map(item=>item.value),['4',' ','2',' ','5','7','8','1',' ']);
  assert.match(report.report.sections.find(section=>section.title==='Lo Shu grid').note,/Present: 1, 2, 4, 5, 7, 8/);
});
test('primary report uses dynamic workbook traits, P-D, and transformation numbers',()=>{
  const report=primary.calculate({fullName:'Synthetic Person',birthDate:'13/01/2001',birthTime:'06:05'});
  assert.deepEqual(report.report.numberSummary,{personality:4,destiny:8,transformation:1,soul:7});
  const date=report.report.sections.find(section=>section.title==='Date characteristics');
  assert.match(date.items[0].value,/Life full of challenges/);
  const pd=report.report.sections.find(section=>section.title==='P-D analysis');
  assert.match(pd.items[0].value,/Always contravarsies of 4 & 8 attributes/);
  const relationships=report.report.sections.find(section=>section.title==='Number relationships');
  assert.match(relationships.items.find(item=>item.label.startsWith('Enemies')).value,/2\s+4\*\s+8\*\s+9/);
});
test('primary report renders source-backed present and missing plane statuses',()=>{
  const report=primary.calculate({fullName:'Synthetic Person',birthDate:'14/03/1988',birthTime:'09:30'});
  const planes=report.report.sections.find(section=>section.title==='Planes and cross-connections').items;
  assert.ok(planes.some(item=>item.label.startsWith('Present 438')&&item.tone==='positive'));
  assert.ok(planes.some(item=>item.label.startsWith('Missing 456')&&item.tone==='negative'));
  const paytha=report.report.sections.find(section=>section.title==='Paytha grid');
  assert.deepEqual(paytha.items.map(item=>item.label),['3','6','9','2','5','8','1','4','7']);
});
test('birthday 1-10 includes Mulank but excludes an additional Bhagyank grid entry',()=>{
  const day1=primary.gridEntries({day:1,month:4,year:2000});
  const day10=primary.gridEntries({day:10,month:4,year:2000});
  const day11=primary.gridEntries({day:11,month:4,year:2000});
  assert.equal(day1[1],2);
  assert.equal(day10[1],2);
  assert.equal(day10[2],1);
  assert.equal(day11[1],2);
  assert.equal(day11[2],2);
});
test('primary exposes all audited plane definitions and remedies are last',()=>{
  assert.deepEqual(primary.planeDefinitions.map(item=>item[0]),['438','951','276','492','357','816','456','258']);
  const report=primary.calculate({fullName:'Synthetic',birthDate:'17/04/2000',assumedTime:'05:00'}).report;
  assert.equal(report.sections.at(-1).title,'Remedies');
  assert.ok(report.sections.at(-1).items.some(item=>item.label.startsWith('Missing number')));
  assert.ok(report.sections.some(section=>section.title==='Personal-year analysis'));
  assert.ok(report.sections.some(section=>section.title==='Number relationships'));
});
test('vedic requires explicit time and excludes mobile and remedies',()=>{
  assert.throws(()=>vedic.calculate({fullName:'Synthetic Vedic',birthDate:'14/03/1992'}),/birth time/i);
  const report=vedic.calculate({fullName:'Synthetic Vedic',birthDate:'14/03/1992',birthTime:'09:30'});
  assert.equal(report.sourceWorkbook,'Vedik Master.xlsx');
  assert.equal(report.report.sections.some(section=>section.title.includes('Remed')),false);
  assert.equal(report.report.sections.some(section=>section.title.includes('Mobile')),false);
  assert.match(report.report.sections[0].note,/century is not added/);
});
test('feature engines remain separated by source workbook',()=>{
  assert.equal(primary.calculate({fullName:'Synthetic',birthDate:'02/02/1992',assumedTime:'17:00'}).sourceWorkbook,'Numerology Master.xlsx');
  assert.equal(vedic.calculate({fullName:'Synthetic',birthDate:'02/02/1992',birthTime:'17:00'}).sourceWorkbook,'Vedik Master.xlsx');
});
test('mobile refuses unsupported generation rather than fabricating numbers',()=>{
  assert.throws(()=>mobile.calculate({fullName:'Synthetic Mobile',birthDate:'02/02/1992'}),/no authorized 10-digit generation or ranking rule/);
});
test('session is signed and rejects invalid credentials or cookies',()=>{
  const token=auth.login('synthetic-operator','synthetic-password');
  const cookie=auth.sessionCookie(token);
  assert.ok(auth.readSession({headers:{cookie}}));
  assert.equal(auth.readSession({headers:{cookie:'anka_session=invalid'}}),null);
  assert.equal(auth.readSession({headers:{cookie:'anka_session=%'}}),null);
  assert.throws(()=>auth.login('synthetic-operator','wrong'),/Invalid credentials/);
});
test('POST APIs reject cross-origin requests',()=>{
  for(const handler of postApis){
    const response=mockResponse();
    handler({method:'POST',headers:{origin:'https://attacker.example',host:'localhost'},body:{}},response);
    assert.equal(response.statusCode,403);
    assert.equal(response.body.error,'Cross-origin request blocked');
  }
});
test('login rejects malformed JSON instead of treating it as empty input',()=>{
  const loginApi=require('../api/auth/login');
  const response=mockResponse();
  loginApi({method:'POST',headers:{host:'localhost'},body:'{invalid}'},response);
  assert.equal(response.statusCode,400);
  assert.equal(response.body.error,'Invalid JSON request body');
});
test('protected primary API rejects unauthenticated and invalid-session requests',()=>{
  for(const cookie of [undefined,'anka_session=invalid']){
    const response=mockResponse();
    primaryApi({method:'POST',headers:{...(cookie?{cookie}:{})},body:{fullName:'Synthetic',birthDate:'01/01/1990',assumedTime:'05:00'}},response);
    assert.equal(response.statusCode,401);
    assert.equal(response.body.error,'Authentication required');
  }
});
test('protected primary API rejects cross-origin requests',()=>{
  const response=mockResponse();
  primaryApi({method:'POST',headers:{origin:'https://attacker.example',host:'localhost'},body:{fullName:'Synthetic',birthDate:'01/01/1990',assumedTime:'05:00'}},response);
  assert.equal(response.statusCode,403);
  assert.equal(response.body.error,'Cross-origin request blocked');
});
