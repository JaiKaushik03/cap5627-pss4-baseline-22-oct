(function(root){
'use strict';
const VERSION='PSS4-offline-1.2.1';
const QUESTIONS=[
'In the last month, how often have you felt that you were unable to control the important things in your life?',
'In the last month, how often have you felt confident about your ability to handle your personal problems?',
'In the last month, how often have you felt that things were going your way?',
'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?'];
const CATEGORIES=['Never','Almost never','Sometimes','Fairly often','Very often'];
const RULES=[
[1,'low',/\b(almost never|hardly ever|hardly at all|very rarely|rarely|seldom|not very often|not often|almost not at all)\b/g],
[4,'high',/\b(very often|almost every day|every day|daily|all the time|constantly|always|almost always)\b/g],
[3,'frequent',/\b(fairly often|pretty frequently|quite frequently|quite often|frequently|often|most days|regularly)\b/g],
[2,'intermittent',/\b(sometimes|occasionally|once in a while|from time to time|now and then)\b/g],
[0,'none',/\b(never|not at all)\b/g]];
function normalize(s){return String(s).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/[^a-z0-9'\s]/g,' ').replace(/\s+/g,' ').trim();}
function mapResponse(original){
 const normalized=normalize(original), base={original,normalized,category:null,status:'unclear',rule_id:'',clarification_required:true,reason:''};
 if(!normalized)return {...base,status:'empty',reason:'No response'};
 if(/\b(don't know|do not know|not sure|unsure|depends|maybe|perhaps|cannot say|can't say|i guess)\b/.test(normalized))return {...base,reason:'Uncertain or conditional wording'};
 let rest=normalized,hits=[];
 for(const [category,id,re] of RULES){rest=rest.replace(re,m=>{hits.push({category,id,phrase:m});return ' ';});}
 const cats=[...new Set(hits.map(h=>h.category))];
 if(cats.length>1)return {...base,reason:'Conflicting frequency categories',rule_id:hits.map(h=>h.id).join('+')};
 if(/\b(not|no|never|don't|doesn't|didn't|haven't|hasn't|can't|cannot|without|isn't|wasn't|except|but|unless|less|more)\b/.test(rest))return {...base,reason:'Negation or qualification needs clarification'};
 if(/\d/.test(rest))return {...base,reason:'Numeric frequency has no validated category threshold'};
 if(cats.length===1)return {...base,category:cats[0],status:'mapped',rule_id:[...new Set(hits.map(h=>h.id))].join('+'),clarification_required:false,reason:''};
 return {...base,reason:'No supported frequency phrase'};
}
function score(raw){return raw.length===4&&raw.every(validCategory)?raw[0]+4-raw[1]+4-raw[2]+raw[3]:null;}
function validCategory(x){return Number.isInteger(x)&&x>=0&&x<=4;}
const FIELDS=['trial_id','session_id','participant_id','date','time','version','condition','condition_order','question','original_response','closed_category','auto_category','initial_auto_category','final_category','clarified_response','clarification_count','fallback','mapping_success','unanswered','response_ms','condition_ms','condition_start','condition_end','error_notes','trial_type','notes','history','rule_id','collection_mode','mapping_status','human_1','human_2'];
function csv(rows){return '\ufeff'+[FIELDS,...rows.map(r=>FIELDS.map(f=>r[f]??''))].map(a=>a.map(v=>{let s=String(v);if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
class Trial{
 constructor(meta,clock=()=>performance.now(),wall=()=>new Date().toISOString()){
  this.meta=meta;this.clock=clock;this.wall=wall;this.rows=[];this.q=0;this.state='response';this.started=wall();this.t0=clock();this.itemT=this.t0;this.history=[];this.clarifications=0;this.emptyCount=0;
 }
 submit(value){
  if(this.state==='done')throw Error('Condition already complete');
  if(this.meta.condition==='A'||this.state==='fallback'){
   if(!validCategory(value))throw Error('Choose a category from 0 to 4');
   return this.finish(value,this.meta.condition==='B',null);
  }
  if(this.meta.collection_mode==='deferred'){
   const original=String(value),text=original.trim();
   this.history.push({original,status:text?'pending':'empty'});
   if(!text){
    this.emptyCount++;
    if(this.emptyCount<2){this.state='empty_prompt';return this.state;}
    const state=this.finish(null,false,null);this.rows.at(-1).mapping_status='unanswered';return state;
   }
   const state=this.finish(null,false,null);
   Object.assign(this.rows.at(-1),{original_response:original,unanswered:0,mapping_status:'pending'});
   return state;
  }
  const m=mapResponse(value);this.history.push(m);
  if(m.status==='empty'){
   this.emptyCount++;if(this.emptyCount>=2)return this.finish(null,false,null);
   this.state='empty_prompt';return this.state;
  }
  this.emptyCount=0;
  if(m.status==='mapped')return this.finish(m.category,false,m);
  if(this.clarifications===0){this.clarifications=1;this.state='clarification';return this.state;}
  this.state='fallback';return this.state;
 }
 finish(category,fallback,m){
  const end=this.wall(), first=this.history[0], last=this.history.at(-1), row={...this.meta,version:VERSION,collection_mode:this.meta.collection_mode||'interactive',mapping_status:this.meta.condition==='A'?'not applicable':'interactive',human_1:null,human_2:null,trial_id:this.meta.session_id+'-'+this.meta.condition+'-'+(this.q+1),question:this.q+1,date:end.slice(0,10),time:end.slice(11),original_response:this.meta.condition==='A'?(CATEGORIES[category]??''):first?.original??'',closed_category:this.meta.condition==='A'?category:null,auto_category:m?category:null,initial_auto_category:first?.status==='mapped'?first.category:null,final_category:category,clarified_response:this.history.length>1?last.original:'',clarification_count:this.clarifications,fallback:Number(fallback),mapping_success:Number(!!m),unanswered:Number(category===null),response_ms:Math.max(0,Math.round(this.clock()-this.itemT)),condition_ms:null,condition_start:this.started,condition_end:'',error_notes:'',history:JSON.stringify(this.history),rule_id:m?.rule_id??''};
  this.rows.push(row);this.q++;this.history=[];this.clarifications=0;this.emptyCount=0;this.itemT=this.clock();
  this.state=this.q===4?'done':'response';
  if(this.state==='done'){const elapsed=Math.max(0,Math.round(this.clock()-this.t0));this.rows.forEach(r=>{r.condition_ms=elapsed;r.condition_end=end;});}
  return this.state;
 }
}
function median(xs){if(!xs.length)return null;const a=[...xs].sort((a,b)=>a-b),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function analyze(rows,type='genuine pilot'){
 const data=rows.filter(r=>r.trial_type===type), groups=new Map(), excluded=[];
 for(const r of data){const key=[r.version,r.session_id,r.participant_id,r.question].join('|');if(!groups.has(key))groups.set(key,{A:[],B:[]});groups.get(key)[r.condition]?.push(r);}
 const pairs=[],initialPairs=[],B=data.filter(r=>r.condition==='B'),participants={};
 for(const [key,g] of groups){if(g.A.length!==1||g.B.length!==1){excluded.push(key+': missing or duplicate condition');continue;}
  const a=g.A[0],b=g.B[0];if(validCategory(a.closed_category)&&b.mapping_success===1&&!b.fallback&&!b.unanswered&&validCategory(b.auto_category)){pairs.push([a.closed_category,b.auto_category]);const p=participants[a.participant_id]??={eligible:0,matches:0};p.eligible++;p.matches+=Number(a.closed_category===b.auto_category);}
  if(validCategory(a.closed_category)&&validCategory(b.initial_auto_category))initialPairs.push([a.closed_category,b.initial_auto_category]);
 }
 const matrix=Array.from({length:5},()=>Array(5).fill(0));pairs.forEach(([a,b])=>matrix[a][b]++);
 const n=pairs.length,matches=pairs.filter(([a,b])=>a===b).length,po=n?matches/n:null;
 const pe=n?CATEGORIES.reduce((s,_,k)=>s+matrix[k].reduce((a,b)=>a+b,0)*matrix.reduce((s,r)=>s+r[k],0),0)/(n*n):null;
 const kappa=n>=2&&pe!==1?(po-pe)/(1-pe):null;
 const time={};for(const c of ['A','B']){const runs=new Map();data.filter(r=>r.condition===c).forEach(r=>{const k=r.version+'|'+r.session_id;if(!runs.has(k))runs.set(k,[]);runs.get(k).push(r);});const times=[...runs.values()].filter(a=>a.length===4&&new Set(a.map(r=>r.question)).size===4&&a.every(r=>typeof r.condition_ms==='number'&&r.condition_ms>=0&&r.condition_end)).map(a=>a[0].condition_ms/1000);time[c]={n:times.length,median:median(times),min:times.length?Math.min(...times):null,max:times.length?Math.max(...times):null};}
 const rate=f=>B.length?B.filter(f).length/B.length:null;
 const first_response=agreementStats(initialPairs);
 const pending_items=B.filter(r=>r.collection_mode==='deferred'&&r.mapping_status==='pending').length;
 const questionnaire_scores=[];
 const scoreGroups=new Map();
 for(const r of data){const k=[r.version,r.session_id,r.participant_id,r.condition].join('|');if(!scoreGroups.has(k))scoreGroups.set(k,[]);scoreGroups.get(k).push(r);}
 for(const rs of scoreGroups.values()){const sorted=[...rs].sort((a,b)=>a.question-b.question);if(sorted.length===4&&sorted.every((r,i)=>r.question===i+1)&&sorted.every(r=>r.condition_end)){questionnaire_scores.push({participant_id:sorted[0].participant_id,session_id:sorted[0].session_id,condition:sorted[0].condition,score:score(sorted.map(r=>r.final_category)),includes_structured_fallback:sorted.some(r=>r.fallback===1)});}}

 return {trial_type:type,first_response,pending_items,questionnaire_scores,participants_collected:new Set(data.map(r=>r.participant_id)).size,participants:Object.keys(participants).length,participant_agreement:participants,eligible_pairs:n,matches,disagreements:n-matches,agreement:po,initial_eligible_pairs:initialPairs.length,initial_matches:initialPairs.filter(([a,b])=>a===b).length,kappa,kappa_note:n<20?'Very small item count; kappa is unstable and not yet meaningful as evidence.':'Descriptive only; repeated items within participants are dependent.',matrix,conversational_items:B.length,coverage:pending_items?null:rate(r=>r.mapping_success===1&&!r.fallback&&!r.unanswered),clarification_rate:rate(r=>r.clarification_count>0),fallback_rate:rate(r=>r.fallback===1),unanswered:B.filter(r=>r.unanswered).length,timing_seconds:time,excluded};
}
function agreementStats(pairs){
 const matrix=Array.from({length:5},()=>Array(5).fill(0));for(const [a,b] of pairs)matrix[a][b]++;
 const n=pairs.length,matches=pairs.filter(([a,b])=>a===b).length;
 const po=n?matches/n:null;
 const pe=n?CATEGORIES.reduce((sum,_,i)=>sum+matrix[i].reduce((x,y)=>x+y,0)*matrix.reduce((x,r)=>x+r[i],0),0)/(n*n):null;
 return {eligible_pairs:n,matches,disagreements:n-matches,agreement:po,kappa:n>=2&&pe!==1?(po-pe)/(1-pe):null,matrix};
}
function validateRows(rows){
 if(!Array.isArray(rows))throw Error('Rows must be an array.');
 const ids=new Set();for(const r of rows){
 if(!FIELDS.every(f=>Object.hasOwn(r,f))||r.version!==VERSION||!['A','B'].includes(r.condition)||!Number.isInteger(r.question)||r.question<1||r.question>4||!['synthetic','dry run','genuine pilot','fallback'].includes(r.trial_type)||!['AB','BA'].includes(r.condition_order)||!r.session_id||!r.trial_id||!/^[A-Z][A-Z0-9_-]{1,19}$/.test(r.participant_id))throw Error('Invalid trial identifiers or schema.');
 for(const f of ['closed_category','auto_category','initial_auto_category','final_category'])if(r[f]!==null&&!validCategory(r[f]))throw Error('Invalid category.');
 if(!['interactive','deferred'].includes(r.collection_mode)||!['not applicable','interactive','pending','mapped','unclear','empty','unanswered'].includes(r.mapping_status))throw Error('Invalid collection mode or mapping status.');
 for(const field of ['human_1','human_2'])if(r[field]!==null&&r[field]!=='unclear'&&!validCategory(r[field]))throw Error('Invalid manual category.');
 if(r.mapping_status==='pending'&&(r.mapping_success||r.auto_category!==null||r.initial_auto_category!==null))throw Error('Pending mapping cannot contain automatic results.');
 for(const f of ['fallback','mapping_success','unanswered','clarification_count'])if(![0,1].includes(r[f]))throw Error('Invalid event flag.');
 if(r.mapping_success===1&&(r.fallback||r.unanswered||!validCategory(r.auto_category)))throw Error('Invalid automatic mapping status.');
 if(r.response_ms!==null&&(!Number.isFinite(r.response_ms)||r.response_ms<0))throw Error('Invalid item timing.');
 if(r.condition_ms!==null&&(!Number.isFinite(r.condition_ms)||r.condition_ms<0))throw Error('Invalid condition timing.');
 if(ids.has(r.trial_id))throw Error('Duplicate trial ID inside backup.');ids.add(r.trial_id);
 }return true;
}
function runDeferred(rows,type){
 const data=rows.filter(r=>r.trial_type===type);
 const targets=data.filter(r=>r.condition==='B'&&r.collection_mode==='deferred'&&completeSession(data,r));
 if(!targets.length)throw Error('No complete paired sessions: finish all four free-text and closed-ended questions before mapping.');
 if(targets.some(r=>!r.unanswered&&(![0,1,2,3,4,'unclear'].includes(r.human_1)||![0,1,2,3,4,'unclear'].includes(r.human_2))))throw Error('Both researchers must code every answered free-text response before running the mapper.');
 for(const r of targets){if(r.unanswered||r.mapping_status!=='pending')continue;const m=mapResponse(r.original_response);r.auto_category=m.category;r.initial_auto_category=m.category;r.final_category=m.category;r.mapping_success=Number(m.status==='mapped');r.mapping_status=m.status;r.rule_id=m.rule_id;}
 return targets.length;
}
function manualAgreement(rows,type,field){
 return agreementStats(pairRows(rows,type).pairs.filter(({a,b})=>!b.unanswered&&validCategory(a.closed_category)&&validCategory(b[field])).map(({a,b})=>[a.closed_category,b[field]]));
}
function completeSession(data,row){
 const session=data.filter(r=>r.session_id===row.session_id&&r.participant_id===row.participant_id&&r.version===row.version);
 return ['B','A'].every(c=>{const items=session.filter(r=>r.condition===c);return items.length===4&&[1,2,3,4].every(q=>items.filter(r=>r.question===q).length===1)&&items.every(r=>r.condition_end&&Number.isFinite(r.condition_ms)&&r.condition_ms>=0);});
}
function pairRows(rows,type){
 const groups=new Map(),excluded=[];
 for(const r of rows.filter(r=>r.trial_type===type)){
  const key=JSON.stringify([r.version,r.session_id,r.participant_id,r.question]);
  if(!groups.has(key))groups.set(key,{A:[],B:[]});if(groups.get(key)[r.condition])groups.get(key)[r.condition].push(r);
 }
 const pairs=[];
 for(const [key,g] of groups){if(g.A.length===1&&g.B.length===1)pairs.push({a:g.A[0],b:g.B[0]});else excluded.push({key,reason:'Missing or duplicate condition'});}
 return {pairs,excluded};
}
function manualComparisons(rows,type){
 const pairs=pairRows(rows,type).pairs;
 const comparison=(left,right)=>agreementStats(pairs.filter(p=>!p.b.unanswered&&validCategory(left(p))&&validCategory(right(p))).map(p=>[left(p),right(p)]));
 const automatic=p=>p.b.mapping_success===1&&!p.b.fallback?p.b.auto_category:null;
 return {jai_vs_valentina:comparison(p=>p.b.human_1,p=>p.b.human_2),jai_vs_closed:comparison(p=>p.b.human_1,p=>p.a.closed_category),valentina_vs_closed:comparison(p=>p.b.human_2,p=>p.a.closed_category),automatic_vs_closed:comparison(automatic,p=>p.a.closed_category),automatic_vs_manual:{jai:comparison(automatic,p=>p.b.human_1),valentina:comparison(automatic,p=>p.b.human_2)}};
}
const SYNTHETIC_LABEL='SYNTHETIC SOFTWARE TEST DATA — NOT ACTUAL PARTICIPANT RESULTS';
function csvTable(table){return '\ufeff'+table.map(row=>row.map(v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
function parseCSV(input){
 const text=String(input).replace(/^\ufeff/,''),rows=[];let row=[],field='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
  if(c==='"'){if(field||closed)throw Error('Malformed CSV quote');quoted=true;continue;}
  if(c===','){row.push(field);field='';closed=false;continue;}
  if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';closed=false;continue;}
  if(closed)throw Error('Malformed CSV content after quote');field+=c;
 }
 if(quoted)throw Error('Unterminated CSV quote');if(field||row.length||closed){row.push(field);rows.push(row);}return rows;
}
function pairedCSV(rows,type){
 const paired=new Map(pairRows(rows,type).pairs.map(p=>[p.b,p.a]));
 const table=[['Response ID','Participant','Question ID','Closed-ended answer','Free-text answer','Predicted category','Agree? (1 = yes)','Completion time (s)','Notes']];
 for(const b of rows.filter(r=>r.trial_type===type&&r.condition==='B')){
  const a=paired.get(b),mapped=b.mapping_success===1&&!b.fallback&&!b.unanswered&&validCategory(b.auto_category);
  const notes=[b.trial_type==='synthetic'?SYNTHETIC_LABEL:b.trial_type,'B free-text item time in offline form; fixed BA','version '+b.version,'mapper '+b.mapping_status,!a?'Missing or duplicate paired condition':'',b.error_notes,b.notes].filter(Boolean).join('; ');
  table.push([b.trial_id,b.participant_id,b.question,validCategory(a?.closed_category)?a.closed_category:'',b.original_response,mapped?b.auto_category:'',a&&validCategory(a.closed_category)&&mapped?Number(a.closed_category===b.auto_category):'',Number.isFinite(b.response_ms)?b.response_ms/1000:'',notes]);
 }
 return csvTable(table);
}
function codingCSV(rows,type,field='human_1',blind=false){
 if(!['human_1','human_2'].includes(field))throw Error('Unknown researcher');
 const pairs=new Map(pairRows(rows,type).pairs.map(p=>[p.b,p.a]));
 const header=blind?['session_id','participant_id','question','original_response',field,'notes']:['session_id','participant_id','question','original_response','human_1','human_2','closed_category','auto_category','mapping_status','jai_vs_valentina','jai_vs_closed','valentina_vs_closed','automatic_vs_closed','automatic_vs_jai','automatic_vs_valentina','notes'];
 const table=[header],agree=(x,y)=>validCategory(x)&&validCategory(y)?Number(x===y):'';
 for(const b of rows.filter(r=>r.trial_type===type&&r.condition==='B')){
  const a=pairs.get(b),auto=b.mapping_success===1&&!b.fallback&&!b.unanswered?b.auto_category:null,notes=b.trial_type==='synthetic'?SYNTHETIC_LABEL:'Independent human coding required; leave unknown classifications blank.';
  table.push(blind?[b.session_id,b.participant_id,b.question,b.original_response,b[field]??'',notes]:[b.session_id,b.participant_id,b.question,b.original_response,b.human_1??'',b.human_2??'',a?.closed_category??'',auto??'',b.mapping_status,agree(b.human_1,b.human_2),agree(b.human_1,a?.closed_category),agree(b.human_2,a?.closed_category),agree(auto,a?.closed_category),agree(auto,b.human_1),agree(auto,b.human_2),notes]);
 }
 return csvTable(table);
}
const api={pairRows,manualComparisons,pairedCSV,codingCSV,csvTable,parseCSV,SYNTHETIC_LABEL,runDeferred,manualAgreement,agreementStats,validateRows,VERSION,QUESTIONS,CATEGORIES,RULES,FIELDS,normalize,mapResponse,validCategory,score,csv,Trial,median,analyze};
root.PSS=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
