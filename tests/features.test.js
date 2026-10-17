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

function mockResponse(){return {statusCode:200,headers:{},body:null,setHeader(key,value){this.headers[key]=value},status(code){this.statusCode=code;return this},json(body){this.body=body;return this}}}

test('primary uses synthetic input and requires an approved unknown-time choice',()=>{
  assert.throws(()=>primary.calculate({fullName:'Synthetic Person',birthDate:'31/02/1990',assumedTime:'05:00'}),/valid calendar date/);
  assert.throws(()=>primary.calculate({fullName:'Synthetic Person',birthDate:'01/01/1990'}),/requires birth time/);
  const report=primary.calculate({fullName:'Synthetic Person',birthDate:'01/01/1990',assumedTime:'05:00'});
  assert.equal(report.report.birthTimeLabel,'05:00 IST (assumed)');
  assert.equal(report.feature,'primary');
  assert.ok(report.report.sections.some(section=>section.title==='Client-specific remedies'));
});
test('primary accepts known IST time and does not add Vedic or mobile rules',()=>{
  const report=primary.calculate({fullName:'Synthetic Person',birthDate:'14/03/1992',birthTime:'09:30'});
  assert.equal(report.report.birthTimeLabel,'09:30 IST');
  assert.equal(report.report.sections.some(section=>section.title==='Vedik Grid'),false);
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
  assert.throws(()=>auth.login('synthetic-operator','wrong'),/Invalid credentials/);
});
test('protected primary API rejects unauthenticated and invalid-session requests',()=>{
  for(const cookie of [undefined,'anka_session=invalid']){
    const response=mockResponse();
    primaryApi({method:'POST',headers:{...(cookie?{cookie}:{})},body:{fullName:'Synthetic',birthDate:'01/01/1990',assumedTime:'05:00'}},response);
    assert.equal(response.statusCode,401);
    assert.equal(response.body.error,'Authentication required');
  }
});
