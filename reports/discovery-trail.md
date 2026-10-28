# Discovery trail implementation

The benchmark's small playable experiment is implemented as an opt-in **Discovery trail · 6 rooms** alongside Classic. Select it in the lobby before departing; an active campaign is not silently converted. The first partner and starting team still come from the permanent collection.

## What changes a run

Choose a request and one of two starting styles. Venom adds Toxic Spores and Venom Heart; Relay adds Brace and Relay Shell. Three requests award persistent cosmetic field badges: catch a species absent at departure, catch while the target has a condition, or evolve a teammate. Just explore removes the request. New discovery is disabled if the entire trail pool is already owned, preventing an impossible objective. Completion is evaluated by real capture/evolution events before capture conditions are cleared. Profile synchronization deduplicates badge IDs; there is no repeatable currency award.

A small strip shows the request and charm count; clicking it opens the current rules and actual effect totals. The play screen retains four move buttons. A one-line public enemy intent appears above them. Effects and calculation remain in the engine, with battle visuals observing actual outcomes.

One optional scout, available from room 3, reveals only a broad clue for each direction. Tracks indicate an encounter category; a glow indicates a noncombat category. Exact rooms, species and rewards stay hidden until committing the swipe. Scouting changes neither encounter RNG nor the committed outcome. Charges and revealed depths persist in the atomic session envelope. Both opening rooms remain catch opportunities, so the scout is reserved for the later forks where the categories can differ.

The six charm choices are Venom Heart, Toxic Fang, Spore Lens, Relay Shell, Baton Spark and Welcome Berry. Taken charms leave the offer pool. Rewards favor the chosen style first but allow combining the two. Core switch effects apply only on the first voluntary switch in an encounter; a forced fainted replacement neither takes an enemy action nor spends the effect. Baton Spark waits for the incoming individual's next successful damaging move and survives save/resume.

Wild encounters use three visible patterns: brace periodically, quick priority attacks, or an opening condition move. The guardian cycles brace, a grass heavy strike, then a lighter flying Cleansing Gust that clears its conditions at turn end. The hint explicitly advertises the cleanse. This prevents permanent poison/sleep from bypassing the entire pattern. A high-priority Brace softens the heavy hit; Relay Shell gives another response through switching. Ordinary type resistances/immunities still apply.

At camp the player can take one optional team lesson, choosing Toxic Spores or Brace for the third move slot before resting/training. The selected technique survives evolution and is applied to later catches. The run ends after the sixth room. The outcome highlights catches and the request, offers the collection, and suggests a new team/style. Short victories do not unlock the Classic difficulty ladder.

## Save and compatibility work

`trail` is an optional validated run extension; existing campaigns omit it and retain their previous map, battle rules, rewards and length. Profiles migrate an absent `trailBadges` field to an empty list. Persistent individual identity, favorites, release tombstones, IVs and shiny sprites retain their existing behavior. Charms, techniques, guard state, first-switch consumption, pending Baton Spark, scout state and request state round-trip in the same saved session. An old active encounter is not rerolled.

All short-mode numbers are in `src/engine/trail.ts`: six rooms, encounter pool and levels, XP and room XP, scout availability, poison/switch multipliers and guardian values. Classic uses its existing configuration. No Firebase or external service was added.

## Verification and interpretation

The mandatory verification includes the original 51,000 blind-route Classic/frozen-baseline campaigns and 128,000 short expeditions. The short suite crosses eight partners, two styles, two policies, and fresh/upgraded/perfect-shiny/normal-six-member collections at 1,000 seeds each. The control policy makes the same independent blind direction choices as the existing suite. The second policy adapts only to visible intent, current status and the current party; it never inspects future rooms, encounters or rewards. Neither uses scouting, keeping routes comparable. Full guardian reach/clear, conditional rates, request completion and effect-use counters are in `trail-simulation.json`.

The first tuning pass cleared almost every short run, leaving little challenge. The guardian was then tuned independently from Classic and given a public cleanse phase. Current results still show a stronger Venom strategy and a large advantage for some partners. The limited relay bot can make poor switches and does not select type counters, so its rates are not a claim that a human cannot use Relay well. Perfected collections still have substantial power. These are explicit next-playtest concerns, not hidden behind an averaged “fun score.”

Regression coverage includes optional setup, six-room completion, campaign exclusion, secret clues, independent RNG, saved charges, conditioned captures, evolution requests, no-request runs, deduplicated badges, no short-mode challenge unlock, poison immunity and healing bounds, non-revival, turn-cost switching, free replacement, single-use effects, pending buffs, duplicate reward rejection, guard priority/self-targeted visuals, guardian intent/cleanse and camp lessons.

Browser testing uses isolated named slots. End-of-run QA uses a development-only checkpoint constructed through the actual engine's evolution and battle commands; it does not grant anything to regular accounts. See browser-qa.md for the exact flows and screenshots.

## What still needs people

This is the benchmark's recommended first experiment, not all eight roadmap ideas. It adds the hunt, two build directions, six charms, scouting, three encounter patterns, one guardian pattern, a technique choice and a short repeat-run outcome. Broad species-specific learnsets, extra biomes, daily competitive rankings and a larger mastery system remain later work.

Try one Venom and one Relay run. Check whether the hunt changes your choices, whether you notice a charm interaction, and whether a failed run gives you a specific next plan. The next iteration should follow that observation rather than simply increasing the roster or permanent stats.
