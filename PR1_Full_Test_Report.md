# PR1 Full Test Report

## Pull Request

- Repository: https://github.com/JaiKaushik03/cap5627-pss4-baseline-22-oct
- PR #1: [Align pilot with professor-approved offline fallback](https://github.com/JaiKaushik03/cap5627-pss4-baseline-22-oct/pull/1)
- Author: valenkloster
- Source branch: `codex/professor-fallback-flow`; base: `main`.
- Reviewed original head: `805dd4e7dcbb6b3cee1ee42512091c3247943ddf`.
- Verified fix commit: `1e399ea10bc5f88bd51eff70964224463e5e2c04`; implementation `PSS4-offline-1.2.1`.
- PR is open and unmerged. Main remains `ae89ccfd7922b424fd33681e385eb6e7856c8666`.
- No PR comments, CI statuses or Actions runs were present when inspected. The sole original PR commit and all five changed files were reviewed.

## Changes Reviewed

Valentina changed `app.js`, `core.js`, `index.html`, added `02_Tests/deferred.cjs`, and added `FALLBACK_WORKFLOW.md`. The PR fixes collection order to BA, collects all four original texts without mapping, then presents the closed-ended portion on the next screen. It adds voluntary-participation confirmation, researcher manual coding, a two-coder gate for deferred mapping, manual agreement, and a proposed nine-column v2 left-block export. The exact four PSS-4 questions and five category names/order remain intact. The mapper rules are preserved, without representing them as a trained AI model.

The original 80 tests and Valentina’s deferred scenario passed before corrections. Additional review checks exposed gaps not covered by those tests. The corrections and new capabilities below are limited to this offline fallback and its verification. Valentina’s protocol, official v2 workbook, task updates and presentation were not overwritten or recreated.

## Automated Tests

| Verification group | Executed | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: | ---: |
| Original unit checks | 80 | 80 | 0 | 0 |
| Added targeted regression checks | 33 | 33 | 0 | 0 |
| Offline Edge browser checks | 169 | 169 | 0 | 0 |
| Independent Python CSV and calculation checks | 79 | 79 | 0 | 0 |
| Native Microsoft Excel import checks | 37 | 37 | 0 | 0 |
| Total recorded checks | 398 | 398 | 0 | 0 |

The original deferred scenario script also passes. It is reported as one legacy script, without inventing a count for its several assertions. The same original 80 unit cases were additionally executed inside Edge; they are not counted as another 80 unique cases in the table.

Actual execution used bundled Node 24.19.0, installed Edge 155.0.4283.62, and Excel 16.0. Tests used an isolated headless browser context, file URLs and `offline:true`; no personal desktop takeover, email access, account login or manual user testing was needed.

Commands executed from the task workspace used the bundled Node executable in place of `node`:

```text
node work/collect_pr1_results.cjs
node work/pr1-repo/02_Tests/pr1_regressions.cjs outputs/PR1_Review_For_Valentina/Verification/regression_results.json
node work/pr1-repo/02_Tests/deferred.cjs
node work/pr1-repo/02_Tests/browser_verify.cjs
node work/pr1-repo/02_Tests/manual_analysis.cjs outputs/PR1_Review_For_Valentina/Test_Exports/SYNTHETIC_manual_comparison_before_coding.csv
node work/pr1-repo/02_Tests/manual_analysis.cjs outputs/PR1_Review_For_Valentina/Test_Exports/SYNTHETIC_manual_comparison_after_coding.csv
python work/audit_pr1_exports.py
powershell work/pr1_excel_verify.ps1
git -C work/pr1-repo diff --check
```

For the browser run, `PSS_TEST_OUTPUT` selected this handoff directory and `NODE_PATH` selected the installed Playwright dependency. Repository-relative reruns are `node 02_Tests/pr1_regressions.cjs`, `node 02_Tests/deferred.cjs`, and `node 02_Tests/browser_verify.cjs`; the browser script requires Playwright and Edge. Core unit tests require no npm packages.

## Browser Tests

