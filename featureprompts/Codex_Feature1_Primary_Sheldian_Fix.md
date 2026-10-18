# Codex Task: Fix Feature 1 — Primary Sheldian Numerology Analysis

## Objective

Audit and correct **Feature 1 only** in the existing `SanjeevZnumerology` project. The generated report must faithfully implement the applicable logic from `Numerology Master.xlsx` and `Remedy Master.xlsx`, and follow the section order/content structure of `Chaitrali Mirashi.xlsx`.

Do not treat “the report renders” as proof of correctness. Verify workbook traceability, calculations, section coverage, automated tests, and browser behavior.

## 1. Start with an audit

1. Inspect the complete existing project before changing files.
2. Inspect these three workbooks thoroughly:
   - `reference-workbooks/Numerology Master.xlsx`
   - `reference-workbooks/Remedy Master.xlsx`
   - `reference-workbooks/Chaitrali Mirashi.xlsx`
3. Inspect every relevant worksheet, populated cell, formula, note, merged cell, and layout detail. Do not rely only on workbook filenames or a few visible rows.
4. Create a section-by-section implementation checklist mapping each applicable report section to:
   - the source workbook, worksheet, and cell/range where the rule or reference appears;
   - the calculation or interpretation module;
   - the report-rendering section;
   - at least one test where practical.
5. Identify existing incorrect, missing, hardcoded, or client-side calculations before modifying them.

## 2. Scope restrictions

- Work on **Feature 1: Primary Sheldian Analysis only**.
- Preserve the navigation and existing presence of:
  - Feature 1: Primary Sheldian Analysis
  - Feature 2: Vedic Numerology Analysis
  - Feature 3: Mobile Number Recommendation
- Do not implement, repair, refactor, or change Feature 2 or Feature 3 in this task.
- Do not copy Chaitrali Mirashi’s personal results into the app or tests. Her workbook is a report-format/reference example, not a source of reusable client results.
- Do not delete, rename, modify, or commit the reference workbooks.
- Do not commit, push, or deploy anything.
- Keep the current approved UI direction unless a change is necessary to fix a functional or accessibility defect.

## 3. Required source-of-truth behavior

- Use `Numerology Master.xlsx` for Primary Sheldian calculation rules and interpretations.
- Use `Remedy Master.xlsx` for remedy rules and remedy content.
- Use `Chaitrali Mirashi.xlsx` to identify the full report structure, section order, headings, tables, and presentation details.
- Follow workbook rules rather than inventing conventional numerology rules from memory or the internet.
- Do not fabricate interpretations, remedies, missing values, or expected test results.
- If a rule is ambiguous, contradictory, or absent from the workbooks, document the exact ambiguity and source location. Do not silently guess.
- Keep all confidential calculation logic and workbook-derived rules on the server. Do not expose the rules or intermediate logic in browser JavaScript.
- Keep any client-specific results transient unless the existing app has explicit approved persistence. Do not introduce new storage of personal reports.

## 4. Full report coverage

Build a checklist from the example workbook and implement **every applicable populated report section**. The following categories are known to be relevant; use the actual workbook to confirm exact names, order, details, and any additional sections:

- Name characteristics and name-related analysis
- Soul characteristics
- Lo Shu grid
- Planes and their interpretations
- Cross-connections and their interpretations
- Rajyog analysis
- Spiritual analysis
- Education and profession guidance
- Friendly, enemy, and neutral numbers
- Lucky or relevant colours, days, directions, deities, and fragrances
- Paytha and any related grid sections
- Event ages/years and name-related event calculations
- Personal-year analysis and yearly interpretations
- Suggestions and other applicable recommendations
- Health-related references, if included in the workbook
- Remedies, placed at the end as shown in the reference report
- Any other applicable populated section, table, note, or calculation found in `Chaitrali Mirashi.xlsx`

Do not assume this list is exhaustive. The workbook-driven checklist is the acceptance checklist.

## 5. Lo Shu grid requirements

Use the exact grid layout below:

| Position | Position | Position |
|---|---|---|
| 4 | 9 | 2 |
| 3 | 5 | 7 |
| 8 | 1 | 6 |

Render the actual grid as:

```text
4 | 9 | 2
3 | 5 | 7
8 | 1 | 6
```

Empty positions must remain visibly empty. Use the source workbook’s rules for repeated digits, digit frequency, and any other grid behavior.

### Required calculation test

For birthdate **17/04/2000**:

- Personality/Mulank: 1 + 7 = **8**
- Destiny/Bhagyank: 1 + 7 + 0 + 4 + 2 + 0 + 0 + 0 = 14, reduced to **5**
- Do not enter zero into the grid.
- Apply the source workbook’s digit-frequency rules to the birthdate digits, Personality/Mulank, and Destiny/Bhagyank.
- Expected grid:

```text
4 | _ | 2
_ | 5 | 7
8 | 1 | _
```

This exact expected grid is a required regression test. If workbook rules appear to conflict with this explicitly required result, document the conflict instead of silently changing the expected result.

### Birthday 1–10 special rule

For birthdays from day **1 through day 10 inclusive**, include the Personality/Mulank number, but do **not** add Destiny/Bhagyank as an additional grid entry. Implement this boundary rule exactly and test at least days 1, 10, and 11. Confirm how the rule interacts with repeated digits using the workbooks.

## 6. Planes, cross-connections, and number patterns

