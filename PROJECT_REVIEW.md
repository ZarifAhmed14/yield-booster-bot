# AluSathi review — 5 September 2026

## Scope and evidence

Reviewed the active React routes and scan flows, weather/cache helpers, private records, account proxy, reminder worker and SQL policies, inference loaders, backend upload validation, dependency audit and competition documentation. This is a source and software-behavior review, not proof that every defect is absent. Field model accuracy testing remains deferred until real harvest data arrives.

Verification: production build and TypeScript passed; ESLint reported no errors and nine existing Fast Refresh warnings; 13 Python safety/policy tests passed; Playwright regression checks passed at 390px and 1440px; guest and simulated authenticated history visibility passed at both widths. npm audit after compatible dependency fixes reported zero known vulnerabilities. Auth UI tests use mocked sessions; live multi-account authorization and actual push delivery were not revalidated here.

## Fixed

- Repeated analysis could count the same accepted photo more than once and overrun the three-photo flow. Both action guards and disabled controls now require advancing to the next step.
- Selecting the same file again failed to trigger a change event. Both image pickers clear their native value after selection.
- Slow weather responses could overwrite the newly selected district. Superseded responses are now ignored, and previous weather is cleared while loading.
- Missing forecast minimum temperatures became zero and generated false cold alerts. Missing values remain unknown.
- Cached weather alerts could appear as current warnings. Cached readings stay labelled and no longer produce the fresh warning panel.
- Weather-cache write failures could discard an otherwise successful forecast. Cache storage is now optional.
- A fabricated soil-moisture value was derived from air humidity. Removed it from the weather result.
- Uncertain or incompatible history checks could be labelled improving/worsening. They now show an uncertain comparison; rechecking restores the original district.
- Leaf and tuber model download failures were permanently cached for the page session. Failed sessions now reset so a later attempt can retry.
- Scan and health requests had no timeout. Added bounded waits.
- Offline queue writes/deletions reported success before IndexedDB transaction completion. They now wait for commit and close connections on errors.
- Offline queue storage failures could leave synchronization stuck or reject without handling. Queue cleanup now always releases the sync guard.
- The severity tool received the final whole-plant photo. It now retains the first accepted leaf image, with object URLs released when no longer needed.
- Changing the local bigha conversion left an old yield result visible. That result now clears.
- Backend loaded the same model at import and again at startup. Removed the duplicate startup load.
- Removed unused legacy prediction and duplicate health request functions; reused the photo-reset function.
- Updated competition documents that still advertised a five-location workflow.
- Updated vulnerable transitive dependencies without forcing major upgrades.

## Remaining gaps and priorities

1. The leaf and tuber models have different evidence and capabilities. The About panel focuses on the leaf model; a future compact model-status panel should distinguish them. Current tuber inference is binary only. Automated counting, market grading and disease subtype identification are not provided by that model.
2. Yield records can be saved, but there is no useful season-level yield-history view. Severity is manual tracing; disease spread is a weather rule. These should remain described accurately in pitches.
3. Offline queued scans are stored as guest single-photo records. The next queue revision should preserve account, field and three-photo grouping, with a visible retry/delete list. Do not claim full account-aware offline synchronization yet.
4. Several old fertilizer/crop components and their translation dictionary remain unmounted. They do not affect the active runtime. Archive/remove that legacy tree together after confirming no intended feature depends on it; avoid a large cosmetic rewrite of working components.
5. The initial PWA cache is approximately 28.5 MiB, including both models and WASM. Offer an explicit offline download with size/progress and a clear ready indicator for farmers on limited data.
6. The manual severity drawing interaction needs an alternative for users who cannot trace accurately. Bangla text-to-speech also depends on device voice availability.
7. Account recovery, multi-device push delivery, record synchronization races and live RLS behavior deserve a dedicated integration pass before public transactions. Source policies restrict ownership, but this review did not prove live deployment matches them.

## Recommended competition direction

Build one complete sale journey: identify a potato lot, compare actual buyer offers, share transport, agree weight and deductions, and record payment. Keep the farmer home screen to three choices: Check crop, Sell potatoes, My records.

| Priority | Addition | Distinct value | Real dependency |
| --- | --- | --- | --- |
| 1 | Net take-home offer comparison | Compare district buyers after transport, sacks, loading and deductions | Timestamped buyer offers and transport quotes; retail prices are not farm-gate bids |
| 2 | Group sale and shared truck | Combine small farmers' lots into a buyer's order and share delivery costs | Farmer consent, compatible lots, buyer confirmation and transporter participation |
| 3 | Agreed sale receipt | Record agreed kg, packaging tare, grade criteria, deductions, payment deadline and both parties' confirmation | Human verification and a dispute contact; software alone cannot guarantee payment |
| 4 | Speak-to-list with read-back | Farmer describes location, quantity and availability; app reads the draft back before publication | Bangla speech support and explicit confirmation of every number |
| 5 | Store-or-sell break-even tool | Show the future price needed to cover storage and expected losses | Actual storage quotes and user-adjustable assumptions; no guaranteed future price |
| 6 | Farmer-controlled helper access | Trusted family member assists with listings without receiving account credentials | Revocable, limited access and farmer confirmation of sale terms |

A lot passport can initially contain farmer-entered details and sample photos. Do not certify defect percentage or market grade using the current binary model. Add verified grading later when labelled samples and buyer grading rules are available.

Demonstrate one small district-to-district pilot with real buyers and transport quotes before expanding nationally. Measure net taka/kg received, transport cost/kg, time to confirmed buyer and on-time payment. These outcomes can support the competition story before harvest-season disease validation.

Existing services already offer agricultural listings and market-report links: https://sadai.gov.bd/ . AluSathi's distinguishing evidence should be completed, transparent sales and simpler farmer participation. No feature set can guarantee a prize.