Five complete synthetic sessions were run through actual visible controls. TEST-P01 covers normal mapping and coding gates; TEST-P02 covers ambiguous text; TEST-P03 covers a two-empty-answer retry and unanswered outcome; TEST-P04 covers commas, quotes, apostrophes, newlines, Unicode, whitespace and formula-leading text; TEST-P05 covers retained cohort rows, another ID and a deliberate mapping disagreement. TEST-P06 is intentionally interrupted to test recovery; TEST-P07 is a mobile-layout check without a completed exported session.

The run verifies exact question text and order, unselected fixed options, blocked empty A selections, consent confirmation, absent name/email/phone/student-ID fields, eight distinct item rows per complete session, timestamps, numeric durations, hidden researcher tools during collection, manual-code gating/locking, successful downloads, reset, backup restoration and duplicate-import prevention. No external HTTP requests or page errors occurred. Screenshots 01 and 02 show the actual free-text and separate closed-ended screens; screenshot 03 shows synthetic researcher analysis.

## Questionnaire Verification

PASS: all four free-text items occur before any closed-ended controls are created. PASS: a separate transition screen precedes the closed-ended screens. These are separate visible pages/screens within one offline HTML application; no second HTML download is required. PASS: all four exact PSS-4 items and original 0–4 choices work. PASS: anonymous codes, fixed BA metadata, condition start/end timestamps, item milliseconds and condition milliseconds are exported.

The fixed BA order applies to this fallback. It does not claim counterbalancing or eEVA integration. The original final-study design remains background context.

## Mapper Verification

The preserved deterministic phrase mapper was checked on exact categories, synonyms, capitalization, whitespace, punctuation, uncertainty, negation, conflicting frequencies and missing input. Seventeen readable example outputs are in `Verification/mapping_results.json`, in addition to the original and regression assertions.

The approved participant collection deliberately performs no automatic categorization, frequency clarification or structured fallback. An ambiguous answer is collected unchanged for later manual coding and offline mapping. If the later mapper cannot categorize it, its category remains blank and coverage decreases. The legacy interactive state machine still passes tests for one clarification, bounded structured fallback and exclusion of manual selections from automatic success. It is not silently reintroduced into the free-text-first participant pages.

## CSV Export Verification

There were 16 actual browser downloads: 14 CSVs and two JSON backups. Browser-generated original filenames are recorded beside the saved synthetic filenames in `Verification/browser_results.json`. Raw downloads use `PSS4_trials_<UTC timestamp>.csv`; the adapter uses `PSS4_official_v2_left_block.csv`; backups use `PSS4_backup_<timestamp>.json`.

| Actual saved CSV | Data rows | Columns |
| --- | ---: | ---: |
| SYNTHETIC_ambiguous_paired_v2.csv | 4 | 9 |
| SYNTHETIC_ambiguous_raw.csv | 8 | 32 |
| SYNTHETIC_blind_manual_Jai.csv | 4 | 6 |
| SYNTHETIC_blind_manual_Valentina.csv | 4 | 6 |
| SYNTHETIC_edge_and_repeat_paired_v2.csv | 8 | 9 |
| SYNTHETIC_edge_and_repeat_raw.csv | 16 | 32 |
| SYNTHETIC_manual_comparison_after_coding.csv | 4 | 16 |
| SYNTHETIC_manual_comparison_before_coding.csv | 4 | 16 |
| SYNTHETIC_missing_paired_v2.csv | 4 | 9 |
| SYNTHETIC_missing_raw.csv | 8 | 32 |
| SYNTHETIC_normal_paired_v2.csv | 4 | 9 |
| SYNTHETIC_normal_pending.csv | 8 | 32 |
| SYNTHETIC_normal_raw.csv | 8 | 32 |
| SYNTHETIC_recovery_raw.csv | 18 | 32 |

Raw data has 32 fields, including participant/session/trial identity, version, condition and fixed order, item number, original and clarified text, closed/initial/automatic/final categories, event flags, timing/start/end, notes/history, collection mode, mapping status and both manual columns. The audit checks these actual exported values rather than only inspecting export code.

All files parse without shifted columns and open normally in native Excel. Excel preserves commas, internal quotes, embedded newlines, curly apostrophes, accented characters, emoji and category zero. Formula-leading text receives a protective apostrophe in CSV and is not executed as an Excel formula. JSON retains the exact original text. Blank human columns remain blank before synthetic coding.