- Extract and implement all plane definitions, number combinations, missing-plane behavior, and interpretations from the workbook.
- Do not implement only the examples below and ignore other defined patterns.
- Ensure the report covers the applicable combinations, including these known examples where supported by the workbook:
  - 438: Thought Plane
  - 951: Will Power Plane
  - 276: Action Plane
  - 492: Intelligence Plane
  - 357: Spiritual Plane
  - 816: Practical/Business Plane
  - 456: Golden Plane/Rajyog
  - 258: Silver Plane
- Check exact labels and meanings against the source workbook. The examples are test targets, not permission to invent their interpretations.
- Test present, missing, and repeated digits, including cases where the same number appears more than once.

## 7. Birth-time handling

- If the birth time is unknown, require the user to explicitly choose **05:00 IST** or **17:00 IST** as the assumed time.
- Clearly label the selected time as assumed in the generated report.
- Do not silently default to either time.
- Validate the date, time, and required inputs on the server.

## 8. Backend, privacy, and security

Respect the existing architecture and project constraints:

- Single-user/private app with no public registration.
- One Vercel project and one deployment; no Render or separate backend deployment.
- Use Node.js Vercel Serverless Functions for protected calculations if this is the established architecture.
- Keep login and protected API authentication server-side.
- Use environment variables for credentials and secrets. Keep `.env.example`, but never expose real secrets.
- Use secure HttpOnly cookies, appropriate SameSite settings, session expiry, and logout behavior consistent with the existing implementation.
- Apply input validation, safe output rendering, security headers, origin/CSRF protections, and practical throttling where appropriate.
- Do not log passwords, secrets, or full personal reports.
- Do not add unnecessary dependencies or introduce a database solely for this feature.
- Do not move workbook-derived rules into client-side JavaScript.
- Inspect `.gitignore` and ensure it excludes `reference-workbooks/`, all six reference workbooks including renamed/copied versions, `.env` and secrets, `node_modules`, and generated artifacts, while retaining `.env.example`. Do not delete the workbooks.

If the current architecture differs from these expectations, report the discrepancy and make only the smallest safe change needed for Feature 1. Do not perform a broad rewrite.

## 9. UI requirements

Preserve the approved visual direction:

- Midnight background: `#090b12`
- Gold/amber accents: `#e8bd70`, `#d9ad63`, `#c69a50`
- Warm ivory headline text: `#f4dfb6`
- Cinzel and Noto Sans Devanagari typography where already configured
- Subtle radial glow, sacred geometry, floating Devanagari numbers, and symbols such as `ॐ` and `श्री`, without distracting from report readability
- Keep the existing sidebar order and make Feature 1 the default feature after login.
- Ensure report tables, the Lo Shu grid, headings, and long sections remain readable on mobile and desktop.
- Use accessible labels and keyboard-operable controls. Do not rely on colour alone to convey meaning.

Do not redesign the whole application.

## 10. Tests and verification

Create or update automated tests for all critical Feature 1 logic. At minimum, cover:

1. The exact Lo Shu grid for 17/04/2000.
2. Personality/Mulank and Destiny/Bhagyank calculations.
3. The birthday 1–10 special rule, including days 1, 10, and 11.
4. Zero handling and repeated-digit frequency according to the workbook.
5. Each defined plane and cross-connection, including absent/missing numbers.
6. All report sections and their order against the workbook-derived checklist.
7. Remedy selection and placement at the end of the report.
8. Unknown birth-time selection and explicit “assumed” labeling.
9. Invalid inputs and server-side validation.
10. Safe rendering of user-supplied names and other text.
11. Protection against unauthenticated requests to protected calculation endpoints.
12. Regression checks proving Features 2 and 3 were not modified.

Use synthetic test identities and dates. Never use Chaitrali Mirashi’s personal details as test inputs.

For every workbook-derived rule, retain traceability to the source workbook, worksheet, and cell/range where practical. Do not make up expected outputs. If an expected value cannot be established from the workbooks or the explicit requirements above, record it as unresolved instead of fabricating a test.

Run the available test suite, lint/type checks if configured, and production build. Fix failures caused by your changes. If browser testing tools are available, generate a report using synthetic data and inspect the rendered page at desktop and mobile widths. Do not claim a check passed unless it was actually run.

## 11. Implementation approach

1. Audit the project and workbooks.
2. Produce the section/rule traceability checklist.
3. Identify defects and propose the smallest implementation plan.
4. Implement Feature 1 only.
5. Add or update automated tests.
6. Run tests, lint/type checks, and production build.
7. Verify the generated report in the browser if tooling is available.
8. Review the diff and confirm Features 2 and 3 remain untouched.

Avoid unnecessary refactoring, duplicate calculation logic, invented rules, and large dependencies.

## 12. Final response required from Codex

When finished, report:

- Files inspected and files changed.
- Every report section implemented, in the order rendered.
- Any section that remains incomplete, with the reason.
- Workbook/sheet/cell traceability for key calculations and interpretations.
- Exact Lo Shu regression test result for 17/04/2000.
- Tests, lint/type checks, and build commands run, with actual results.
- Browser verification performed, if available.
- Security or architecture issues found.
- Confirmation that Features 2 and 3 were not modified.
- Confirmation that no commit, push, or deployment was performed.

**Completion criterion:** Feature 1 is not complete merely because the page renders. It is complete only when workbook-based section coverage, calculation correctness, regression tests, and verification are documented.
