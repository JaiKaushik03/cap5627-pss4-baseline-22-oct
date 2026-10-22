# CAP5627 Project 2.1 — offline PSS-4 pilot

Open `01_Application/index.html` in a browser. This version follows Prof. Lisetti's October 21 email: collect all free text first, then closed-ended answers. Fixed BA order is specific to this fallback pilot, not a change to the final within-subject study.

## Classroom workflow
1. Record the version/commit, browser, room and settings. Use anonymous P codes and confirm voluntary participation. No names, emails, face or voice recordings.
2. Run 1–2 team dry runs (select Team dry run); these are not baseline data.
3. Select Offline fallback baseline for classmates. Read the same instructions each time: “You will answer four questions about the last month in your own words, then answer the same questions using fixed choices. There are no right or wrong answers. We are testing our assessment approach, not you. Participation is voluntary and you may stop at any time.”
4. Collect B then A. No mapper, clarification or fixed-choice fallback runs during free-text collection. Stop with New participant if requested; partial records remain flagged. Thank the participant and explain that the two response formats will be compared.
5. Export backup JSON after every session. Data stays in this browser; clearing browser storage can erase it. Store exports privately, outside this repository.
6. Both researchers independently code original text in Researcher tools. Do not consult the closed-ended answers or each other's categories. Use Unclear when appropriate. Original coding is locked after mapping. The tools are a shared researcher workspace, not access-controlled blinding.
7. Run the mapper only after both coders finish. Manual results and automatic results remain separate. Unmapped responses reduce coverage and are not silently counted as successful mappings. No automatic clarification is available in this retrospective fallback.
8. Export official v2 left-block CSV, copying inputs into the official template and preserving its formula columns. Each CSV time is a B free-text item time; overall A/B condition times are reported separately in analysis. These are offline form times, not eEVA conversational timings. Do not duplicate condition times across item rows.

## Reporting
Label slides “fallback baseline”, fixed BA, offline interface. Show participants and paired-item counts, exact agreement and mapping coverage, descriptive time summaries. If mapping is unavailable, report each human coder's agreement and explain that automatic results will follow. SUS is not administered here; do not claim usability results for eEVA. The inherited kappa is unweighted; weighted kappa requested in guide v2 still requires a separately specified weighting choice/calculation. No statistical significance tests.

## Scope and validation
The interface has no avatar or social cues. It is not the final eEVA study. The mapper is Jai's conservative English frequency-phrase heuristic, not a validated language model. Protocol changes, final AB/BA design, SUS and eEVA integration remain future work.

Original source and 80 tests are preserved in the first Git commit. No participant data or original reports claiming browser/Excel verification are published in this repository.

Run software checks:
```
node 02_Tests/deferred.cjs
node -e "const p=require('./01_Application/core.js'); const r=require('./02_Tests/tests.js')(p); console.log(r.passed,r.total); if(r.failed)process.exit(1)"
```
Before class, do a human dry run on the actual laptop/browser, confirm exports open and the official log receives the intended columns.
