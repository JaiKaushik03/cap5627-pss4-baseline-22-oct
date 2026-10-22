# Jai What Codex Did

## What Valentina Changed
She made everyone answer the four text questions first. Only afterward do they see the four multiple-choice questions. She added a consent checkbox, manual coding fields, a gate before automatic mapping and an export for the trial log. This follows the revised fallback procedure.

## What I Reviewed
I read all five files in PR #1, its description, commit history and empty comment/check lists. I checked the questions, mapper, session state, manual coding, timing and exports. I worked on the CAP 5627 repository only. PropertyCare was not touched.

## What Was Tested
I ran the original 80 checks, 33 new regression checks, 169 browser checks, 79 independent CSV/calculation checks and 37 native Excel checks. All passed. The legacy deferred test script also passed. The software tests use fake IDs and fake manual codes, clearly labeled synthetic.

## What Worked
The full B-then-A sequence works offline. The original questions and choices are correct. The app records codes and times. It keeps each participant separate, preserves text, exports data, restores backups and handles interrupted sessions. No network requests or browser page errors occurred.

## What Was Broken
Empty text could trap someone on an item. Text was being trimmed. Automatic mapping could run before closed-ended collection was complete. Duplicate/manual pairing and the paired export could use the wrong reference. Pending mapping looked like zero coverage. Backup import did not validate the new coding fields. The old browser script and some inherited instructions were outdated.

## What I Fixed
One empty retry now leads to an unanswered record and the next item. Original text stays unchanged. Mapping waits for complete paired sessions and both coders. Pairing checks participant, question, session and version, excluding duplicates. Pending coverage stays blank. Imports check the new fields. Research tools are separate from participant pages. I added blind coding sheets, comparison tools and tests. Fix commit: `1e399ea`. I pushed it to PR #1’s branch and did not merge.

## How the App Works
1. A person enters an anonymous code and confirms voluntary participation.
2. They type answers to four questions.
3. They go to the next screen and choose four fixed answers.
4. Their text, choices and times stay in the browser and local recovery storage when available.
5. Jai and Valentina independently classify the original text before the computer mapper runs.
6. The mapper uses frequency phrases to assign 0–4, or leaves an unclear response unclassified.
7. The researcher downloads CSV and JSON.
8. The analysis compares raw categories and reports agreement, coverage and time.

The current fallback does not ask frequency clarifications or show structured fallback choices while collecting text. That would violate the separation we are testing. The older interactive engine is still tested for future use.

## Where the Data Is Stored
Responses are kept in browser memory and localStorage when permitted. They are not sent to a server. Export CSV and JSON after each real session and save them privately outside the public GitHub repo. CSV is convenient for Excel. JSON preserves the original text and can restore a cohort. Interrupted conditions retain notes and do not get invented completion times.

## What I Tell Professor Lisetti
- We followed fixed free-text-first order for this fallback and will disclose it.
- The text and closed-ended portions are separate visible screens.
- We use participant codes; no name, email, phone or student-ID field is required.
- Both of us must code the real text independently before automatic mapping.
- The mapper is deterministic phrase matching, not a trained AI model.
- Unclear and missing answers stay visible in the log rather than being forced into categories.
- Agreement uses raw categories; only total PSS-4 scoring reverses Q2 and Q3.
- These software exports are synthetic tests, without genuine baseline findings.
- We tested the real browser download and opened the files in Excel.
- eEVA and final usability/SUS evaluation are not complete.

## What Is Still Unfinished
PR #1 needs final human review; it has not been merged. Valentina must confirm the provisional nine-column adapter matches her actual official v2 workbook. Both team members still need to code actual participants independently. Genuine classmates’ data, a partner dry run, presentation and submission remain. Her protocol/workbook/tasks/presentation were left alone.

## What I Need To Do Tomorrow
1. Give Valentina this ZIP and let her do the partner dry run using PR #1’s corrected branch.
2. Confirm her official v2 trial log receives the intended columns.
3. Obtain voluntary participation and collect classmates’ anonymous text-first responses.
4. Both independently code real text, then run mapping and save private exports.
5. Put genuine results into the presentation and review the submission files.
