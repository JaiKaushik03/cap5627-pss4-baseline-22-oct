(function(root){
function runTests(P){const results=[];function test(name,fn){try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}const eq=(a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(JSON.stringify(a)+' != '+JSON.stringify(b));};
 const cases=[['Never',0],['Almost never',1],['Sometimes',2],['Fairly often',3],['Very often',4],['Rarely',1],['Occasionally',2],['Almost every day',4],['Hardly ever',1],['Pretty frequently',3],[' NOT OFTEN! ',1],['not very often',1],[' I feel this, SOMETIMES. ',2],['nevermore',null],["I don't know",null],['It depends',null],['Maybe',null],["I'm not sure",null],['I experience this sometimes and other times constantly',null],['not sometimes',null],['not never',null],["I don't feel confident very often",null],['3 times last month',null],['never except sometimes',null],['less frequently',null],['',null],['   ',null],['Sometimes, sometimes',2],['very often but only at work',null],['not at all',0]];
 cases.forEach(([s,v])=>test('Mapper '+JSON.stringify(s),()=>eq(P.mapResponse(s).category,v)));
 test('Exact questionnaire wording and order',()=>eq(P.QUESTIONS,[
 'In the last month, how often have you felt that you were unable to control the important things in your life?',
 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
 'In the last month, how often have you felt that things were going your way?',
 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?']));
 test('Five original categories',()=>eq(P.CATEGORIES,['Never','Almost never','Sometimes','Fairly often','Very often']));
 let ms=0;const meta={session_id:'SYNTHETIC',participant_id:'TEST01',condition_order:'AB',trial_type:'dry run',notes:'SYNTHETIC TEST DATA'},make=c=>new P.Trial({...meta,condition:c},()=>ms,()=>new Date(1792600000000+ms).toISOString());
 let a=make('A');test('A rejects missing category',()=>{let err=false;try{a.submit(null);}catch(e){err=true;}eq(err,true);eq(a.q,0);});
 test('A stores raw categories, advances and finishes',()=>{[0,1,3,4].forEach(v=>{ms+=250;a.submit(v);});eq(a.rows.map(r=>r.closed_category),[0,1,3,4]);eq(a.state,'done');eq(a.rows.map(r=>r.question),[1,2,3,4]);});
 test('Timing records actual injected elapsed milliseconds',()=>{eq(a.rows.map(r=>r.response_ms),[250,250,250,250]);eq(a.rows.map(r=>r.condition_ms),[1000,1000,1000,1000]);});
 test('Completed condition rejects extra response',()=>{let err=false;try{a.submit(2);}catch(e){err=true;}eq(err,true);});
 let b=make('B');test('B clear mapping',()=>{b.submit('Never');eq(b.rows[0].auto_category,0);eq(b.q,1);});
 test('B ambiguity requests exactly one clarification',()=>{eq(b.submit('It depends'),'clarification');eq(b.clarifications,1);});
 test('B clarification resolved automatically',()=>{b.submit('Rarely');eq(b.rows[1].clarification_count,1);eq(b.rows[1].mapping_success,1);eq(b.rows[1].original_response,'It depends');eq(b.rows[1].clarified_response,'Rarely');});
 test('B unresolved clarification falls back',()=>{eq(b.submit('Maybe'),'clarification');eq(b.submit("I don't know"),'fallback');b.submit(3);eq(b.rows[2].fallback,1);eq(b.rows[2].mapping_success,0);eq(b.rows[2].auto_category,null);eq(b.rows[2].final_category,3);});
 test('Two empty responses mark unanswered and finish',()=>{eq(b.submit(''),'empty_prompt');eq(b.submit(''),'done');eq(b.rows[3].unanswered,1);});
 test('Empty retry can resolve',()=>{const t=make('B');t.submit('');t.submit('sometimes');eq(t.rows[0].auto_category,2);eq(t.rows[0].clarification_count,0);});
 test('Empty after clarification is bounded',()=>{const t=make('B');t.submit('Maybe');t.submit('');t.submit('');eq(t.q,1);eq(t.rows[0].unanswered,1);});
 test('No state leaks to new trial',()=>{const t=make('B');eq([t.q,t.rows.length,t.clarifications,t.state],[0,0,0,'response']);});
 test('Raw scoring reverses only Q2 and Q3',()=>eq(P.score([0,1,3,4]),8));
 test('Minimum score',()=>eq(P.score([0,4,4,0]),0));test('Maximum score',()=>eq(P.score([4,0,0,4]),16));test('Incomplete score unavailable',()=>eq(P.score([0,null,0,0]),null));
 const data=[...a.rows,...b.rows];let report=P.analyze(data,'dry run');
 test('Fallback/unanswered excluded from automatic agreement',()=>eq([report.eligible_pairs,report.matches,report.disagreements],[2,2,0]));
 test('Coverage denominator includes every conversational item',()=>eq(report.coverage,0.5));
 test('Clarification rate',()=>eq(report.clarification_rate,0.5));test('Fallback rate',()=>eq(report.fallback_rate,0.25));
 test('Synthetic trials excluded by default',()=>eq(P.analyze(data).eligible_pairs,0));test('No data rates and kappa unavailable',()=>eq([P.analyze([]).agreement,P.analyze([]).kappa,P.analyze([]).coverage],[null,null,null]));
 test('Duplicate pairing rejected',()=>eq(P.analyze([...data,a.rows[0]],'dry run').eligible_pairs,1));
 test('Version mismatch cannot pair',()=>eq(P.analyze(data.map(r=>r.condition==='B'?{...r,version:'other'}:r),'dry run').eligible_pairs,0));
 test('Unweighted kappa hand calculation',()=>{const x=[];[[0,0],[1,1],[2,3],[3,2]].forEach(([aa,bb],i)=>{x.push({...a.rows[0],question:i+1,closed_category:aa});x.push({...b.rows[0],question:i+1,auto_category:bb,initial_auto_category:bb});});const r=P.analyze(x,'dry run');eq(r.eligible_pairs,4);eq(r.agreement,0.5);eq(r.kappa,1/3);eq(r.disagreements,2);});
 test('Degenerate kappa unavailable',()=>{const x=data.filter(r=>r.question<=2).map(r=>({...r,closed_category:0,auto_category:0}));eq(P.analyze(x,'dry run').kappa,null);});
 test('Median handles even, odd and empty',()=>eq([P.median([9,1,5]),P.median([2,4]),P.median([])],[5,3,null]));
 test('Completion summary counts each condition once',()=>eq(report.timing_seconds.A,{n:1,median:1,min:1,max:1}));
 test('Incomplete conditions excluded from timing',()=>eq(P.analyze(data.filter(r=>r.question!==4),'dry run').timing_seconds.A.n,0));
 test('CSV quotes commas, quotes and line breaks',()=>{const s=P.csv([{...a.rows[0],original_response:'hello, "there"\nnext'}]);if(!s.includes('"hello, ""there""\nnext"'))throw Error('CSV quoting failed');});
 test('CSV neutralizes spreadsheet formula injection',()=>{if(!P.csv([{...a.rows[0],original_response:'=1+1'}]).includes('"\'=1+1"'))throw Error('Unsafe formula');});
 test('CSV includes BOM and complete schema',()=>{const s=P.csv(a.rows);eq(s.charCodeAt(0),65279);eq(s.slice(1).split('\r\n')[0].split(',').length,P.FIELDS.length);});

 test('Quite frequently uses documented category three',()=>eq(P.mapResponse('Quite frequently').category,3));
 test('First-response agreement stays separate from resolved clarification',()=>{const t=make('B');t.submit('Maybe');t.submit('Rarely');const x=[{...a.rows[0],question:1,closed_category:1},...t.rows];const r=P.analyze(x,'dry run');eq([r.eligible_pairs,r.first_response.eligible_pairs],[1,0]);});
 test('Offline fallback baseline dataset can be selected',()=>eq(P.analyze(data.map(r=>({...r,trial_type:'fallback'})),'fallback').eligible_pairs,2));
 test('Synthetic software dataset excluded from actual baseline',()=>eq(P.analyze(data.map(r=>({...r,trial_type:'synthetic'})),'fallback').eligible_pairs,0));
 test('First-response kappa independent hand calculation',()=>{const r=P.agreementStats([[0,0],[1,1],[2,3],[3,2]]);eq(r.agreement,0.5);eq(r.kappa,1/3);});
 test('First-response agreement zero data is unavailable',()=>eq(P.agreementStats([]).agreement,null));
 test('All collected participants counted despite no eligible pairs',()=>eq(P.analyze(data.filter(r=>r.condition==='A'),'dry run').participants_collected,1));
 test('Complete questionnaire scores recorded',()=>eq(P.analyze(a.rows,'dry run').questionnaire_scores[0].score,8));
 test('Unanswered questionnaire score unavailable',()=>eq(P.analyze(b.rows,'dry run').questionnaire_scores[0].score,null));
 test('Interrupted A item retains full schema',()=>{const t=make('A');t.finish(null,false,null);eq(t.rows[0].original_response,'');eq(P.validateRows(t.rows),true);});
 test('Backup row schema accepted',()=>eq(P.validateRows(data),true));
 test('Backup duplicate rejected',()=>{let rejected=false;try{P.validateRows([...data,data[0]]);}catch(e){rejected=true;}eq(rejected,true);});
 test('Backup invalid category rejected',()=>{let rejected=false;try{P.validateRows([{...a.rows[0],final_category:5}]);}catch(e){rejected=true;}eq(rejected,true);});
 test('Backup contradictory mapping rejected',()=>{let rejected=false;try{P.validateRows([{...b.rows[0],fallback:1}]);}catch(e){rejected=true;}eq(rejected,true);});
 test('Backup negative timing rejected',()=>{let rejected=false;try{P.validateRows([{...a.rows[0],condition_ms:-1}]);}catch(e){rejected=true;}eq(rejected,true);});
 test('Different sessions never pair silently',()=>eq(P.analyze(data.map(r=>r.condition==='B'?{...r,session_id:'OTHER'}:r),'dry run').eligible_pairs,0));
 return {label:'SYNTHETIC TEST DATA — software verification only',executed_at:new Date().toISOString(),version:P.VERSION,total:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};
}
root.runTests=runTests;if(typeof module!=='undefined')module.exports=runTests;
})(typeof globalThis!=='undefined'?globalThis:this);
