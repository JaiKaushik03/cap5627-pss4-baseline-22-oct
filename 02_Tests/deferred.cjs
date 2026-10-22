const assert=require('node:assert/strict');
const P=require('../01_Application/core.js');
const meta={session_id:'test',participant_id:'P01',condition_order:'BA',collection_mode:'deferred',trial_type:'fallback',notes:''};
const b=new P.Trial({...meta,condition:'B'});
for(const answer of ['Sometimes','It depends','Never','Very often']) b.submit(answer);
assert.equal(b.state,'done');assert(b.rows.every(r=>r.auto_category===null&&r.mapping_status==='pending'&&r.clarification_count===0&&!r.fallback&&!r.unanswered));
assert.throws(()=>P.runDeferred(b.rows,'fallback'));
for(const r of b.rows){r.human_1=2;r.human_2='unclear';}
const a=new P.Trial({...meta,condition:'A'});[2,2,0,4].forEach(v=>a.submit(v));
const rows=[...b.rows,...a.rows];P.validateRows(rows);
assert.equal(P.manualAgreement(rows,'fallback','human_1').agreement,.5);
assert.equal(P.manualAgreement(rows,'fallback','human_2').eligible_pairs,0);
P.runDeferred(rows,'fallback');assert.equal(b.rows[1].mapping_status,'unclear');assert.equal(b.rows[1].auto_category,null);
assert.equal(P.analyze(rows,'fallback').first_response.agreement,1);
assert.equal(P.analyze(rows,'fallback').coverage,.75);
P.validateRows(rows);const before=JSON.stringify(rows);P.runDeferred(rows,'fallback');assert.equal(JSON.stringify(rows),before);
console.log('Deferred collection, manual coding gate, missing classifications, pairing, coverage and repeat mapping checks passed.');
