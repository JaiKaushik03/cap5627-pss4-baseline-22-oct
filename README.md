# CAP 5627 Project 2.1 offline classroom package

Version PSS4-offline-1.1.0, frozen October 21 2026. This continues the recovered implementation. The original application, tests, partial screenshots and task tracker are preserved under 07_Backups.

The offline software and collection infrastructure are verified. Human dry runs, genuine baseline responses and actual hours remain pending. eEVA integration was not verified. No presentation, professor message or university submission was created or sent.

## Public GitHub repository

This repository contains the offline application, documentation, empty trial template and clearly labeled synthetic test evidence. Real participant responses and consent records must stay in a separate private folder outside this repository. Do not commit a filled trial workbook or real CSV/JSON exports.

Valentina can edit source and Markdown files on GitHub or clone the repository for local editing. Word and Excel documents can be downloaded, edited in their applications and committed back. Collaborator access starts after the invitation is accepted.

## Start the application

1. Extract the entire ZIP if using the archive. Keep all folders together.
2. Open 01_Application/index.html directly in Chrome or Edge. No server, account, internet connection or installation is needed.
3. Use TESTDEMO and Synthetic software test for a demonstration. Use Team dry run for actual human practice, and Offline fallback baseline for counted classroom fallback trials.
4. Assign AB or BA before starting. Leave researcher tools closed while the participant answers.
5. Export CSV and JSON after every participant. Files download to the browser's selected download folder; move verified exports into your restricted local study folder. Keep names separate.
6. Local recovery is available only when browser file-URL policy permits it. The header reports availability. Recovery stores data locally in the browser profile without app-level encryption. Do not use it as the archive.

## Demonstrate the flow

Complete A with any chosen options. In B type Sometimes on item 1. On item 2 type It depends, then Maybe at the neutral clarification prompt; choose one of the five fallback options. Leave item 3 empty twice, then type Fairly often on item 4. After completion, open Researcher tools and its Developer mapping check. Almost never produces category 1. Export CSV and backup JSON. Demonstration rows are synthetic, without being participant findings.

For a human dry run follow the one-page protocol. Consent has not been obtained by the software tests. Participants may stop; New participant flags an unfinished current item and retains earlier rows. An interrupted timed series needs a documented restart under a new code, not an invented completion time.

## Use the trial workbook

PSS4_Offline_Trial_Log.xlsx is a replacement pending official-template verification. Open the CSV normally in Excel using File Open. Copy the 28 data columns without the header and paste VALUES into Trial Rows A2:AB201. Keep columns unchanged, and keep missing categories blank because zero means Never. Capacity is 200 item rows, or 25 complete paired sessions. The table has filters, frozen identifiers/headers and validation. To exceed capacity, extend all formulas and validations together and reverify; do not paste outside the supported area.

On Summary choose fallback for actual classroom baseline and PSS4-offline-1.1.0 as version. Dry runs and synthetic examples are excluded by that selection. Primary agreement uses the initial automatic response; clarified automatic agreement is secondary. Manual fallback and missing responses stay in the log but are excluded from automatic agreement. Calculations makes pairing/exclusions visible. Participant Results shows per-session agreement and PSS-4 totals. Record any additional exclusion explanation in error_notes.

Required trial-log field equivalents: trial_id is Trial ID; date/time are UTC date/time; version, participant_id, condition and question identify the observation; the paired closed_category (Calculations column E) is the expected format reference; initial_auto_category is the primary observed outcome and auto_category is the clarified observed outcome. response_ms/condition_ms are timing, while notes/error_notes document interruptions and exclusions. The closed format is not clinical ground truth.

## Tests and reproducibility

Open 02_Tests/tests.html to run all 80 unit tests offline in the browser. With Node installed, run node 02_Tests/run_tests.cjs from the project folder. No packages are needed for these unit tests. browser_verify.cjs requires Playwright and installed Edge; it uses an isolated browser context with networking disabled. It never supplies human responses.

The supplied JSON files report the actual executed checks. SYNTHETIC_Formula_Verification.xlsx, its JSON fixture and synthetic CSVs are testing artifacts only; they are outside the real workbook. Spreadsheet and native Excel reports verify expected results independently. CSV ordinary opening in Excel preserved commas, internal quotes and multiline text; a legacy OpenText route split a multiline field, so use normal File Open as verified here.

The two requested guides were opened in Microsoft Word and rendered to seven-page PDFs for visual review. The one-page protocol was rendered and checked. LibreOffice was unavailable, so native Word supplied rendering. Browser images are genuine screenshots; spreadsheet images are genuine workbook renders. No screenshot contains actual participant responses.

## Folder guide

01_Application is the frozen offline app. 02_Tests contains test source, evidence and clearly labeled synthetic fixtures. 03_Baseline has the real empty replacement log, one-page protocol and version/hash record. 04_Project_Tracker contains the updated original tracker. 05_Valentina_Handoff contains the technical Word guide, evidence table and screenshot index. 06_Jai_Guide contains the code explanation and professor questions. 07_Backups preserves recovered originals.

## Before October 26

Run 1–2 human team dry runs, collect a few actual classmates' paired trials, calculate genuine descriptive results, confirm actual hours and update the tracker. Valentina prepares the numbered presentation with at least 15-point text. Both members review and rehearse. By October 26 at 11:59 PM Eastern submit p2-2.1-kloster-liu.pdf, the tracker and the real baseline log to Canvas. Full baseline is due November 9; later evaluation, SUS and eEVA work remain.
