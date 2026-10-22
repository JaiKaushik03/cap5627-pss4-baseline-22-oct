'use strict';
const $=id=>document.getElementById(id);let rows=[],trial=null,session=null,completed=[];
$('version').textContent=PSS.VERSION;
const STORAGE_KEY='CAP5627_PSS4_'+PSS.VERSION;
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:PSS.VERSION,rows,active:trial&&trial.state!=='done'?{meta:trial.meta,q:trial.q,history:trial.history,clarifications:trial.clarifications}:null}));$('storage').textContent='Local recovery is available. Export CSV and JSON after each session.';}catch(e){$('storage').textContent='Local recovery unavailable. Export before refreshing or closing this tab.';}}
function interruptCurrent(note){if(!trial||trial.state==='done')return;trial.finish(null,false,null);const r=trial.rows.at(-1);r.response_ms=null;r.condition_ms=null;r.condition_end='';r.error_notes=note;if(r.condition==='B'&&r.collection_mode==='deferred')r.mapping_status='unanswered';trial.rows.slice(0,-1).forEach(x=>{x.condition_ms=null;x.condition_end='';x.error_notes=note;});for(const x of trial.rows)if(!rows.some(y=>y.trial_id===x.trial_id))rows.push(x);trial=null;persist();}
function restore(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(!saved)return;PSS.validateRows(saved.rows);rows=saved.rows;if(saved.active){const x=saved.active;trial=new PSS.Trial(x.meta);trial.q=x.q;trial.history=x.history;trial.clarifications=x.clarifications;rows.filter(r=>r.session_id===x.meta.session_id&&r.condition===x.meta.condition).forEach(r=>{r.error_notes='Interrupted by refresh or browser restart';r.condition_ms=null;r.condition_end='';});interruptCurrent('Interrupted by refresh or browser restart; elapsed time unavailable');} $('storage').textContent='Previous rows recovered locally. Interrupted conditions are flagged. Export before starting another session.';}catch(e){$('storage').textContent='Recovery could not be read: '+e.message+' Keep any exported backups.';}}

