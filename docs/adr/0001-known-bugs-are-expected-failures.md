# Known product bugs are expected failures, not red or skipped tests

A test that catches a confirmed product bug is marked with `test.fail()` and annotated with a link to that bug's GitHub issue, so the suite stays green while the bug stays visible in every report. We rejected leaving such tests red, because a permanently failing suite hides new regressions, and we rejected steering tests around the broken values, because that hides the bug itself. When the bug is fixed, Playwright reports an unexpected pass, which tells the team to remove the marker.
