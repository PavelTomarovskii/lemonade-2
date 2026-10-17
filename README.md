# Lemonade Quote price tests

[![CI](https://github.com/PavelTomarovskii/lemonade-2/actions/workflows/ci.yaml/badge.svg)](https://github.com/PavelTomarovskii/lemonade-2/actions/workflows/ci.yaml)

Playwright end-to-end tests, written in TypeScript, for the price behaviour of Lemonade's home [Quote page](https://lemonade-hq.github.io/qa-interview-task/quotes/LQ42EE07089). The suite drives the page the way a customer does and checks how the Price responds when they:

- step each Coverage up and down its ladder of values
- add and remove each kind of Valuable item
- switch each Add-on on and off (free Add-ons must leave the Price unchanged)
- change the Deductible (a lower Deductible must raise the Price)

It also checks that every place the Price is shown agrees, and that the annual Billing period stays consistent with the monthly Price. Product bugs it found are listed in [BUGS.md](BUGS.md).

## Setup

You need Node 24 (pinned in `.nvmrc`).

```sh
nvm use
npm ci
npx playwright install chromium firefox
```

## Running the tests

Every run is headless.

| Command                       | Runs                                               |
| ----------------------------- | -------------------------------------------------- |
| `npm test`                    | The full suite: unit tests and Chromium            |
| `npm run test:all-browsers`   | Unit tests, Chromium and Firefox                   |
| `npm run test:smoke`          | A quick cross-area smoke subset on Chromium        |
| `npm run test:coverage`       | Coverage tests on Chromium                         |
| `npm run test:valuable-items` | Valuable item tests on Chromium                    |
| `npm run test:add-ons`        | Add-on tests on Chromium                           |
| `npm run test:deductible`     | Deductible tests on Chromium                       |
| `npm run test:price-display`  | Price display and Billing period tests on Chromium |
| `npm run test:unit`           | Unit tests only, without a browser                 |
| `npm run report`              | Opens the HTML report of the last run              |

To run one browser, name its project: `npx playwright test --project=firefox`. WebKit is switched off until the Quote loads there ([#23](https://github.com/PavelTomarovskii/lemonade-2/issues/23)).

The suite runs against the public test Quote by default. Point it at another environment or Quote with `BASE_URL` and `QUOTE_ID`. Both are validated before any test runs, and a new Quote also needs its Baseline price in `src/test-data/quotes.ts`.

```sh
BASE_URL=https://example.test/quote-app/ QUOTE_ID=LQ42EE07089 npm test
```

The checks CI runs are also available locally: `npm run lint`, `npm run format:check` and `npm run typecheck`. Pre-commit hooks run lint and formatting on staged files and check commit messages against conventional commits.

## Project structure

```
src/
  config.ts          BASE_URL and QUOTE_ID, validated at startup
  money.ts           Money: exact amounts in cents, parses every money format on the page
  fixtures.ts        hands each test a freshly opened Quote and its Baseline price
  known-bug.ts       marks a test as an expected failure linked to its bug issue
  tags.ts            one tag per area, plus smoke
  pages/
    quote-page.ts    the one page object, exposing a component per area of the page
    components/      Coverage stepper, Valuable items, add item dialog, Add-on,
                     Deductible select, price summary, cookie banner
  test-data/         Coverage ladders, Valuable item kinds, Add-ons, Baseline prices,
                     and the known bug each affected case carries
tests/
  unit/              browserless tests for Money, the config and the test data
  e2e/               one folder per area (coverage, valuable-items, add-ons,
                     deductible, price-display) plus smoke
docs/adr/            design decisions
CONTEXT.md           glossary of the project's terms
BUGS.md              known product bugs
.github/             CI workflow, pull request template, code owners
```

## Test strategy

- **Relationships, not price tables** ([ADR-0002](docs/adr/0002-relational-price-assertions.md)). Tests check which way the Price moves, whether the observed change equals the Price impact the page claims, and whether undoing a change returns to the Baseline price. The Baseline price of the Quote under test is the only fixed figure.
- **Known bugs are expected failures** ([ADR-0001](docs/adr/0001-known-bugs-are-expected-failures.md)). A test that hits a confirmed bug is marked with `test.fail()` and annotated with the bug's issue URL, only on the affected data-driven case. The suite stays green, every bug stays visible in the report, and a fixed bug shows up as an unexpected pass.
- **No timed waits.** Every Price update shows a short loading state on the Pay buttons. After each priced action, the page objects wait for one more update to finish and only then read the Price, so "the Price did not change" is a real check rather than a guess. Everything else uses Playwright's retrying assertions.
- **Page Object Model.** Locators live only in the Quote page and its components, never in tests. Tests read as customer actions and Price expectations in the glossary's terms.
- **Data-driven.** Coverage ladders, Valuable item kinds, Add-on configurations and Deductible options are defined once in `src/test-data`, and the tests are generated from them. Every neighbouring step on every Coverage ladder is checked in both directions.
- **Independent tests.** Each test opens a fresh Quote, so tests run fully parallel in any order. Tests never reload the page, because reloading is broken ([#32](https://github.com/PavelTomarovskii/lemonade-2/issues/32)).
- **Two seams.** End-to-end tests cover the Price behaviour through the page objects. Fast unit tests cover the code the price checks rely on: reading money amounts, the config and the test data.
- **CI.** GitHub Actions runs lint, format check, type check and unit tests, then the end-to-end tests on Chromium and Firefox in parallel jobs, on every pull request and push to `main`. HTML reports are uploaded as artifacts, with a screenshot on failure and a trace on retry. `main` accepts changes only through pull requests that pass all three jobs.

Out of scope: exact Prices from the page's internal price table, the start date control, network stubbing, visual regression, accessibility, performance and mobile viewports.

## Terminology

The project uses the terms defined in [CONTEXT.md](CONTEXT.md), in code, test names and docs alike:

- **Quote**: one customer's priced policy proposal, shown on a single page.
- **Price**: the monthly amount for the Quote as currently configured.
- **Baseline price**: the Price of a freshly loaded Quote.
- **Price impact**: the change in Price the page claims an Add-on or Valuable item will cause, as distinct from the change observed.
- **Billing period**: monthly or annual presentation of the Price.
- **List price**: the crossed-out amount above the Price.
- **Coverage**, **Valuable item**, **Add-on**, **Deductible**: the four kinds of control that shape the Price.

## Known bugs

[BUGS.md](BUGS.md) lists every defect found, with its severity, status and the tests that mark it. Each bug is a GitHub issue with steps to reproduce and a screenshot.

| Issue                                                           | Bug                                                                      | Severity | Automated |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | --------- |
| [#23](https://github.com/PavelTomarovskii/lemonade-2/issues/23) | The Quote page never loads in WebKit (Safari)                            | High     | No        |
| [#29](https://github.com/PavelTomarovskii/lemonade-2/issues/29) | Loss of Use: raising Coverage from $20,000 to $25,000 lowers the Price   | High     | Yes       |
| [#30](https://github.com/PavelTomarovskii/lemonade-2/issues/30) | Medical Payments: steps between $1,000 and $4,000 don't change the Price | Medium   | Yes       |
| [#31](https://github.com/PavelTomarovskii/lemonade-2/issues/31) | Valuable item tiles show the Price impact with one decimal               | Low      | Yes       |
| [#32](https://github.com/PavelTomarovskii/lemonade-2/issues/32) | Reloading the Quote or using "Start over" leads to a 404                 | High     | No        |
| [#33](https://github.com/PavelTomarovskii/lemonade-2/issues/33) | The "1% discount" is actually a flat $1 off                              | High     | No        |

The automated bugs are expected failures, following [ADR-0001](docs/adr/0001-known-bugs-are-expected-failures.md).

## How this was built

I built this with Claude Code as the coding agent. I made the design decisions and reviewed every change; the agent explored the page, drafted documents and wrote most of the code under the rules in [CLAUDE.md](CLAUDE.md).

The workflow:

1. **Explore.** The agent explored the Quote page in headless Chromium and recorded its controls, selectors and price behaviour in local notes. The bugs in BUGS.md came out of this exploration and the tests.
2. **Agree the language and decisions.** The glossary ([CONTEXT.md](CONTEXT.md)) and the ADRs came first, so the code, the tests and the conversations with the agent use the same terms.
3. **Specify.** The agent questioned me about the plan until it was settled, then wrote it up as a spec ([#1](https://github.com/PavelTomarovskii/lemonade-2/issues/1)) split into tickets across six milestones.
4. **Deliver ticket by ticket.** Each ticket got its own branch and pull request with small conventional commits. The agent worked test-first where there was a unit seam and reviewed each change against the coding standards and the ticket before I reviewed and merged it.

My decisions along the way:

- **Relational price checks and known bugs as expected failures**, recorded as ADR-0001 and ADR-0002 before any test was written.
- **No timed waits.** An early version waited for the Price to stay unchanged for a fixed time. I rejected it and pointed to the Pay button's loading state as the signal to wait for.
- **One pull request per ticket.** The first page-object and test milestones arrived as one large pull request each. I reverted them ([#35](https://github.com/PavelTomarovskii/lemonade-2/pull/35)) and had them redone one ticket at a time, so each change could be reviewed on its own.
- **Recorded decisions are implemented as written.** When the agent replaced the agreed `test.fail()` marker with a mechanism of its own, I sent it back.
- **Monthly and annual amounts are kept apart.** Each Billing period has its own read methods rather than one method that branches on the period.
- **No Playwright Test Agents.** The agent researched them; I decided against them, because the generator writes flat tests that bypass the Page Object Model and the healer can change expected values, which would hide pricing bugs.
- **No automated dependency updates.** Dependabot's first two pull requests broke the build or the Node version pin, so I removed it ([#27](https://github.com/PavelTomarovskii/lemonade-2/issues/27)).
- **WebKit is off**, rather than left failing, until the Quote loads there ([#23](https://github.com/PavelTomarovskii/lemonade-2/issues/23)).

## Licence

[MIT](LICENSE)
