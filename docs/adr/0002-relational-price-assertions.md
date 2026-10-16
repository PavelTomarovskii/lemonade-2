# Price assertions check relationships, not exact price tables

Tests check how the Price relates to an action: which way it moves, whether the observed change equals the Price impact the page claims, and whether undoing the action returns to the Baseline price. Exact expected Prices for each configuration are not hard-coded. A black-box tester has no published pricing rules, and copying the page's internal price table would tie every test to data that can change on purpose. The one fixed figure is the Baseline price of the Quote under test, which the config defines.
