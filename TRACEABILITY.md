# Feature 1 workbook traceability

This checklist covers only Primary Sheldian Analysis. The reference workbooks remain local and ignored by Git.

| Report section/order | Source workbook and location | Implementation | Test/verification |
|---|---|---|---|
| Date characteristics: Personality/Mulank, Destiny/Bhagyank and date qualities | `Numerology Master.xlsx`, `Sheet1`, `A1:B114` | `personality`, `destiny`, `dateQualities` in `server/features/primary.js` | 17/04/2000 regression verifies 8 and 5 |
| P-D analysis | `Numerology Master.xlsx`, `Sheet1`, `A152:B510` | Server-side P-D section with explicit source-boundary wording where no exact row is selected | Section-order regression |
| Name characteristics and Paytha values | `Numerology Master.xlsx`, `Sheet1`, `B126:B147` and `B143:J147` | `nameCompound`, `nameRoot`, `letterValues` | Name compound/root regression |
| Soul characteristics | `Numerology Master.xlsx`, `Sheet1`, `B152:B186` | Vowel-only soul compound/root and source interpretation map | Report-section regression |
| Lo Shu grid | `Numerology Master.xlsx`, `Sheet1`, `C116:E124` | `gridEntries` and `gridItems`; exact 4-9-2 / 3-5-7 / 8-1-6 order | Exact 17/04/2000 grid regression |
| Birthday 1–10 rule | `Numerology Master.xlsx`, `Sheet1`, `C116:E124`; explicit task requirement | Mulank included, Bhagyank omitted as an extra entry for days 1–10 | Days 1, 10 and 11 regression |
| Planes and cross-connections | `Numerology Master.xlsx`, `Sheet1`, `A513:B536` | All eight defined patterns, present and missing interpretations | Definition and missing-pattern regression |
| Rajyog and Spiritual analysis | `Numerology Master.xlsx`, `Sheet1`, `A525:B536` | Dedicated report sections based on 456 and 357 | Section-order regression |
| Education and profession | `Numerology Master.xlsx`, `Sheet1`, `A539:B568` | Profession guidance keyed by Destiny number; education boundary retained when no exact pattern exists | Server report inspection |
| Health references | `Numerology Master.xlsx`, `Sheet1`, `A800:B809` and pattern notes | Non-diagnostic health-reference section | Server report inspection |
| Friendly numbers and source boundaries for enemy/neutral values | `Numerology Master.xlsx`, `Sheet1`, `A574:F584` | Source-defined friendship map; enemy/neutral are not inferred when absent | Server report inspection |
| Days and other lucky-reference structure | `Numerology Master.xlsx`, `Sheet1`, `A587:L596`; `Chaitrali Mirashi.xlsx`, `Purchase`, `A32:B40` | Day mapping is source-backed; client-specific colour/direction/deity/fragrance values are not copied | Server report inspection |
| Event ages/years and personal year | `Numerology Master.xlsx`, `Sheet1`, `A622:B798` | Formula and yearly interpretation sections remain server-side; no client result is fabricated | Section-order regression |
| Remedies at report end | `Remedy Master.xlsx`, `Sheet1`, number blocks beginning at `A7`, `A27`, `A52`, `A73`, `A94`, `A116`, `A137`, `A154`, `A179` | `remedies` map selected from missing grid numbers; final report section | Remedy placement regression |

## Audited ambiguities

- The example workbook contains client-specific values for colours, directions, deities, fragrances and some health/event output. Those values are presentation references, not reusable rules, so the generic report names the boundary instead of copying personal results.
- The primary workbook contains large P-D and event lookup tables with irregular merged layout and incomplete rows. The report does not invent a value when an exact source row cannot be selected from the supplied input.
- No general enemy/neutral mapping was established in the audited primary source. Only the source-defined friendship table is used.
- Birth time is recorded and validated in IST, but the audited primary workbook does not define a time-dependent primary formula.
