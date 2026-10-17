# Known bugs

Every defect found in the Quote page so far, with its issue, severity, status and the tests that mark it. Each issue carries its own screenshot. The GitHub issue number is each bug's only ID. Steps to reproduce, expected and actual results and the environment are in the issue itself.

All figures were observed on the public test Quote (Baseline price $14.33 / month) on 2026-10-16.

| Issue                                                           | Title                                                                                   | Severity | Status | Summary                                                                | Automated |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ------ | ---------------------------------------------------------------------- | --------- |
| [#23](https://github.com/PavelTomarovskii/lemonade-2/issues/23) | Quote page never loads in WebKit (Safari): stuck on "Loading Lemonade renters quote..." | High     | Open   | The Quote never appears in WebKit, which stays on its loading message. | No        |
| [#29](https://github.com/PavelTomarovskii/lemonade-2/issues/29) | Loss of Use: raising Coverage from $20,000 to $25,000 lowers the Price                  | High     | Open   | The Price falls from $14.73 back to $14.33 at the $25,000 step.        | Yes       |
| [#30](https://github.com/PavelTomarovskii/lemonade-2/issues/30) | Medical Payments: steps between $1,000 and $4,000 don't change the Price                | Medium   | Open   | The Price stays $14.33 from $1,000 to $4,000 and only moves at $5,000. | Yes       |
| [#31](https://github.com/PavelTomarovskii/lemonade-2/issues/31) | Valuable item tiles show the Price impact with one decimal                              | Low      | Open   | The tile reads "+$4.6/MO" where the dialog says "+$4.60".              | Yes       |
| [#32](https://github.com/PavelTomarovskii/lemonade-2/issues/32) | Reloading the Quote or using "Start over" leads to a 404                                | High     | Open   | The address loses its base path, so a reload opens a GitHub Pages 404. | No        |
| [#33](https://github.com/PavelTomarovskii/lemonade-2/issues/33) | The "1% discount" is actually a flat $1 off                                             | High     | Open   | The List price is always the Price plus $1.00, not 1% above it.        | No        |

Automated bugs are expected failures ([ADR-0001](docs/adr/0001-known-bugs-are-expected-failures.md)): each marked test carries an `issue` annotation with the issue's URL, and the suite stays green. When a bug is fixed, the test reports an unexpected pass and its marker should be removed. Bugs that are not automated concern hosting and setup rather than pricing, or the browser matrix, so they are documented here only.

## Automated bugs

### #29: Loss of Use: raising Coverage from $20,000 to $25,000 lowers the Price

Severity: High. Status: Open.

Stepping Loss of Use up from $20,000 to $25,000 drops the Price from $14.73 back to $14.33, the same as at $15,000. At $30,000 it is $15.28.

Screenshot: attached to [#29](https://github.com/PavelTomarovskii/lemonade-2/issues/29).

Tests marked as expected failures, all in `tests/e2e/coverage/coverage-price.spec.ts` (data in `src/test-data/coverage-ladders.ts`):

- Coverage price behaviour › Loss of use › stepping between $20,000 and $25,000 moves the Price the right way

### #30: Medical Payments: steps between $1,000 and $4,000 don't change the Price

Severity: Medium. Status: Open.

The Price stays $14.33 at $1,000, $2,000, $3,000 and $4,000. Only the step to $5,000 changes it ($14.93).

Screenshot: attached to [#30](https://github.com/PavelTomarovskii/lemonade-2/issues/30).

Tests marked as expected failures, all in `tests/e2e/coverage/coverage-price.spec.ts` (data in `src/test-data/coverage-ladders.ts`):

- Coverage price behaviour › Medical payments to others › stepping between $1,000 and $2,000 moves the Price the right way
- Coverage price behaviour › Medical payments to others › stepping between $2,000 and $3,000 moves the Price the right way
- Coverage price behaviour › Medical payments to others › stepping between $3,000 and $4,000 moves the Price the right way

### #31: Valuable item tiles show the Price impact with one decimal

Severity: Low. Status: Open.

After adding Jewelry at $5,000, the add dialog claims "+$4.60" but the item's tile reads "+$4.6/MO". The Price itself is right ($14.33 to $18.93). Cameras at $5,000 are affected the same way.

Screenshot: attached to [#31](https://github.com/PavelTomarovskii/lemonade-2/issues/31).

Tests marked as expected failures, all in `tests/e2e/valuable-items/valuable-items-price.spec.ts` (data in `src/test-data/valuable-items.ts`):

- Valuable items price behaviour › jewelry › shows the claimed Price impact on the item's tile
- Valuable items price behaviour › cameras › shows the claimed Price impact on the item's tile

## Documented, not automated

### #32: Reloading the Quote or using "Start over" leads to a 404

Severity: High. Status: Open.

Once loaded, the Quote's address loses its `/qa-interview-task` base path, so a reload or the page's own "Start over" opens GitHub Pages' 404 page. The suite never reloads: every test opens a fresh Quote instead.

Screenshot: attached to [#32](https://github.com/PavelTomarovskii/lemonade-2/issues/32).

### #33: The "1% discount" is actually a flat $1 off

Severity: High. Status: Open.

The bubble advertises a "1% protective devices discount", but the List price is always exactly $1.00 above the Price ($15.33 against $14.33, which is 6.5%), whatever the Coverage.

Screenshot: attached to [#33](https://github.com/PavelTomarovskii/lemonade-2/issues/33).

The same issue also records:

- A question for the product owner: with the Annual Billing period the annual amount is twelve monthly Prices minus a flat $12 ("ANNUAL (-$12)"). Is a flat annual reduction intended?
- A minor console error on every page load: `POST /_mrkt/privacy/accept_cookies` returns 405, so the cookie-consent choice is never saved.

### #23: Quote page never loads in WebKit (Safari)

Severity: High. Status: Open.

In Playwright WebKit the page stays on "Loading Lemonade renters quote..." and the address becomes `https://lemonade-hq.github.io/`. Not yet confirmed in desktop Safari. The WebKit project is switched off in `playwright.config.ts` until this is fixed.

Screenshot: attached to [#23](https://github.com/PavelTomarovskii/lemonade-2/issues/23).
