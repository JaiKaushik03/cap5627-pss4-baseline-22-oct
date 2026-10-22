# CAP 5627 Project 2.1 completion report

Verified October 21 2026. Version PSS4-offline-1.1.0.

## 1 Overall status

The offline application works and was actually tested in Edge 155 with networking disabled. It implements the professor-approved fallback described in the supplied request. No external page requests or browser page errors were recorded. It is ready for human classroom dry runs and subsequent baseline collection. No genuine pilot results were available or fabricated.

## 2 Actual code status

Working features include both four-item conditions, exact PSS-4 wording/order/categories, clear-text mapping, one neutral clarification, successful clarified mapping, structured fallback, empty-answer handling, anonymous sessions, AB/BA order, item/condition timing, partial/interrupted logs, local recovery, CSV/JSON export/import, dataset filters, separate first-response and clarified agreement, kappa and scoring. The mapper is deterministic, without a trained model or network API.

No unresolved defect was found within the tested offline scope. Human dry runs, real pilot collection, final SUS administration and eEVA integration remain unfinished. Local recovery is browser-policy dependent. No face/voice recordings are made.

## 3 Test results

| Evidence | Executed | Passed | Failed |
| Unit suite | 80 | 80 | 0 |
| Offline browser interaction checks | 36 | 36 | 0 |
| Spreadsheet calculation checks | 44 | 44 | 0 |
| Native Microsoft Excel checks | 25 | 25 | 0 |

The browser also executes the same 80 unit tests; do not double-count these as different test cases. Browser checks cover both orders, raw categories, clear/unclear/empty answers, clarification resolution, manual fallback exclusion, session isolation, recovery, export/import and mobile overflow. Spreadsheet checks independently verify kappa, blank versus zero, duplicates, mismatched versions, dataset exclusion, scoring and timing medians/ranges. Native Excel opens the real workbook, tracker and synthetic fixture/CSV and confirms recalculation. Normal CSV opening preserves quoted multiline text; use File Open instead of the legacy OpenText route.

Both DOCX guides were opened in Microsoft Word and rendered: seven pages each. All pages were reviewed, including a pagination repair. The protocol is one rendered page. Workbook previews were reviewed and the trial table uses grayscale styling, frozen headers and filters.

## 4 File locations

The project directory is this repository root.

- Offline application: [index.html](01_Application/index.html)
- Test suite: [tests.html](02_Tests/tests.html)
- Trial log: [PSS4_Offline_Trial_Log.xlsx](03_Baseline/PSS4_Offline_Trial_Log.xlsx)
- One-page protocol: [PSS4_One_Page_Baseline_Protocol.pdf](03_Baseline/PSS4_One_Page_Baseline_Protocol.pdf)
- Updated original tracker: [Kloster_Liu_CAP5627_Project1_TaskList_Updated.xlsx](04_Project_Tracker/Kloster_Liu_CAP5627_Project1_TaskList_Updated.xlsx)
- Valentina handoff: [Technical_Handoff_for_Valentina.docx](05_Valentina_Handoff/Technical_Handoff_for_Valentina.docx)
- Screenshots: [README.md](05_Valentina_Handoff/Screenshots/README.md)
- Jai guide: [Jai_Implementation_Explanation.docx](06_Jai_Guide/Jai_Implementation_Explanation.docx)
- Run instructions: [README.md](README.md)

## 5 Baseline status

The collection infrastructure is ready; genuine pilot data is absent and the real trial sheet is empty. Run 1–2 actual team dry runs first, obtain voluntary participation, then collect classmates' paired A/B answers using trial type fallback. The primary calculation compares first automatic categories with paired raw closed-ended categories; report eligible count, matches, percentage, coverage, kappa when defined, clarification/fallback rates and completed-time summaries. Keep clarified automatic agreement separate. Retain every failure with exclusion reasons.

## 6 Classroom demonstration

Open index.html, enter TESTDEMO, select AB and Synthetic software test, then Start assigned condition. Complete A with any choices. In B type Sometimes on item 1; It depends then Maybe on item 2 to show clarification and fixed-choice fallback; leave item 3 empty twice; type Fairly often on item 4. Open Researcher tools, expand Developer mapping check and check Almost never to show category 1. Export CSV and backup JSON. These demonstrations are synthetic. Follow the protocol with anonymous P codes and Offline fallback baseline for actual collection.

## 7 Valentina handoff

Give Valentina the whole project folder or ZIP so relative app/test links remain usable. Her primary materials are Technical_Handoff_for_Valentina.docx, Technical_Evidence.csv, all 13 Screenshots PNGs and their index, the updated tracker, protocol and trial workbook. The handoff includes the original research question, variables, hypotheses, architecture, algorithm, research/theory attribution, social controls, exact test evidence, a blank genuine-results table and presentation requirements. The Jai guide provides operation and rehearsal support. No PowerPoint or assignment presentation PDF was created.

## 8 Remaining work before October 26

1. Perform human team dry runs and collect a few actual classmates' fallback trials with consent and assigned order.
2. Enter the genuine data, inspect exclusions and compute descriptive baseline results.
3. Confirm actual work hours and human presentation progress in the tracker.
4. Valentina assembles the presentation; both members review and rehearse. Include one genuine screenshot/demo of no more than 30 seconds, real baseline results and the November 9 completion plan.
5. Review official-template compatibility and ask the instructor about the 20-point versus 40-point display discrepancy if needed.
6. By October 26 at 11:59 PM Eastern submit p2-2.1-kloster-liu.pdf, updated tracker and baseline log. No submission or professor message has been sent.

## 9 Professor questions

- Is this eEVA integrated? No; it is the authorized offline fallback described in the supplied instructions.
- What is the mapper? A transparent deterministic English frequency-phrase heuristic, with conservative clarification rules.
- Does manual fallback improve automatic agreement? No; manual selections are excluded and reported separately.
- What is actually measured? Paired raw-category agreement, time and clarification/fallback; SUS remains for later evaluation.
- Are the pilot results available? No genuine data was supplied or collected; software fixtures are labeled synthetic.
- Why reverse Q2/Q3? They describe positive experiences; reverse only for the total stress score.
- Why AB/BA? To distribute order effects while each person serves as their own comparison.
- What did each member do? Historical ownership remains unchanged; Jai coordinates current technical work and Valentina creates the presentation. Actual hours remain unconfirmed.

The learning guide contains 18 realistic questions and answers tied to the actual implementation.

## 10 Honest limitations

Only Edge was executed here; Chrome is an intended compatible browser, without a direct test in this run. File-URL local storage varies by browser policy. The log has capacity for 200 item rows; extending it requires extending formulas/validation and reverification. The official trial-log template was not available, so the workbook is explicitly a replacement. No genuine participant responses, consent, completion times, SUS scores or actual hours were fabricated. The professor's authorization and literature numerical findings are attributed to the supplied instructions/proposal summary, without independent email or paper verification. The offline interface has no avatar, voice, expression or gesture. Clinical validity, broad equivalence and final evaluation completion are not established.