Every test record is labeled **SYNTHETIC SOFTWARE TEST DATA — NOT ACTUAL PARTICIPANT RESULTS**. All researcher classifications entered by browser automation are also synthetic. They do not represent independent human coding by Jai or Valentina. No actual participant result is included.

## Agreement and Manual Coding

Independent Python calculation from the actual browser backup agrees with JavaScript eligible-pair count, percent agreement, unweighted Cohen’s kappa, completed-run counts, medians and ranges. These are synthetic verification values, not study findings. Timing counts each completed condition once. Missing/duplicate pairs and manual fallback cannot enter successful automatic agreement.

Blind coding exports contain original text and the selected coder’s column, excluding closed-ended answers, automatic results and the other coder. The combined comparison export supports Jai versus Valentina, each coder versus closed-ended, automatic versus closed-ended, and automatic versus each coder. `02_Tests/manual_analysis.cjs` compares independently entered categories without filling them or running the mapper. Blank, Unclear and invalid entries are handled separately; invalid categories are rejected and duplicate comparison keys are excluded. `Manual_Coding_Template.csv` contains headers only, with no invented real responses or codes.

## Bugs and Corrections

| Confirmed issue | Correction |
| --- | --- |
| Repeated empty responses blocked collection indefinitely | Deferred collection now gives one neutral retry, then records unanswered and advances. No response choices are exposed. |
| Deferred text was trimmed before storage | Store the original text, including whitespace, Unicode, punctuation and line breaks. Normalization is used only for categorization. |
| Mapper could run on B-only or incomplete sessions | Require all four B and all four A item rows with completion metadata, plus both researchers’ valid codes for answered B items. Incomplete sessions remain logged. |
| Manual agreement could count duplicate B rows or match a different participant sharing a session ID | Use one unique A/B pair keyed by version, session, participant and question. Ambiguous or missing references stay excluded. |
| Paired export selected the first A reference without full identity/duplicate checks | Reuse the same unique pairing logic. Leave reference/agreement blank for invalid pairs, with an explanatory note. |
| New manual/mapping metadata was not checked on backup import | Validate researcher categories, collection mode, mapping status and contradictory pending automatic results. |
| Pending mapper coverage appeared as zero | Expose pending item count and keep automatic coverage unavailable until pending classification is resolved. |
| Research tools were reachable from participant setup and the old browser test expected AB/BA controls | Separate the researcher workspace and hide it during participant collection. Replace the obsolete UI driver with fixed-BA scenarios. |
| Historical README and old replacement-workbook instructions conflicted with the current PR | Add a prominent current-version notice. Preserve original documents, identify the 32-column versus 28-column mismatch and defer official v2 workbook ownership to Valentina. |

Required additions beyond defect fixes are the blind coding exports, full manual-comparison family, CLI comparison script, provisional adapter tests, new regression suite and actual browser-export handoff. No unnecessary questionnaire rewrite was performed.

## Outstanding Limitations

1. The actual official v2 workbook was not included in this PR or the supplied materials. The nine-column adapter is tested, but direct official-workbook alignment/formula preservation remains unverified. Coordinate that final paste with Valentina; do not overwrite her workbook. The historical 28-column replacement workbook must not receive the new 32-column raw export.
2. The researcher workspace is not password-protected. Blind exports support independent coding, but shared-device UI access cannot enforce who the human coder is. Both real researchers must code independently before running mapping.
3. The mapper is a conservative English frequency heuristic. It is not semantically comprehensive or clinically validated. Unweighted kappa is supported; weighted kappa requires an instructor-approved weighting definition and is not claimed complete.
4. Only Edge was executed in this review. Chrome compatibility was not directly retested. Local file-URL recovery depends on browser policy; keep private JSON/CSV backups.
5. Genuine baseline responses, actual independent human coding and a partner dry run are still required. SUS and eEVA integration remain future work. No protocol, official workbook, presentation, consent record or human result was fabricated.
6. GitHub exposes no configured CI checks/Actions runs here. Passing local verification is not a CI claim. PR #1 remains unmerged, and the Desktop main checkout was not switched or overwritten.

## Final Assessment

**PASS within the verified offline software and export scope.** The corrected PR is ready for Jai and Valentina’s final review and a partner dry run. Official v2 workbook alignment and genuine human baseline work remain pending. Do not submit any of these synthetic exports as actual baseline results.
