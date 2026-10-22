// Compare entered codes. Never fill human codes or run automatic mapping.
const fs=require('node:fs'),P=require('../01_Application/core.js');
if(!process.argv[2]){console.error('Usage: node 02_Tests/manual_analysis.cjs comparison.csv [result.json]');process.exit(1);}
const table=P.parseCSV(fs.readFileSync(process.argv[2],'utf8')),header=table.shift();
for(const name of ['session_id','participant_id','question','human_1','human_2','closed_category','auto_category'])if(!header.includes(name))throw Error('Missing column '+name);
const records=table.map(row=>Object.fromEntries(header.map((name,i)=>[name,row[i]]))),counts=new Map();
const key=r=>JSON.stringify([r.session_id,r.participant_id,r.question]);for(const r of records)counts.set(key(r),(counts.get(key(r))||0)+1);
for(const r of records)for(const f of ['human_1','human_2','closed_category','auto_category'])if(!['','unclear','0','1','2','3','4'].includes(r[f]))throw Error('Invalid entered category in '+f);
const unique=records.filter(r=>counts.get(key(r))===1),cat=v=>v!==''&&/^[0-4]$/.test(v)?Number(v):null;
const compare=(a,b)=>P.agreementStats(unique.filter(r=>cat(r[a])!==null&&cat(r[b])!==null).map(r=>[cat(r[a]),cat(r[b])]));
const report={label:records.length&&records.every(r=>(r.notes||'').includes(P.SYNTHETIC_LABEL))?P.SYNTHETIC_LABEL:'Entered classifications only; no automatic human coding',rows:records.length,duplicate_rows_excluded:records.length-unique.length,jai_vs_valentina:compare('human_1','human_2'),jai_vs_closed:compare('human_1','closed_category'),valentina_vs_closed:compare('human_2','closed_category'),automatic_vs_closed:compare('auto_category','closed_category'),automatic_vs_jai:compare('auto_category','human_1'),automatic_vs_valentina:compare('auto_category','human_2')};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
