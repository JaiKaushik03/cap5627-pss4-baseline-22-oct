// Run with Node from any directory. All inputs are synthetic.
const fs = require('fs');
const path = require('path');
const PSS = require(path.join(__dirname, '../01_Application/core.js'));
const run = require(path.join(__dirname, 'tests.js'));
const report = run(PSS);
fs.writeFileSync(path.join(__dirname, 'unit_results.json'), JSON.stringify(report, null, 2));
console.log(`${report.passed} passed / ${report.total} executed; ${report.failed} failed`);
if (report.failed) process.exitCode = 1;
