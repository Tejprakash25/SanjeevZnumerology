const {bodyString,digits,fail,parseDate,parseTime,root,sumDigits}=require('../lib/validation');
const source=require('./primary-data.json');

const sourceWorkbook='Numerology Master.xlsx';
const remedyWorkbook='Remedy Master.xlsx';
const letterValues={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
const planeDefinitions=[
  ['438','Thought Plane','Analytical mind, sharp mind, clever and cunning, good planning but weak execution, political ability and logical analysis.','Confusion: day-to-day thinking without long-term planning.'],
  ['951','Will Power Plane','Strong determination and persistence, humanitarian and intellectual nature, goal orientation and success after effort.','Indecision: difficulty standing alone or expressing views.'],
  ['276','Action Plane','Physical work, sports, quick decisions, turning thoughts into action, energy and readiness to act.','Indecision: lack of motivation and reduced success percentage.'],
  ['492','Intelligence Plane','Intelligence, memory, creativity, imagination, logic and analytical decisions.','Poor memory: starting enthusiastically but leaving work incomplete.'],
  ['357','Spiritual Plane','Spiritual and sentimental nature, kindness and intuitive sensitivity.','Self-focus: lack of consideration for family and loneliness.'],
  ['816','Practical/Business Plane','Practical approach, mobility, hard work, business ability and success after effort.','Losses: the source links this missing pattern with business losses.'],
  ['456','Rajyog Golden Plane','Good fortune, intuition, caring and sensitivity, understanding people and organised behaviour.','Suspension: suspicious or moody behaviour.'],
  ['258','Silver Plane','Property, determination, patience, steady progress and construction-related work.','Frustration: setbacks and repeated failure without careful action.']
];
function nameCompound(name){return [...name.toUpperCase()].reduce((sum,char)=>sum+(letterValues[char]||0),0)}
function nameRoot(name){return root(nameCompound(name))}
function soulCompound(name){return [...name.toUpperCase()].reduce((sum,char)=>'AEIOU'.includes(char)?sum+letterValues[char]:sum,0)}
function soulRoot(name){return root(soulCompound(name))}
function personality(birth){return root(birth.day)}
function destinyCompound(birth){return sumDigits(digits(`${String(birth.day).padStart(2,'0')}${String(birth.month).padStart(2,'0')}${birth.year}`))}
function destiny(birth){return root(destinyCompound(birth))}
function toneForRating(rating){
  if(/negative|below average/i.test(rating))return 'negative';
  if(/excellent|good/i.test(rating))return 'positive';
  return 'neutral';
}
function reverseDigits(value){return [...String(value)].reverse().join('')}
function gridEntries(birth){
  const raw=digits(`${String(birth.day).padStart(2,'0')}${String(birth.month).padStart(2,'0')}${birth.year}`).filter(Boolean);
  const p=personality(birth); const d=destiny(birth);
  const values=birth.day<=10?[...raw,p]:[...raw,p,d];
  const counts=Array.from({length:10},()=>0); values.forEach(value=>{if(value>=1&&value<=9)counts[value]++});
  return counts;
}
function gridItems(counts){return [4,9,2,3,5,7,8,1,6].map(value=>({label:String(value),value:counts[value]?String(value).repeat(counts[value]):' ',tone:counts[value]?'positive':'negative',status:counts[value]?'Present':'Missing'}))}
function pythaGridItems(counts){return [3,6,9,2,5,8,1,4,7].map(value=>({label:String(value),value:counts[value]?String(value).repeat(counts[value]):' ',tone:counts[value]?'positive':'negative',status:counts[value]?'Present':'Missing'}))}
function presentPattern(counts,pattern){return [...pattern].every(value=>counts[Number(value)]>0)}
function section(title,type,items,note){return {title,type,items,note}}
function calculate(input){
  const fullName=bodyString(input.fullName,'full name');
  const birth=parseDate(input.birthDate);
  let birthTime=input.birthTime; let timeAssumed=false;
  if(!birthTime){if(!['05:00','17:00'].includes(input.assumedTime))fail('Primary analysis requires birth time or an approved 05:00/17:00 IST assumption');birthTime=input.assumedTime;timeAssumed=true}else parseTime(birthTime);
  const p=personality(birth), dc=destinyCompound(birth), d=root(dc), n=nameCompound(fullName), nr=nameRoot(fullName), sc=soulCompound(fullName), sr=soulRoot(fullName), counts=gridEntries(birth);
  const timeCompound=sumDigits(digits(birthTime));
  const transformationCompound=dc+timeCompound;
  const transformation=root(transformationCompound);
  const dateQuality=source.birthDayQualities[String(birth.day)];
  const nameLetters=[...fullName.trim().split(/\s+/)[0].toUpperCase()].slice(0,2).map(char=>letterValues[char]||0);
  const firstNameValue=nameLetters.join('');
  const firstNameReverse=reverseDigits(firstNameValue);
  const present=Array.from({length:9},(_,i)=>counts[i+1]?i+1:null).filter(Boolean); const missing=Array.from({length:9},(_,i)=>counts[i+1]?null:i+1).filter(Boolean);
  const activePlanes=planeDefinitions.filter(([pattern])=>presentPattern(counts,pattern));
  const absentPlanes=planeDefinitions.filter(([pattern])=>!presentPattern(counts,pattern));
  const currentYear=new Date().getFullYear();
  const personalYearNumber=root(dc+sumDigits(digits(currentYear)));
  const personalYearRating=source.personalYearRatings[`${personalYearNumber}=${p}`]||'Not specified in the workbook.';
  const repeatedPatterns=Array.from({length:9},(_,index)=>{
    const number=index+1;
    return {number,count:counts[number],pattern:String(number).repeat(counts[number])};
  }).filter(item=>item.count>1&&source.numberPatterns[item.pattern]);
  const relationship=source.relationships[String(p)]||{};
  const favorable=source.favorable[String(p)]||{};
  const pDInterpretation=source.pdInterpretations[`${p}=${d}`];
  const remedyItems=missing.flatMap(number=>(source.remedies[String(number)]||[]).map((value,index)=>({label:`Missing number ${number}${index?' option '+(index+1):''}`,value,tone:'positive'})));
  const pythaLines=[
    {orientation:'Vertical',numbers:[3,2,1]},
    {orientation:'Vertical',numbers:[6,5,4]},
    {orientation:'Vertical',numbers:[9,8,7]},
    {orientation:'Horizontal',numbers:[3,6,9]},
    {orientation:'Horizontal',numbers:[2,5,8]},
    {orientation:'Horizontal',numbers:[1,4,7]},
    {orientation:'Diagonal',numbers:[3,5,7]},
    {orientation:'Diagonal',numbers:[9,5,1]}
  ];
  const completedLines=pythaLines.filter(line=>line.numbers.every(number=>counts[number]>0));
  const linesFor=orientation=>completedLines.filter(line=>line.orientation===orientation).map(line=>line.numbers.join('-'));
  const incompleteLines=pythaLines.filter(line=>line.numbers.some(number=>!counts[number])).map(line=>`${line.orientation} ${line.numbers.join('-')}`);
  const sections=[
    section('Primary numbers','rows',[
      {label:'Personality / Mulank (P)',value:`${p} · birthday ${birth.day}`},
      {label:'Destiny / Bhagyank (D)',value:`${dc} → ${d}`},
      {label:'Transformation number (Tr)',value:`${transformationCompound} → ${transformation} · date and entered time digits`},
      {label:'Soul number',value:`${sc} → ${sr}`}
    ]),
    section('Date characteristics','rows',[{label:`Birth-date compound ${birth.day}`,value:dateQuality||'No exact birth-date compound interpretation was identified in the source workbook.'},{label:'Master-number reference',value:source.masterNumberQualities[String(birth.day)]||'No master-number reference applies to this birth date.'}]),
    section('P-D analysis','rows',[{label:`Personality ${p} + Destiny ${d}`,value:pDInterpretation||'No exact interpretation is listed for this combination in the source workbook.'}]),
    section('Name characteristics','rows',[
      {label:'Name compound / root',value:`${n} → ${nr}`},
      {label:'First-name letter values',value:`${firstNameValue||'Not available'}${firstNameValue&&firstNameReverse!==firstNameValue?` / ${firstNameReverse}`:''}`},
      {label:'Paytha mapping',value:'A=1 through I=9, J=1 through R=9, S=1 through Z=8.'},
      {label:'Vowel characteristics',value:[...new Set([...fullName.toUpperCase()].filter(char=>'AEIOU'.includes(char)))].join(', ')||'none'}
    ]),
    section('Soul characteristics','rows',[{label:`Soul compound / root ${sc} → ${sr}`,value:source.soulQualities[String(sr)]||'No source interpretation available.'}]),
    section('Lo Shu grid','grid',gridItems(counts),`Layout: 4 | 9 | 2 / 3 | 5 | 7 / 8 | 1 | 6. Present: ${present.join(', ')||'none'}. Missing: ${missing.join(', ')||'none'}. Birthday 1–10 rule: Mulank included; Bhagyank is not added as an extra grid entry.`),
    section('Paytha grid','grid',pythaGridItems(counts),'Workbook layout: 3 | 6 | 9 / 2 | 5 | 8 / 1 | 4 | 7.'),
    section('Paytha pattern analysis','rows',[
      {label:'Completed vertical lines',value:linesFor('Vertical').join(', ')||'None',tone:linesFor('Vertical').length?'positive':'negative'},
      {label:'Completed horizontal lines',value:linesFor('Horizontal').join(', ')||'None',tone:linesFor('Horizontal').length?'positive':'negative'},
      {label:'Completed diagonal lines',value:linesFor('Diagonal').join(', ')||'None',tone:linesFor('Diagonal').length?'positive':'negative'},
      {label:'Incomplete lines',value:incompleteLines.join(', ')||'None',tone:incompleteLines.length?'negative':'positive'},
      ...(counts[1]>1||counts[4]>1||counts[8]>1?[{label:'Repeated 11 / 44 / 88',value:'Workbook associates these repeats with earning potential.',tone:'positive'}]:[]),
      ...(counts[2]>1?[{label:'Repeated 22',value:'Workbook flags emotional issues for this repeat.',tone:'negative'}]:[])
    ],'Completed vertical lines indicate goal achievement despite challenges; completed horizontal lines indicate potential for good results; completed diagonals are associated with good luck.'),
    section('Repeated-number patterns','rows',repeatedPatterns.map(item=>({label:`${item.pattern} · ${item.count} occurrences`,value:source.numberPatterns[item.pattern],tone:'neutral'})),'Only repeated patterns with a matching source-workbook entry are shown.'),
    section('Planes and cross-connections','rows',[
      ...activePlanes.map(([pattern,label,meaning])=>({label:`Present ${pattern} — ${label}`,value:meaning,tone:'positive'})),
      ...absentPlanes.map(([pattern,label,,missingMeaning])=>({label:`Missing ${pattern} — ${label}`,value:missingMeaning,tone:'negative'}))
    ]),
    section('Rajyog analysis','rows',[{label:`456 Golden Plane · ${presentPattern(counts,'456')?'Present':'Missing'}`,value:presentPattern(counts,'456')?planeDefinitions.find(item=>item[0]==='456')[2]:planeDefinitions.find(item=>item[0]==='456')[3],tone:presentPattern(counts,'456')?'positive':'negative'}]),
    section('Spiritual analysis','rows',[{label:`357 Spiritual Plane · ${presentPattern(counts,'357')?'Present':'Missing'}`,value:presentPattern(counts,'357')?planeDefinitions.find(item=>item[0]==='357')[2]:planeDefinitions.find(item=>item[0]==='357')[3],tone:presentPattern(counts,'357')?'positive':'negative'}]),
    section('Education guidance','rows',Object.entries(source.education).map(([field,rule])=>{
      const requiredNumbers=rule.match(/[1-9]/g)||[];
      const exact=field.toLowerCase()!=='medical'&&field.toLowerCase()!=='non-medical';
      const met=exact&&requiredNumbers.every(number=>counts[Number(number)]>0);
      return {label:field,value:exact?`${met?'Pattern present':'Pattern missing'} · ${rule}`:`Source rule · ${rule}`,tone:exact?(met?'positive':'negative'):'neutral'};
    })),
    section('Profession guidance','rows',[{label:`Destiny ${d}`,value:source.profession[String(d)]||'No profession guidance is listed for this number.',tone:'positive'}]),
    section('Number relationships','rows',[
      {label:`Friends for Personality ${p}`,value:relationship.friends||'Not listed in the source workbook.',tone:relationship.friends?'positive':'negative'},
      {label:`Enemies for Personality ${p}`,value:relationship.enemies||'None listed in the source workbook.',tone:relationship.enemies?'negative':'neutral'},
      {label:`Neutral for Personality ${p}`,value:relationship.neutral||'Not listed in the source workbook.',tone:'neutral'}
    ]),
    section('Lucky references','rows',[
      {label:'Day',value:favorable.day||'Not specified',tone:'positive'},
      {label:'Colours',value:favorable.colors||'Not specified',tone:'positive'},
      {label:'Direction',value:favorable.direction||'Not specified',tone:'positive'},
      {label:'Deity',value:favorable.deity||'Not specified',tone:'positive'},
      {label:'Fragrance',value:favorable.fragrance||'Not specified',tone:'positive'}
    ]),
    section('Event ages and years','rows',[
      {label:'Starting date compound',value:`${dc}${reverseDigits(dc)!==String(dc)?` / ${reverseDigits(dc)}`:''}`},
      {label:'Destiny progression',value:`Add or subtract Destiny ${d} repeatedly from the compound.`},
      {label:'First-name letter values',value:`${firstNameValue||'Not available'}${firstNameReverse!==firstNameValue?` / ${firstNameReverse}`:''}`},
      {label:'Name compound',value:`${n}${reverseDigits(n)!==String(n)?` / ${reverseDigits(n)}`:''}`},
      {label:'Calendar-year boundary',value:'The workbook gives number-sequence steps but does not define a rule to convert them into event ages or calendar years.'}
    ]),
    section('Personal-year analysis','rows',[
      {label:`Personal year ${personalYearNumber} · ${currentYear}`,value:source.personalYears[String(personalYearNumber)]||'No interpretation is listed for this personal year.'},
      {label:`Impact with Personality ${p}`,value:personalYearRating,tone:toneForRating(personalYearRating)},
      {label:'Health precaution reference',value:source.health[String(personalYearNumber)]||'No health reference is listed for this personal year.'},
      ...(source.personalYearRemedies[String(personalYearNumber)]?[{label:'Workbook suggestion',value:source.personalYearRemedies[String(personalYearNumber)],tone:'positive'}]:[])
    ]),
    section('Suggestions','rows',[{label:'Source boundary',value:'Use the workbook-derived remedy section below; no additional conventional numerology rules are invented.'}]),
    section('Remedies','remedies',remedyItems,`Options for missing numbers; the Remedy Master advises focusing on one or two relevant numbers rather than all options. Friendly numbers already present in the grid do not need remedies.`)
  ];
  return {feature:'primary',featureLabel:'Primary Sheldian Analysis',sourceWorkbook,report:{subjectName:fullName,birthDate:birth.raw,birthTimeLabel:`${birthTime} IST${timeAssumed?' (assumed)':''}`,numberSummary:{personality:p,destiny:d,transformation,soul:sr},sections,sourceBoundaries:{primary:sourceWorkbook,remedies:remedyWorkbook}}};
}
module.exports={calculate,nameCompound,nameRoot,soulCompound,soulRoot,personality,destiny,gridEntries,gridItems,pythaGridItems,planeDefinitions,letterValues,remedies:source.remedies};
