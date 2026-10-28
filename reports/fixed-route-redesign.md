# Fixed routes and handheld presentation

## Design decision

The player's latest request replaces blind left/right swipes with planning. New expeditions now use **battle → battle → item → battle → camp → guardian**. Quick Run covers one chapter; Journey covers three. The room sequence stays fixed across seeds. Species vary between runs to retain collection variety, but their forecasts are published before departure and saved. A player can inspect opponents and types, build a team, and choose a lead before advancing.

Guardian squads are included in the forecast and update with the selected starting party size. The guardian's preview lists each support and allows inspecting its typing. Future IVs, shiny status and item rolls remain unrevealed. Looking at a route does not grant seen entries, captures, research or collection milestones.

This should make choices more understandable, but it is a design hypothesis, not evidence of increased retention. Human sessions are needed to assess repeat play. Fixed routes trade some exploration surprise for informed preparation while keeping capture traits and rewards uncertain.

## What was simplified

The lobby shows a short team preview, the two expedition choices, six party slots, a compact route strip, PC BOX, OPTIONS and START. Research totals, coverage analysis, collection milestones, difficulty rules, hunt and charm descriptions no longer occupy the main setup screen. They remain accessible in the relevant sheets.

The route is an overworld with six inspectable stops and one NEXT button. Inspecting another stop does not skip ahead; BACK restores the next stop before advancing. Scouting and swipe arrows are absent. A 120 ms transition commits and saves the stop before entering it. Repeated input cannot advance twice.

Battles open with FIGHT / BAG / POKÉMON / RUN. Four move choices remain one click away; move type and PP remain visible because they support decisions. Exact enemy HP is removed from the visible HUD while retained in its accessible label. Player HP, level, conditions and important enemy intentions remain. The separate dock is hidden during battle and setup to avoid repeated controls.

Capture reveals celebrate the Pokémon and offer SUMMARY; IV percentages, quality labels and stars moved into collection/summary views. Reward choices use short menu rows. Camp focuses on rest/train; the optional team lesson is available through MOVE TUTOR.

## Visual direction

The inspiration was the framed dialogue, sprite perspective and compact commands of handheld Pokémon games, with the official [FireRed/LeafGreen page and gallery](https://www.pokemon.com/us/pokemon-video-games/pokemon-firered-version-and-pokemon-leafgreen-version) used as a reference. This is a new SVG/CSS presentation using existing cached Pokémon sprites, not copied game interface screenshots.

The current frame uses dark borders, paper dialogue panels, a teal console surround, local Pixelify Sans lettering, pixel terrain, route trees/water, and larger back sprites in battles. Terrain uses measured SVG coordinates so mobile maps preserve square pixels and do not squash trees. Reduced motion disables the route marker bounce. The font and license are local; gameplay remains offline-capable.

## Save behavior

New saves have an optional validated routePlan containing only version and forecast species. The fixed schedule and plan are generated independently from battle RNG. The exact plan round-trips rather than being reconstructed on every load. Old active battles retain their enemy, HP, PP, IVs and map. Old starter saves adopt the new route when departing; a planning preview uses the same seed/configuration as departure. No player progress was reset.

Legacy blind-route code and tests remain compatibility controls, not current UI. The original 51,000-campaign/frozen-baseline suite and 128,000 legacy Quick Run checks retain their prior policies and assertions. A new 192,000-run suite exercises current routes with control and public-route policies. Total mandatory simulation coverage: **371,000 expeditions**.

## What simulations show

Every mode/style/cohort/partner/policy uses 1,000 seeds. Cohorts include fresh, upgraded, perfect-shiny, and normal six-member collections. Both policies see current battle state. The public-route policy additionally selects a lead from the same forecasted species/types shown to the player; in Quick Run it also uses visible intent/status information. It never reads future IVs, shinies, rewards, or combat rolls.

Fresh full-run clear rates across eight partners:

| Mode | Control | Public-route policy |
|---|---:|---:|
| Journey | 12.5–75.6% | 12.4–67.1% |
| Quick Run, Venom | 56.0–93.4% | 88.8–99.7% |
| Quick Run, Relay | 56.0–93.4% | 53.4–91.3% |

These are bot outcomes, not human win rates or a fun score. The lead heuristic can choose a weaker low-level type counter instead of a stronger lead, which helps explain why its Journey average is lower (26.7% versus 28.8%). This is not proof that showing a map harms strategy. The two Quick Run policies also differ in battle behavior, so their difference cannot be attributed to previews alone.

The new layout guarantees three ordinary battles and an item opportunity in each chapter, changing XP and supply availability compared with the older random branches. Rates are therefore not directly interchangeable with legacy reports. Venom still has a large advantage and optimized teams retain substantial power. This iteration exposes these limits; it does not claim the styles are equally balanced.

Exact per-partner reach/clear counts, conditional rates and cohort details are saved in `fixed-route-simulation.json` and `.md`. Compatibility results remain in `simulation.*` and `trail-simulation.*`. No invalid or non-terminating run was observed in the checked suites.

## Validation

Regression coverage checks fixed schedules across seeds, forecast/actual identity, complete guardian forecasts, independent RNG, shiny/IV secrecy, habitat reachability, no preview rewards, atomic save/resume, no skipped/double-entered stops, malformed forecast rejection, unavailable discovery requests, legacy continuity, simplified capture labels and the local font/license. Browser flows cover planning, party selection, commands, capture, reload, item/camp progression and mobile layout in isolated slots. See browser-qa.md for the recorded checks.
