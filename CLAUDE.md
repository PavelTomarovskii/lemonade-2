## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues at `PavelTomarovskii/lemonade-2` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Commits and pull requests

Author commits only as the repo owner. Never add `Co-Authored-By: Claude`, "Generated with Claude Code", or any other AI attribution to commit messages or PR descriptions.

## Working files

Keep every file inside this repository. Never write to the system temp dir or a session scratchpad; put throwaway scripts and drafts in `.scratch/` (gitignored).

## Delivery workflow

- The plan is spec #1 and its sub-issue tickets, grouped into GitHub Milestones M1–M6. Work one milestone at a time, tickets in "blocked by" order.
- One branch and one pull request per milestone. Small conventional commits; the PR closes that milestone's tickets. `main` is protected: rebase merges only, never squash.
- Stop after each milestone's PR is open, so the repository owner can review it before the next milestone starts.
- Never commit `README.md` changes without the owner's prior approval of the exact text.
- Show drafts and wait for approval before creating batches of GitHub issues (e.g. the known-bug issues).
- Run GitHub operations as `PavelTomarovskii`; check `gh auth status` first and switch accounts if needed.
- Facts about the Quote page (controls, selectors, price behaviour, observed bugs) are in `docs/research/quote-page-exploration.md`, a local-only file. Read it before writing page objects or tests.
