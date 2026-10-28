# Verdant development rules

## Mandatory checks for every change

- Add or update meaningful regression coverage for each change. Cover observable behavior and failure cases, not copies of implementation details. UI changes need browser-flow coverage as well as any applicable engine tests. Update validation coverage when changing configuration, content, save schemas, or documented commands.
- Run `npm run verify` before declaring work complete. This runs the tests, blind-route simulation suite, and production build. Do this for every change, including interface or documentation changes; do not assume balance is unaffected.
- Inspect the results. Fix failures and explain material balance regressions. Do not silently weaken assertions to pass a change.
- Preserve the machine-readable and Markdown simulation reports in `reports/`. Report seed count, bot policy, cohort, per-starter results, boss reach rates, boss clear rates, full-run clear rates, and any failures to terminate. State that bot results are not human win rates.
- For balance/progression changes, use at least 1,000 independent seeds per starter for fresh, upgraded, and collected-shiny profiles. Compare with the frozen baseline. Fresh accounts must be able to win without upgrades.
- Normal simulation decisions must not inspect future room types, rewards, encounter species, or other information hidden from the player. Route randomness must be independent of combat randomness. Oracle tests may exist only as clearly labeled diagnostics; they cannot satisfy the balance gate.
- Verify UI changes in the browser at desktop and narrow-mobile sizes. Test the relevant interaction and reload/resume behavior. Use the isolated `?playtest` slot; do not reset the user's regular save.

## Game and save constraints

- Keep the game local-only unless the user requests a backend or publication.
- Preserve existing saves through explicit, tested migrations. Store the profile and active run atomically. Research awards and collection entries must be idempotent across reloads, repeated actions, replayed seeds, and run restarts.
- Persistent collection identity includes individual IVs and shiny ownership. Run levels, HP, negative conditions, temporary items, and evolution progress reset when starting again.
- Keep permanent numerical upgrades capped and configurable. Snapshot their effects at run creation; buying or refunding an upgrade must not mutate an active team.
- Keep normal play visually simple: world, Pokémon, immediate actions. Put collection details, IVs, upgrades, and diagnostics in sheets or between-run screens.
- Preserve real normal/shiny back sprites for player perspective. Keep assets and game data local.
- Put balance values in shared configuration. Keep rules independent of React and storage so the simulator executes the same engine as the browser.

## Baseline

`benchmarks/baseline-v1/` is the frozen pre-progression engine and data. Never tune
or edit it to make comparisons look better. New baselines require explicit user
authorization and must retain earlier reports.

## Fixed-route iteration (27 October 2026)

The user explicitly replaced blind swiping with public fixed routes. New runs use a
fixed room schedule and publish seeded species/type forecasts through routeStops.
A simulation policy may use that same public forecast, including guardian supports,
but never unrevealed IVs, shiny rolls, rewards or future combat RNG. Legacy blind
suites remain compatibility controls; do not silently apply their rates to new maps.
`npm run verify` now also runs the current fixed-route suite and preserves its
Markdown/JSON reports. Keep at least 1,000 seeds per current mode/style/partner/cohort
and label control versus public-information policies. Maintain forecast-to-encounter,
no-reroll, no-skip, legacy-save, desktop and mobile checks for route/UI changes.
