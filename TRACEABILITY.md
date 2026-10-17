# Workbook rule traceability

The six reference workbooks remain local under `reference-workbooks/` and are ignored by Git. The feature engines intentionally do not share calculation tables.

## Feature 1 — Primary Sheldian Analysis

| Implementation | Source | Status |
|---|---|---|
| DD/MM/YYYY validation and date digit extraction | `Numerology Master.xlsx`, `Sheet1`, `A1:B62` birth-date/qualities table | Implemented |
| Root-number reduction of the date compound | Same table; the workbook presents compound and root interpretations | Implemented as a clearly named normalization step |
| A–Z repeating 1–9 name table | `Numerology Master.xlsx`, `Sheet1`, `B143:J147` Paytha Table | Implemented |
| Pytha grid from birth-date digits | `Numerology Master.xlsx`, `Sheet1`, `B116:D124` Pytha Grid | Implemented |
| Missing-number remedies | `Remedy Master.xlsx`, `Sheet1`, number blocks beginning at `A7`, `A27`, `A52`, `A73`, `A94`, `A116`, `A137`, `A154` | Implemented for documented 1–8 remedy text |
| Client-report section order and narrative presentation | `Chaitrali Mirashi.xlsx`, `Purchase`, `A1:P87` | Used for presentation only |

Unresolved: the workbook does not define how birth time changes the primary calculations, nor a complete formal “Sheldian” calculation specification. The implementation records the supplied/assumed IST time and does not invent a time-dependent formula.

## Feature 2 — Vedic Numerology Analysis

| Implementation | Source | Status |
|---|---|---|
| Excluding the century from the grid input | `Vedik Master.xlsx`, `Sheet1`, `C26:C27` | Implemented |
| Vedik grid and planet labels | `Vedik Master.xlsx`, `Sheet1`, `F28:H30`, `A7:C25` | Implemented |
| Hard/soft/neutral groups | `Vedik Master.xlsx`, `Sheet1`, `B55:B61` | Implemented |
| Known yoga lookup entries | `Vedik Master.xlsx`, `Sheet1`, yoga sections beginning `A64`, `A71`, `A76`, `A81`, `A87`, `A96`, `A100`, `A104` | Implemented only for exact documented sequences |
| Report presentation | `Rasika Lokolkar.xlsx`, `Purchase`, `A1:P62` | Used for presentation only |

Unresolved: the Vedik workbook does not establish a full time-dependent calculation or a name-number formula. The full name is validated and displayed but is not used to invent an unsupported Vedic score.

## Feature 3 — Mobile Number Recommendation

| Implementation | Source | Status |
|---|---|---|
| Pairing interpretation data boundary | `Mobile Number master1.xlsx`, `Sheet1`, `A4:B55` | Source isolated; not mixed into other features |
| Repeated-number interpretations | `Mobile Number master1.xlsx`, `Sheet1`, `A57:B68` | Source isolated |
| 10-digit recommendation generation/ranking | No rule present in the workbook | Deliberately blocked; API returns a safe error rather than fabricating candidates |

This is the only approved requirement that cannot be honestly completed from the supplied workbook alone. An operator-approved generation/ranking rule is required before the endpoint can return one primary and two alternatives.
