const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../01_Application/core.js');
const tests=[];
const test=(name,fn)=>{try{fn();tests.push({name,pass:true});}catch(e){tests.push({name,pass:false,error:e.message});}};
function sample(id='TEST-P01',text=['Never','Almost never','Sometimes','Very often'],closed=[0,1,2,4]){
 let ms=0;const meta={session_id:id,participant_id:id,condition_order:'BA',collection_mode:'deferred',trial_type:'synthetic',notes:'SYNTHETIC SOFTWARE TEST DATA — NOT ACTUAL PARTICIPANT RESULTS'};
 const create=c=>new P.Trial({...meta,condition:c},()=>ms,()=>new Date(1792600000000+ms).toISOString());
 const b=create('B');for(const x of text){ms+=500;b.submit(x);}const a=create('A');for(const x of closed){ms+=700;a.submit(x);}
 return [...b.rows,...a.rows];
}
function code(rows){rows.filter(r=>r.condition==='B').forEach((r,i)=>{r.human_1=i===3?4:i;r.human_2=i===3?4:i;});return rows;}
test('Deferred empty input retries once then records unanswered',()=>{const t=new P.Trial({condition:'B',collection_mode:'deferred'});assert.equal(t.submit(''),'empty_prompt');assert.equal(t.submit(''),'response');assert.equal(t.rows[0].unanswered,1);assert.equal(t.rows[0].mapping_status,'unanswered');});
test('Deferred empty retry accepts original Unicode text unchanged',()=>{const t=new P.Trial({condition:'B',collection_mode:'deferred'});t.submit('');t.submit('  Sometimes, "café"\n🙂  ');assert.equal(t.rows[0].original_response,'  Sometimes, "café"\n🙂  ');assert.equal(t.rows[0].clarification_count,0);});
test('Deferred mapper refuses B-only collection despite completed human codes',()=>{const rows=code(sample()).filter(r=>r.condition==='B');assert.throws(()=>P.runDeferred(rows,'synthetic'),/complete|closed|paired/i);assert(rows.every(r=>r.auto_category===null));});
test('Deferred mapper validates both coders before any mutation',()=>{const rows=code(sample());rows[2].human_2=null;const before=JSON.stringify(rows);assert.throws(()=>P.runDeferred(rows,'synthetic'));assert.equal(JSON.stringify(rows),before);});
test('Deferred mapper resolves only after both portions and coders complete',()=>{const rows=code(sample());P.runDeferred(rows,'synthetic');assert.deepEqual(rows.slice(0,4).map(r=>r.auto_category),[0,1,2,4]);P.validateRows(rows);});
test('Deferred unclear answer stays unresolved without exposing choices',()=>{const rows=code(sample('TEST-P02',['Never','It depends','Sometimes','Very often']));P.runDeferred(rows,'synthetic');assert.equal(rows[1].mapping_status,'unclear');assert.equal(rows[1].auto_category,null);assert.equal(rows[1].fallback,0);assert.equal(rows[1].clarification_count,0);});
test('Deferred repeated mapping is idempotent',()=>{const rows=code(sample());P.runDeferred(rows,'synthetic');const before=JSON.stringify(rows);P.runDeferred(rows,'synthetic');assert.equal(JSON.stringify(rows),before);});
test('Manual comparisons reject duplicate B records',()=>{const rows=code(sample());assert.equal(P.manualAgreement([...rows,rows[0]],'synthetic','human_1').eligible_pairs,3);});
test('Manual comparisons never pair different participants sharing session ID',()=>{const rows=code(sample());rows.filter(r=>r.condition==='A').forEach(r=>r.participant_id='OTHER');assert.equal(P.manualAgreement(rows,'synthetic','human_1').eligible_pairs,0);});
test('Manual comparisons never pair different versions',()=>{const rows=code(sample());rows.filter(r=>r.condition==='A').forEach(r=>r.version='OTHER');assert.equal(P.manualAgreement(rows,'synthetic','human_1').eligible_pairs,0);});
test('Pending automatic coverage is unavailable rather than zero',()=>assert.equal(P.analyze(sample(),'synthetic').coverage,null));
test('Invalid human categories rejected on JSON import',()=>{const rows=sample();rows[0].human_1=8;assert.throws(()=>P.validateRows(rows));});
test('Invalid mapping status rejected on JSON import',()=>{const rows=sample();rows[0].mapping_status='invented';assert.throws(()=>P.validateRows(rows));});
test('Invalid collection mode rejected on JSON import',()=>{const rows=sample();rows[0].collection_mode='invented';assert.throws(()=>P.validateRows(rows));});
test('Contradictory pending automatic result rejected on JSON import',()=>{const rows=sample();rows[0].auto_category=0;rows[0].mapping_success=1;assert.throws(()=>P.validateRows(rows));});
test('All five manual comparisons are supported',()=>{const rows=code(sample());P.runDeferred(rows,'synthetic');const r=P.manualComparisons(rows,'synthetic');assert.equal(Object.keys(r).length,5);assert.equal(r.jai_vs_valentina.agreement,1);assert.equal(r.automatic_vs_closed.agreement,1);});
test('Unclear human codes excluded from numeric agreement',()=>{const rows=code(sample());rows[0].human_1='unclear';assert.equal(P.manualAgreement(rows,'synthetic','human_1').eligible_pairs,3);});
test('Unweighted kappa agrees with hand calculation',()=>assert.equal(P.agreementStats([[0,0],[1,1],[2,3],[3,2]]).kappa,1/3));
test('PSS scoring reverses only items two and three',()=>assert.equal(P.score([0,1,3,4]),8));
test('Zero category remains a valid mapping and match',()=>{const rows=code(sample());P.runDeferred(rows,'synthetic');assert.equal(P.analyze(rows,'synthetic').first_response.agreement,1);});
test('Paired export rejects duplicate A reference',()=>{const rows=code(sample());P.runDeferred(rows,'synthetic');const data=P.parseCSV(P.pairedCSV([...rows,rows[4]],'synthetic'));assert.equal(data[1][3],'');assert.equal(data[1][6],'');assert.match(data[1][8],/duplicate/i);});
test('Paired export cannot use another participant reference',()=>{const rows=code(sample());P.runDeferred(rows,'synthetic');rows.filter(r=>r.condition==='A').forEach(r=>r.participant_id='OTHER');const data=P.parseCSV(P.pairedCSV(rows,'synthetic'));assert(data.slice(1).every(r=>r[3]===''&&r[6]===''));});
test('Paired export identifies synthetic data explicitly',()=>{const rows=code(sample());P.runDeferred(rows,'synthetic');assert(P.pairedCSV(rows,'synthetic').includes('SYNTHETIC SOFTWARE TEST DATA — NOT ACTUAL PARTICIPANT RESULTS'));});
test('Blind manual sheet excludes closed automatic and other coder values',()=>{const csv=P.codingCSV(sample(),'synthetic','human_1',true);const data=P.parseCSV(csv);assert(!data[0].includes('closed_category'));assert(!data[0].includes('auto_category'));assert(!data[0].includes('human_2'));assert(data.slice(1).every(r=>r[4]===''));});
test('CSV parser round trips commas quotes apostrophes newline Unicode and empty values',()=>{const x=[['a','b','c'],['Sometimes, "café"\n🙂',"don't know",'']];assert.deepEqual(P.parseCSV(P.csvTable(x)),x);});
test('CSV parser rejects malformed quoted record',()=>assert.throws(()=>P.parseCSV('"unfinished'),/Unterminated|Malformed/));
test('Formula-leading response safely exported',()=>assert(P.csvTable([['=1+1']]).includes("'=1+1")));
test('Complete timing counts each condition once',()=>{const rows=code(sample());const r=P.analyze(rows,'synthetic');assert.deepEqual(r.timing_seconds.B,{n:1,median:2,min:2,max:2});assert.equal(r.timing_seconds.A.median,2.8);});
test('No real pilot results are inferred from synthetic rows',()=>assert.equal(P.analyze(sample(),'fallback').eligible_pairs,0));
test('Incomplete condition excluded from time summaries',()=>assert.equal(P.analyze(sample().filter(r=>r.condition==='B'&&r.question<4),'synthetic').timing_seconds.B.n,0));
const path=require('node:path'),cp=require('node:child_process');
const fixtureDir=path.join(__dirname,'pr1_evidence');fs.mkdirSync(fixtureDir,{recursive:true});
function cli(data){const file=path.join(fixtureDir,'manual_cli_fixture.csv');fs.writeFileSync(file,data);return cp.spawnSync(process.execPath,[path.join(__dirname,'manual_analysis.cjs'),file],{encoding:'utf8'});}
test('Manual CLI leaves blank human classifications unavailable',()=>{const result=cli(P.codingCSV(sample(),'synthetic'));assert.equal(result.status,0);assert.equal(JSON.parse(result.stdout).jai_vs_closed.eligible_pairs,0);});
test('Manual CLI labels generated classifications synthetic',()=>{const result=cli(P.codingCSV(code(sample()),'synthetic'));assert.equal(result.status,0);assert.equal(JSON.parse(result.stdout).label,P.SYNTHETIC_LABEL);assert.equal(JSON.parse(result.stdout).jai_vs_valentina.agreement,1);});
test('Manual CLI rejects an out-of-scale human classification',()=>{const data=P.parseCSV(P.codingCSV(sample(),'synthetic'));data[1][4]='9';const result=cli(P.csvTable(data));assert.notEqual(result.status,0);assert.match(result.stderr,/Invalid entered category/);});
const report={label:'SYNTHETIC SOFTWARE TEST DATA — NOT ACTUAL PARTICIPANT RESULTS',version:P.VERSION,total:tests.length,passed:tests.filter(t=>t.pass).length,failed:tests.filter(t=>!t.pass).length,skipped:0,tests};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
