# Lemonade Home Quote

The renters/home insurance quote page under test, where a customer tunes their policy and sees the price respond.

## Language

### The quote

**Quote**:
One customer's priced policy proposal, identified by an id like `LQ42EE07089`, shown on a single page.
_Avoid_: Policy, offer, page

**Price**:
The monthly amount the customer would pay for the Quote as currently configured.
_Avoid_: Premium, cost, total

**Baseline price**:
The Price of a freshly loaded Quote, before the customer changes anything.
_Avoid_: Default price, initial price, base price

**Price impact**:
The change in Price that the page claims a configured Add-on or Valuable item will cause (e.g. "+$1.67/MO"), as distinct from the change actually observed.
_Avoid_: Delta, surcharge, add-on price

**Billing period**:
Whether the Price is presented per month or per year; the annual figure is derived from the Price.
_Avoid_: Plan, payment frequency

**List price**:
The crossed-out amount shown above the Price, presented by the page as the pre-discount figure.
_Avoid_: Discount, original price, old price

### What shapes the price

**Coverage**:
An insured amount for one protection category — Personal Property, Personal Liability, Loss of Use or Medical Payments — chosen from a fixed ladder of values.
_Avoid_: Limit, coverage amount, stepper

**Valuable item**:
A single high-value possession (e.g. jewelry, a bicycle, a camera) insured separately from Personal Property, at a value the customer declares.
_Avoid_: Scheduled item, extra coverage, valuables

**Add-on**:
An optional extra the customer switches on or off, either free or priced.
_Avoid_: Extra, rider, endorsement, toggle

**Deductible**:
The amount the customer pays out of pocket per claim before insurance pays; a lower Deductible means a higher Price.
_Avoid_: Excess, self-pay