function view(id){
 document.querySelector('.research').hidden=id!=='research';
 ['setup','question','between'].forEach(x=>$(x).hidden=x!==id);
 $('openResearch').hidden=id==='question'||id==='between'&&completed.length<2;
 $('openResearch').textContent=id==='research'?'Return to participant setup':'Researcher workspace';
 $('researcher').open=id==='research';
}
function refresh(){ $('count').textContent=rows.length+' recorded item rows. Export before closing, refreshing, or clearing.';const body=$('log');body.replaceChildren();for(const r of rows.slice(-24)){const tr=document.createElement('tr');[r.participant_id,r.condition,r.question,r.auto_category??'—',r.clarification_count,r.fallback,r.trial_type].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});body.append(tr);} }
function begin(){const condition=session.condition_order[completed.length];trial=new PSS.Trial({...session,condition});view('question');render();persist();}
function render(){ $('progress').textContent='Condition '+trial.meta.condition+' · Question '+(trial.q+1)+' of 4';$('qtext').textContent=PSS.QUESTIONS[trial.q];$('qtext').focus();$('answer').value='';$('error').textContent='';const fixed=trial.meta.condition==='A'||trial.state==='fallback';$('free').hidden=fixed;$('choices').replaceChildren();if(fixed)PSS.CATEGORIES.forEach((c,i)=>{const label=document.createElement('label');label.className='option';const radio=document.createElement('input');radio.type='radio';radio.name='category';radio.value=i;label.append(radio,document.createTextNode(c));$('choices').append(label);});$('prompt').textContent=trial.state==='clarification'?'Could you describe how often that happened during the last month?':trial.state==='fallback'?'Please choose the option that best describes your experience during the last month.':trial.state==='empty_prompt'?'Please provide a response. If you leave it empty again, this item will be recorded as unanswered.':fixed?'Choose one response.':'Please answer in your own words.'; }
$('startForm').onsubmit=e=>{e.preventDefault();if(!$('consent').checked)return;const pid=$('pid').value.trim().toUpperCase(),type=$('type').value;if(!/^[A-Z][A-Z0-9_-]{1,19}$/.test(pid)){alert('Use a code such as P01, without spaces.');return;}if(rows.some(r=>r.participant_id===pid&&r.trial_type===type)){alert('This code already has rows for this trial type. Use a new anonymous code or export and clear the cohort.');return;}session={session_id:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2),participant_id:pid,condition_order:'BA',collection_mode:'deferred',trial_type:type,notes:$('notes').value};completed=[];begin();};
$('answerForm').onsubmit=e=>{e.preventDefault();const fixed=trial.meta.condition==='A'||trial.state==='fallback',selected=document.querySelector('input[name="category"]:checked');if(fixed&&!selected){$('error').textContent='Choose a response before continuing.';return;}try{trial.submit(fixed?Number(selected.value):$('answer').value);for(const r of trial.rows)if(!rows.some(x=>x.trial_id===r.trial_id))rows.push(r);persist();if(trial.state==='done'){completed.push(trial.meta.condition);view('between');$('next').hidden=completed.length===2;$('allDone').hidden=completed.length!==2;refresh();}else render();}catch(err){$('error').textContent=err.message;}};
$('next').onclick=begin;
function download(name,data,mime){const url=URL.createObjectURL(new Blob([data],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').onclick=()=>download('PSS4_trials_'+new Date().toISOString().replace(/[:.]/g,'-')+'.csv',PSS.csv(rows),'text/csv;charset=utf-8');
$('json').onclick=()=>download('PSS4_backup_'+Date.now()+'.json',JSON.stringify({version:PSS.VERSION,rows},null,2),'application/json');
$('import').onchange=async e=>{try{let pending=[];for(const file of e.target.files){const obj=JSON.parse(await file.text());if(obj.version!==PSS.VERSION||!Array.isArray(obj.rows))throw Error('Unsupported backup version or structure.');PSS.validateRows(obj.rows);pending.push(...obj.rows);}const ids=new Set(rows.map(r=>r.trial_id));let added=0;for(const r of pending){if(ids.has(r.trial_id))continue;rows.push(r);ids.add(r.trial_id);added++;}persist();refresh();alert(added+' rows loaded. Duplicate trial IDs were skipped.');}catch(err){alert(err.message);}e.target.value='';};
$('analyze').onclick=()=>{const type=$('analysisType').value;$('summary').textContent=JSON.stringify({timing_note:'Offline form times, not eEVA conversational times. Fixed BA order.',manual_researcher_1:PSS.manualAgreement(rows,type,'human_1'),manual_researcher_2:PSS.manualAgreement(rows,type,'human_2'),comparisons:PSS.manualComparisons(rows,type),automatic:PSS.analyze(rows,type)},null,2);};
$('map').onclick=()=>{$('mapResult').textContent='SYNTHETIC TEST DATA\n'+JSON.stringify(PSS.mapResponse($('mapText').value),null,2);};
function clean(){trial=null;session=null;completed=[];document.querySelectorAll('textarea').forEach(x=>x.value='');$('startForm').reset();view('setup');persist();refresh();}
$('new').onclick=()=>{if(trial&&trial.state!=='done'&&!confirm('Abandon the incomplete condition? Completed conditions remain recorded; partial items will be retained with an error note.'))return;if(trial&&trial.state!=='done')interruptCurrent('Condition abandoned before completion');clean();};
$('reset').onclick=()=>{if(confirm('Clear all recorded responses from this tab? Export first.')){rows=[];$('summary').textContent='Actual baseline results pending participant testing.';$('mapResult').textContent='';clean();}};
window.addEventListener('beforeunload',e=>{if(rows.length||trial){e.preventDefault();e.returnValue='';}});restore();refresh();

$('loadCoding').onclick=()=>{
 const field=$('coder').value;const body=$('coding');body.replaceChildren();
 for(const r of rows.filter(r=>r.trial_type===$('analysisType').value&&r.condition==='B'&&r.collection_mode==='deferred')){
 const box=document.createElement('div'),label=document.createElement('label'),select=document.createElement('select');
 label.textContent=r.participant_id+' / Q'+r.question+': '+r.original_response;
 [['','Choose a category'],...PSS.CATEGORIES.map((v,i)=>[String(i),v]),['unclear','Unclear / cannot classify']].forEach(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);});
 select.value=r[field]===null?'':String(r[field]);select.disabled=r.mapping_status!=='pending';
 select.onchange=()=>{r[field]=select.value===''?null:select.value==='unclear'?'unclear':Number(select.value);persist();};
 box.append(label,select);body.append(box);
 }
};
$('runMapper').onclick=()=>{try{if(!confirm('Have both researchers finished coding independently? Automatic results will now be generated.'))return;PSS.runDeferred(rows,$('analysisType').value);persist();refresh();$('coding').replaceChildren();$('analyze').click();}catch(e){alert(e.message);}};
$('paired').onclick=()=>download('PSS4_official_v2_left_block.csv',PSS.pairedCSV(rows,$('analysisType').value),'text/csv;charset=utf-8');
$('blindJai').onclick=()=>download('PSS4_blind_manual_Jai.csv',PSS.codingCSV(rows,$('analysisType').value,'human_1',true),'text/csv;charset=utf-8');
$('blindValentina').onclick=()=>download('PSS4_blind_manual_Valentina.csv',PSS.codingCSV(rows,$('analysisType').value,'human_2',true),'text/csv;charset=utf-8');
$('codingExport').onclick=()=>download('PSS4_manual_comparison.csv',PSS.codingCSV(rows,$('analysisType').value),'text/csv;charset=utf-8');
$('openResearch').onclick=()=>view(document.querySelector('.research').hidden?'research':'setup');
