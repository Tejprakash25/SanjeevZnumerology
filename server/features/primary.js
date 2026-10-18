const {bodyString,digits,fail,parseDate,parseTime,root,sumDigits}=require('../lib/validation');

const sourceWorkbook='Numerology Master.xlsx';
const remedyWorkbook='Remedy Master.xlsx';
const letterValues={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
const planeDefinitions=[
  ['438','Thought Plane','Analytical mind, sharp mind, clever and logical analysis.','Confusion: day-to-day thinking and weak long-term planning.'],
  ['951','Will Power Plane','Strong will power, determination, persistence and intellectual strength.','Indecision: difficulty standing alone or expressing a view.'],
  ['276','Action Plane','Physical energy, sports, quick decisions and turning thoughts into action.','Indecision: lack of motivation and lower success percentage.'],
  ['492','Intelligence Plane','Intelligence, memory, creativity, imagination and analytical decisions.','Poor memory: starts enthusiastically but leaves work incomplete.'],
  ['357','Spiritual Plane','Spiritual and sentimental nature, kindness and intuitive sensitivity.','Self-focus: loneliness or lack of consideration for family.'],
  ['816','Practical/Business Plane','Practical approach, mobility, hard work and readiness to act.','Losses: the source links this missing pattern with business losses.'],
  ['456','Rajyog Golden Plane','Good fortune, sensitivity, caring nature and understanding of people.','Suspension: suspicious or moody behaviour.'],
  ['258','Silver Plane','Property arrow, determination, patience and steady progress.','Frustration: setbacks and repeated failure without careful action.']
];
const dateQualities={
  14:'Travelling and adventurous nature, name and fame, prosperity, abundance and business ability.',
  17:'Poor by birth but success through hard work; tendency to spend without thinking.',
  23:'Good success, strong mind, good relationships and a helpful nature.',
  28:'Additional energy, powerful initiative and a tendency to do what one thinks.',
  31:'Sharp mind, spirituality and psychological insight.',
  34:'Energetic, joyful, successful and magnetic personality.'
};
const soulQualities={
  1:'Born leader, quick action, focused and goal-oriented; dislikes excessive guidance.',
  2:'Teamwork, support from others, teaching, mediation and giving nature.',
  3:'Positive magnetic aura, happiness, creativity and a pleasant presence.',
  4:'Disciplined, organised and practical; values time, routine and detail.',
  5:'Needs variety and change; dislikes monotony and values freedom and recognition.',
  6:'Self-sacrificing and helpful, but should guard against being deceived.',
  7:'Sharp and analytical; misunderstood at times and drawn to deep research.',
  8:'Ambitious, dedicated, financially independent and focused on name and fame.',
  9:'Humanitarian, compassionate and dedicated, with strong feelings and expectations.'
};
const profession={
  1:'Fire, electricity, bakery, restaurant, glamour, luxury, top management, government and communication.',
  2:'Water, milk, medicines, teaching, consulting, counselling and occult science.',
  3:'Healing, pharmaceuticals, medicine, teaching, counselling, astrology and coaching.',
  4:'IT, software, hand work, online and digital media, law, police, defence and medicine.',
  5:'Official sitting work, banking, finance, insurance, accounting, teaching, medicine and tours.',
  6:'Media, journalism, hotels, restaurants, jewellery, beauty and high-profile products.',
  7:'Research, science, occult science, healing, medicine, investigation and counselling.',
  8:'Iron, steel, machinery, banking, finance, law, administration, mining and chemicals.',
  9:'HR, army, police, NGO, training, sports, yoga, medicine and spiritual leadership.'
};
const friendship={1:'1, 2, 3, 5, 6, 9',2:'1, 2, 3, 5',3:'1, 2, 3, 5, 7',4:'1, 5, 6, 7, 4*, 8*',5:'1, 2, 3, 5, 6',6:'1, 5, 6, 7',7:'1, 3, 4, 5, 6',8:'3, 6, 7, 4*, 8*',9:'1, 3, 5'};
const pDInterpretations={'8=5':'First half very hard work then success in the second half; real estate, politics, law and order, administration and finance.'};
const days={1:'Sunday',2:'Monday',3:'Thursday',4:'Sunday',5:'Wednesday',6:'Friday',7:'Monday',8:'Saturday',9:'Tuesday'};
const remedies={
  1:['Drink water from a copper vessel in the morning.','Avoid alcohol and non-vegetarian food.','Keep a fountain or aquarium in the north.','Carry a copper coin in orange cloth.'],
  2:["Do not waste water; consume sufficient water.",'Avoid excessive dark-colour clothing.','Keep an aquarium in the north with the prescribed fish arrangement.','Keep a silver coin in white cloth.'],
  3:['Take blessings of a guru, parent or teacher.','Donate yellow products on Thursday.','Place green plants in the east.','Use a wood element or wooden pen.'],
  4:['Use a bindi or red tilak for focus.','Feed street dogs.','Keep a green plant in the south-east.','Carry a wooden pen or key ring.'],
  5:['Water plants with bare feet.','Give anonymous donation to a gaushala.','Place a Vishnu idol or picture in the west.','Carry a green handkerchief.'],
  6:['Add rose water to bathing water.','Donate white goods, rice, sugar or milk.','Use golden wind chimes in the south-east.','Use rose perfume or ittar.'],
  7:['Feed street dogs continuously for 43 days.','Use silver wind chimes in the west.','Wear a silver bracelet or chain.'],
  8:['Do physical activity and steady hard work.','Donate black items and supplies to labourers.','Place holy water on the west side of the water area.','Avoid liquor and non-vegetarian food on Saturday.'],
  9:['Worship Hanuman and recite Hanuman Chalisa.','Donate red cloth or gram to labourers.','Use a red light in the south-east.','Wear a red thread on the wrist.']
};
const personalYear={
  1:'Starting something new; energy, enthusiasm, marriage, travel, vehicle, house or child planning are supported with good planning.',
  2:'Slow and steady year requiring patience; avoid rushing new starts and support emotional balance.',
  3:'Knowledge, creativity, friends, learning, promotion and growth; control expenses and read documents carefully.',
  4:'Planning, discipline, organisation and property matters; avoid hasty decisions and rely on patient effort.',
  5:'Change, variety, travel and opportunity; promote yourself and take well-planned opportunities.',
  6:'Family, relationships, business planning, promotion and material gain; maintain focus on loved ones.',
  7:'Spirituality, research, education and inner growth; avoid financial risk and develop meditation.',
  8:'Results of hard work and property or financial opportunities; avoid overwork and protect health.',
  9:'Audit and completion year; avoid new risks, litigation and impulsive decisions; practise patience.'
};
function nameCompound(name){return [...name.toUpperCase()].reduce((sum,char)=>sum+(letterValues[char]||0),0)}
function nameRoot(name){return root(nameCompound(name))}
function soulCompound(name){return [...name.toUpperCase()].reduce((sum,char)=>'AEIOU'.includes(char)?sum+letterValues[char]:sum,0)}
function soulRoot(name){return root(soulCompound(name))}
function personality(birth){return root(birth.day)}
function destiny(birth){return root(sumDigits(digits(`${String(birth.day).padStart(2,'0')}${String(birth.month).padStart(2,'0')}${birth.year}`)))}
function gridEntries(birth){
  const raw=digits(`${String(birth.day).padStart(2,'0')}${String(birth.month).padStart(2,'0')}${birth.year}`).filter(Boolean);
  const p=personality(birth); const d=destiny(birth);
  const values=birth.day<=10?[...raw,p]:[...raw,p,d];
  const counts=Array.from({length:10},()=>0); values.forEach(value=>{if(value>=1&&value<=9)counts[value]++});
  return counts;
}
function gridItems(counts){return [4,9,2,3,5,7,8,1,6].map(value=>({label:String(value),value:counts[value]?String(value).repeat(counts[value]):' '}))}
function presentPattern(counts,pattern){return [...pattern].every(value=>counts[Number(value)]>0)}
function section(title,type,items,note){return {title,type,items,note}}
function calculate(input){
  const fullName=bodyString(input.fullName,'full name');
  const birth=parseDate(input.birthDate);
  let birthTime=input.birthTime; let timeAssumed=false;
  if(!birthTime){if(!['05:00','17:00'].includes(input.assumedTime))fail('Primary analysis requires birth time or an approved 05:00/17:00 IST assumption');birthTime=input.assumedTime;timeAssumed=true}else parseTime(birthTime);
  const p=personality(birth), d=destiny(birth), n=nameCompound(fullName), nr=nameRoot(fullName), sc=soulCompound(fullName), sr=soulRoot(fullName), counts=gridEntries(birth);
  const present=Array.from({length:9},(_,i)=>counts[i+1]?i+1:null).filter(Boolean); const missing=Array.from({length:9},(_,i)=>counts[i+1]?null:i+1).filter(Boolean);
  const activePlanes=planeDefinitions.filter(([pattern])=>presentPattern(counts,pattern));
  const absentPlanes=planeDefinitions.filter(([pattern])=>!presentPattern(counts,pattern));
  const dateCompound=sumDigits(digits(`${String(birth.day).padStart(2,'0')}${String(birth.month).padStart(2,'0')}${birth.year}`));
  const sections=[
    section('Date characteristics','rows',[{label:'Personality / Mulank',value:p},{label:'Destiny / Bhagyank',value:d},{label:'Date compound',value:dateCompound},{label:'Workbook interpretation',value:dateQualities[dateCompound]||'No exact date-compound interpretation was identified in the audited source range.'}]),
    section('P-D analysis','rows',[{label:'Personality + Destiny',value:`${p} + ${d}`},{label:'Interpretation',value:pDInterpretations[`${p}=${d}`]||'The audited workbook contains a P-D table; an exact row was not selected for this combination, so no unsupported interpretation is inferred.'}]),
    section('Name characteristics','rows',[{label:'Name compound',value:n},{label:'Name root',value:nr},{label:'Paytha letters used',value:'A–Z repeating 1–9 table from the Numerology Master workbook.'},{label:'Vowel characteristics',value:[...new Set([...fullName.toUpperCase()].filter(char=>'AEIOU'.includes(char)))].join(', ')||'none'}]),
    section('Soul characteristics','rows',[{label:'Soul compound',value:sc},{label:'Soul root',value:sr},{label:'Interpretation',value:soulQualities[sr]||'No source interpretation available.'}]),
    section('Lo Shu grid','grid',gridItems(counts),`Layout: 4 | 9 | 2 / 3 | 5 | 7 / 8 | 1 | 6. Present: ${present.join(', ')||'none'}. Missing: ${missing.join(', ')||'none'}. Birthday 1–10 rule: Mulank included; Bhagyank is not added as an extra grid entry.`),
    section('Planes and cross-connections','rows',[
      ...activePlanes.map(([pattern,label,meaning])=>({label:`${pattern} — ${label}`,value:meaning})),
      ...absentPlanes.map(([pattern,label,,missingMeaning])=>({label:`Missing ${pattern} — ${label}`,value:missingMeaning}))
    ]),
    section('Rajyog analysis','rows',[{label:'456 Golden Plane',value:presentPattern(counts,'456')?'Present — '+planeDefinitions.find(item=>item[0]==='456')[2]:'Missing — '+planeDefinitions.find(item=>item[0]==='456')[3]}]),
    section('Spiritual analysis','rows',[{label:'357 Spiritual Plane',value:presentPattern(counts,'357')?planeDefinitions.find(item=>item[0]==='357')[2]:planeDefinitions.find(item=>item[0]==='357')[3]},{label:'Source boundary',value:'Only audited workbook interpretations are shown.'}]),
    section('Education guidance','rows',[{label:'Source guidance',value:'Commerce: 5, 4 and 8 present; computer: 4 and 8 present; research: 7 present; administration: 1 and 9 present; law: 4, 8, 1 and 5 present; creative passion: 6 present; hotel: 6, 1 and 2 present.'},{label:'Applicable patterns',value:[counts[5]&&counts[4]&&counts[8]?'Commerce':'',counts[4]&&counts[8]?'Computer':'',counts[7]?'Research':'',counts[1]&&counts[9]?'Administration':'',counts[4]&&counts[8]&&counts[1]&&counts[5]?'Law':'',counts[6]?'Creative':'',counts[6]&&counts[1]&&counts[2]?'Hotel':''].filter(Boolean).join(', ')||'No exact source pattern present.'}]),
    section('Profession guidance','rows',[{label:`Destiny ${d}`,value:profession[d]}]),
    section('Health references','rows',[{label:'Source boundary',value:'The audited primary workbook contains health references in pattern and personal-year tables; no diagnosis is made.'}]),
    section('Number relationships','rows',[{label:`Friends for ${p}`,value:friendship[p]||'Not specified'},{label:'Enemy numbers',value:'No general enemy mapping was established in the audited primary source; not inferred.'},{label:'Neutral numbers',value:'No general neutral mapping was established in the audited primary source; not inferred.'}]),
    section('Lucky references','rows',[{label:'Day',value:days[p]||'Not specified'},{label:'Colours, direction, deity, fragrance',value:'The example workbook contains client-specific values only; they are not copied into generic reports.'}]),
    section('Paytha reference','rows',[{label:'Mapping',value:'A=1 through I=9, J=1 through R=9, S=1 through Z=8.'},{label:'Calculation',value:`Name letters are summed using the audited A–Z repeating 1–9 table: ${n}.`}]),
    section('Event ages and years','rows',[{label:'Event calculation',value:'The workbook defines event calculations from Destiny compound, first name alphabet value and name compound.'},{label:'Status',value:'No client-specific event year is fabricated without a complete source row and selected date context.'}]),
    section('Personal-year analysis','rows',[{label:'Current-year formula',value:'Birth date digits + calendar year digits, reduced to a root number.'},{label:'Interpretation',value:personalYear[root(sumDigits(digits(`${String(birth.day).padStart(2,'0')}${String(birth.month).padStart(2,'0')}${birth.year}`))+new Date().getFullYear())]||'Source interpretation unavailable.'}]),
    section('Suggestions','rows',[{label:'Source boundary',value:'Use the workbook-derived remedy section below; no additional conventional numerology rules are invented.'}]),
    section('Remedies','remedies',missing.flatMap(number=>(remedies[number]||[]).slice(0,4).map((value,index)=>({label:`Missing number ${number}${index?' remedy '+(index+1):''}`,value}))))
  ];
  return {feature:'primary',featureLabel:'Primary Sheldian Analysis',sourceWorkbook,report:{subjectName:fullName,birthDate:birth.raw,birthTimeLabel:`${birthTime} IST${timeAssumed?' (assumed)':''}`,sections,sourceBoundaries:{primary:sourceWorkbook,remedies:remedyWorkbook}}};
}
module.exports={calculate,nameCompound,nameRoot,soulCompound,soulRoot,personality,destiny,gridEntries,gridItems,planeDefinitions,letterValues,remedies};
