# Full collection starts

Normal expeditions now accept one to six owned individuals without a point budget.
The optional Budget challenge preserves the old six-point restriction. A fill-team
action uses owned individuals only and preserves the selected lead.

Difficulty snapshots starting party size, not its stats or rarity:

| Starting size | Ordinary level bonus | Guardian level bonus | Guardian opponents |
|---|---:|---:|---:|
| 1–2 | 0 | 0 | 1 |
| 3 | 1 | 0 | 2 |
| 4 | 1 | 1 | 2 |
| 5–6 | 2 | 1 | 3 |

Guardians use varied-type supports followed by the main guardian. Gold, research,
reward selection, and restoration wait until the entire team is defeated. XP is
shared across opponents, avoiding the level snowball found in the initial trial.
Catching later never raises this scaling. Existing active runs retain the older
solo-guardian schedule; new runs use the new snapshot.

## Simulation coverage

51,000 blind-route expeditions: 1,000 seeds per partner/cohort. The frozen baseline
and all fresh/upgraded/collected-shiny cohorts remain, plus mixed three-member,
six-member, and perfect-shiny six-member collections for all eight first partners.
The endowed collections are test fixtures; they do not unlock anything in normal
play. Enemy teams are not inspected ahead of time to choose player moves.

After dividing guardian XP across its opponents, ordinary six-member fixtures
completed 26.3–43.7% of campaigns, compared with 83.9–93.8% in the over-generous
initial XP trial. This is a simple bot's result, not a human win rate. Solo fresh
results remained unchanged. Perfect-IV shiny collections remain substantially
stronger, as intended. Full per-partner reach/clear counts, denominators and policy
limitations are in simulation.md and simulation.json.

All fresh acceptance assertions were retained. Added minimum viability assertions
for every ordinary six-member roster, and regression tests for optional budget
validation, ownership, the six-member cap, original IV/shiny identity, multi-opponent
save/resume, switching, XP budgeting, and final-only guardian rewards.
