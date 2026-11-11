const state={page:'primary'};
const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
const showError=(element,message)=>{element.textContent=message;element.hidden=!message};
const api=async(path,options={})=>{
  const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  let body;
  try{body=await response.json()}catch{
    const error=new Error(response.ok?'Invalid server response':'Request failed');
    error.status=response.status;
    throw error;
  }
  if(!response.ok){const error=new Error(body?.error||'Request failed');error.status=response.status;throw error}
  if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Invalid server response');
  return body;
};
function renderForms(){
  $('#page-primary').innerHTML='<p class="page-intro">A private primary report using the Numerology Master workbook for analysis and the Remedy Master workbook for relevant client guidance. Birth time is required; if unknown, choose one approved assumed IST time.</p><div class="feature-layout"><section class="panel"><h3>Primary details</h3><form id="primary-form" class="feature-form"><label>Full name<input name="fullName" required maxlength="120" autocomplete="off"></label><label>Birthdate <span class="muted">DD/MM/YYYY</span><input name="birthDate" placeholder="17/04/2000" inputmode="numeric" required pattern="\\d{2}/\\d{2}/\\d{4}"></label><label>Birth time <span class="muted">IST, 24-hour</span><input name="birthTime" type="time"></label><p class="hint">If birth time is unknown, select 05:00 IST or 17:00 IST.</p><label>Unknown-time assumption<select name="assumedTime"><option value="">I know the birth time</option><option value="05:00">05:00 IST</option><option value="17:00">17:00 IST</option></select></label><button class="gold-button" type="submit">Generate primary report <span>→</span></button><p class="form-error" data-error hidden></p></form></section><section id="primary-output" class="panel output"><div class="output-empty"><div><strong>Primary report</strong><span>Submit the form to generate a workbook-grounded report.</span></div></div></section></div>';
  $('#page-vedic').innerHTML='<p class="page-intro">A separate Vedic report using only the Vedik Master workbook. Mobile numbers and remedies are intentionally not part of this feature.</p><div class="feature-layout"><section class="panel"><h3>Vedic details</h3><form id="vedic-form" class="feature-form"><label>Full name<input name="fullName" required maxlength="120" autocomplete="off"></label><label>Birthdate <span class="muted">DD/MM/YYYY</span><input name="birthDate" placeholder="20/09/2001" inputmode="numeric" required pattern="\\d{2}/\\d{2}/\\d{4}"></label><label>Birth time <span class="muted">IST, 24-hour — required</span><input name="birthTime" type="time" required></label><p class="hint">Vedic analysis uses the birth time supplied by the operator. No automatic assumption is applied.</p><button class="gold-button" type="submit">Generate Vedic report <span>→</span></button><p class="form-error" data-error hidden></p></form></section><section id="vedic-output" class="panel output"><div class="output-empty"><div><strong>Vedic report</strong><span>Submit the form to generate a Vedik-workbook report.</span></div></div></section></div>';
  $('#page-mobile').innerHTML='<p class="page-intro">A private recommendation service using only the Mobile Number master workbook. The server returns the recommendation without revealing internal scoring or generation rules.</p><div class="feature-layout"><section class="panel"><h3>Recommendation details</h3><form id="mobile-form" class="feature-form"><label>Full name<input name="fullName" required maxlength="120" autocomplete="off"></label><label>Birthdate <span class="muted">DD/MM/YYYY</span><input name="birthDate" placeholder="09/11/1997" inputmode="numeric" required pattern="\\d{2}/\\d{2}/\\d{4}"></label><button class="gold-button" type="submit">Find recommendations <span>→</span></button><p class="form-error" data-error hidden></p></form></section><section id="mobile-output" class="panel output"><div class="output-empty"><div><strong>Private recommendation</strong><span>Submit the form to receive up to three candidates.</span></div></div></section></div>';
  $('#primary-form').addEventListener('submit',event=>submitFeature(event,'/api/primary','primary-output'));
  $('#vedic-form').addEventListener('submit',event=>submitFeature(event,'/api/vedic','vedic-output'));
  $('#mobile-form').addEventListener('submit',event=>submitFeature(event,'/api/mobile','mobile-output'));
}
function formData(form){return Object.fromEntries(new FormData(form).entries())}
async function submitFeature(event,path,outputId){event.preventDefault();const form=event.currentTarget;const error=form.querySelector('[data-error]');const submitButton=event.submitter;const originalLabel=submitButton?.innerHTML;showError(error,'');const output=$(`#${outputId}`);if(submitButton){submitButton.disabled=true;submitButton.setAttribute('aria-busy','true');submitButton.textContent='Generating…'}output.setAttribute('aria-busy','true');output.innerHTML='<div class="output-empty"><div><strong>Preparing your reading…</strong><span>This may take a moment.</span></div></div>';try{const result=await api(path,{method:'POST',body:JSON.stringify(formData(form))});const report=renderResult(result);output.innerHTML=report;openReport(report,submitButton)}catch(errorObject){output.innerHTML='<div class="output-empty"><div><strong>Unable to generate report</strong><span>Check the details and try again.</span></div></div>';showError(error,errorObject.message)}finally{output.removeAttribute('aria-busy');if(submitButton){submitButton.disabled=false;submitButton.removeAttribute('aria-busy');submitButton.innerHTML=originalLabel}}}
function openReport(report,returnFocus){$('#report-modal-content').innerHTML=report;$('#report-modal').hidden=false;document.body.classList.add('modal-open');state.reportReturnFocus=returnFocus;$('#report-modal-close').focus()}
function closeReport(){const modal=$('#report-modal');if(modal.hidden)return;modal.hidden=true;document.body.classList.remove('modal-open');state.reportReturnFocus?.focus()}
const wideReportSections=new Set(['P-D analysis','Lo Shu grid','Paytha grid','Paytha pattern analysis','Repeated-number patterns','Planes and cross-connections','Education guidance','Event ages and years','Personal-year analysis','Suggestions','Remedies']);
function renderReportSection(section){
  const rows=section.items.map(item=>{
    const tone=['positive','negative','neutral'].includes(item.tone)?`tone-${item.tone}`:'tone-neutral';
    return `<div class="report-row"><span>${escapeHtml(item.label)}</span><b class="${tone}">${escapeHtml(item.value)}</b></div>`;
  }).join('');
  const grid=section.items.map(item=>{
    const tone=['positive','negative','neutral'].includes(item.tone)?`tone-${item.tone}`:'tone-neutral';
    return `<div class="grid-cell ${tone}" role="img" aria-label="${escapeHtml(item.label)}: ${escapeHtml(item.status||'')}"><div>${escapeHtml(item.value)}<small>${escapeHtml(item.label)}<span class="grid-status">${escapeHtml(item.status||'')}</span></small></div></div>`;
  }).join('');
  const remedies=section.type==='remedies'?section.items.map(item=>`<section class="remedy-group"><h5>${escapeHtml(item.label)}</h5><ul class="remedy-items">${item.remedies.map(remedy=>`<li>${escapeHtml(remedy)}</li>`).join('')}</ul></section>`).join(''):'';
  const content=section.type==='grid'
    ?`<div class="grid-wrap"><div class="grid">${grid}</div><p class="interpretation">${escapeHtml(section.note||'')}</p></div>`
    :section.type==='metrics'
      ?`<div class="metric-grid">${section.items.map(item=>`<div class="metric"><small>${escapeHtml(item.label)}</small><b>${escapeHtml(item.value)}</b></div>`).join('')}</div>`
    :section.type==='remedies'
      ?`<div class="remedy-list">${remedies}</div><p class="interpretation">${escapeHtml(section.note||'')}</p>`
      :`<div class="report-list">${rows}</div>${section.note?`<p class="interpretation">${escapeHtml(section.note)}</p>`:''}`;
  const width=wideReportSections.has(section.title)?' report-card-wide':'';
  return `<section class="report-section report-card${width}"><h4>${escapeHtml(section.title)}</h4>${content}</section>`;
}
function renderResult(result){
  if(result.feature==='mobile')return `<div class="report-section"><p class="kicker">Private result</p><h3 class="report-title">Mobile recommendations</h3><p class="report-meta">${escapeHtml(result.subjectName)} · ${escapeHtml(result.birthDate)}</p><div class="metric-grid">${result.recommendations.map((number,index)=>`<div class="metric"><small>${index?'Alternative '+index:'Primary recommendation'}</small><b>${escapeHtml(number)}</b></div>`).join('')}</div><p class="confidential">Internal generation logic and scoring remain server-side.</p></div>`;
  const report=result.report;
  if(result.feature!=='primary')return `<div class="workspace-report feature-report"><p class="kicker">${escapeHtml(result.featureLabel)}</p><h3 class="report-title">${escapeHtml(report.subjectName)}</h3><p class="report-meta">${escapeHtml(report.birthDate)} · ${escapeHtml(report.birthTimeLabel)}</p><div class="report-insights-grid">${report.sections.map(renderReportSection).join('')}</div></div>`;
  const summary=result.feature==='primary'&&report.numberSummary
    ?`<div class="metric-grid report-number-summary">${Object.entries({Personality:report.numberSummary.personality,Destiny:report.numberSummary.destiny,Transformation:report.numberSummary.transformation,Soul:report.numberSummary.soul}).map(([label,value])=>`<div class="metric"><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></div>`).join('')}</div>`
    :'';
  return `<div class="workspace-report primary-report"><p class="kicker">${escapeHtml(result.featureLabel)}</p><h3 class="report-title">${escapeHtml(report.subjectName)}</h3><p class="report-meta">${escapeHtml(report.birthDate)} · ${escapeHtml(report.birthTimeLabel)}</p>${summary}<div class="report-insights-grid">${report.sections.map(renderReportSection).join('')}</div></div>`;
}
function selectPage(page){state.page=page;document.querySelectorAll('.nav-item').forEach(button=>{const selected=button.dataset.page===page;button.classList.toggle('active',selected);if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});document.querySelectorAll('.page').forEach(section=>section.hidden=section.id!==`page-${page}`);$('#page-title').textContent={primary:'Primary Sheldian Analysis',vedic:'Vedic Numerology Analysis',mobile:'Mobile Number Recommendation'}[page];window.scrollTo({top:0,behavior:'smooth'})}
function polishCopy(){const copy={primary:['Your personal numerology reading, with clear guidance. If birth time is unknown, choose an approved IST option.','Primary report','Enter your details to create a personal reading.','Unknown? Choose 05:00 or 17:00 IST.'],vedic:['A focused reading shaped by your birth date and recorded time.','Vedic report','Enter your details to create a Vedic reading.','Enter the recorded birth time.'],mobile:['Find up to three number recommendations matched to your details.','Number recommendations','Enter your details to find suitable options.']};Object.entries(copy).forEach(([page,[intro,title,hint,formHint]])=>{const view=$(`#page-${page}`);view.querySelector('.page-intro').textContent=intro;view.querySelector('.output-empty strong').textContent=title;view.querySelector('.output-empty span').textContent=hint;if(formHint){const helper=view.querySelector('.feature-form .hint');if(helper)helper.textContent=formHint}})}
async function start(){renderForms();polishCopy();try{await api('/api/auth/session');$('#login-view').hidden=true;$('#app-view').hidden=false;selectPage('primary')}catch(errorObject){if(errorObject.status!==401)showError($('#login-error'),errorObject.message)}}
$('#login-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({username:form.username.value,password:form.password.value})});$('#login-view').hidden=true;$('#app-view').hidden=false;selectPage('primary');showError($('#login-error'),'')}catch(errorObject){showError($('#login-error'),errorObject.message)}});
document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>selectPage(button.dataset.page)));
$('#report-modal-close').addEventListener('click',closeReport);
$('#report-modal').addEventListener('click',event=>{if(event.target===event.currentTarget)closeReport()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeReport()});
const logoutButton=$('#logout-button');
if(logoutButton)logoutButton.addEventListener('click',async()=>{const error=$('#app-error');showError(error,'');try{await api('/api/auth/logout',{method:'POST'})}catch(errorObject){showError(error,errorObject.message);return}$('#app-view').hidden=true;$('#login-view').hidden=false;$('#login-password').value=''});
start();
