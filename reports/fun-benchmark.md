# Verdant: engagement benchmark and next iteration

Reviewed 27 October 2026. This is a design benchmark, source audit, an isolated browser walkthrough of the opening capture/battle loop, and a deterministic balance comparison. It is **not** a retention study, a market-size analysis, or a full manual campaign playthrough. The comparisons below explain observable mechanics; their suitability for Verdant is a design judgment to test.

## Recommendation

Make a run tell a small story: **choose a Pokémon to hunt → build a fighting style → discover something unexpected → evolve a companion → beat a readable guardian → keep a meaningful discovery**. We have collection persistence and functional battles, but too few decisions alter that story. More permanent stat upgrades or more species alone will not solve this.

Keep the swipe interface and short runs. The next playable experiment should combine three things: limited scouting clues, two distinct combat builds, and one player-chosen collection objective. Defer Firebase, PvP, trading, and large rosters until that small loop is enjoyable.

## What comparable games do

| Reference and source | Mechanism worth studying | What Verdant can learn | What to avoid copying directly |
|---|---|---|---|
| [PokéRogue: starters](https://wiki.pokerogue.net/starters:starters), [biomes](https://wiki.pokerogue.net/biomes:biomes), [evolutions](https://wiki.pokerogue.net/gameplay:evolutions) | Captures/hatches unlock starters; persistent IV improvements, moves and candies deepen repeat catches. Biomes constrain encounters; a Map can enable route selection. Evolution methods adapt to its format. | Give players an attainable hunt and make a catch relevant to future teams. Make supported evolution dependable. | Its aggregated best-IV starter model would replace our individual-catch identity. Keep individuals and favorites; borrow the sense of a useful hunt instead. |
| [Slay the Spire, developer-published description](https://store.steampowered.com/app/646570/Slay_the_Spire/) | Routes offer risk/reward; cards interact with relics and form a distinct build. | Rewards should change subsequent decisions. An item that changes how poison or switching works is more memorable than another generic damage percentage. | Hundreds of options before a small set of combinations works. |
| [Monster Train, developer-published description](https://store.steampowered.com/app/1102190/Monster_Train/) | Primary/supporting clans establish a strategy; route stops supply different upgrades; champion and card upgrades deepen it. | Let a selected team develop a recognizable identity early, then offer coherent upgrades rather than unrelated loot. | Adding another tactical board or deckbuilding interface to a simple swipe game. |
| [Hades, Supergiant FAQ](https://www.supergiantgames.com/blog/hades-faq/) | Different combinations of divine powers make builds vary; story and permanent progression provide reasons to return; optional difficulty supports different players. | A failed expedition can still introduce a discovery and suggest a new experiment. Difficulty options should support mastery. | Assuming unlimited stat grinding can substitute for compelling moment-to-moment play. |
| [Rogue Legacy 2, developer-published description](https://store.steampowered.com/app/1253920/Rogue_Legacy_2/) | Persistent inheritance helps later attempts, while heirs and classes change how they play. | Persist possibilities as well as power. New starting charms, moves and hunt options can matter more than extra HP ranks. | A compulsory grind that makes early victories feel unavailable. |
| [Reigns, developer-published description](https://store.steampowered.com/app/474750/Reigns/) | Simple swipes resolve understandable dilemmas with consequences; goals unlock content and events can span reigns. | Minimal controls can carry substantial choices. The player needs a reason to prefer a direction or accept a risk. | Treating the swipe gesture itself as the source of depth. |

These sources describe the games, not experiments proving why users return. No competitor retention or session-length figures are inferred from store ratings.

## Current Verdant diagnosis

The browser walkthrough used a fresh isolated account with Zubat. I applied Poison Powder to Clefairy, opened the capture bag, saw 36% normal / 54% Great Ball odds, caught it, selected supplies, then took the other direction into Mankey. Wing Attack was visibly super-effective. Separately I exercised a camp checkpoint and overdue evolution at desktop and mobile sizes. The code audit covers the broader room/reward/combat systems; simulations cover full campaigns.

| Area | Evidence in this build | Likely engagement problem | First experiment |
|---|---|---|---|
| Exploration agency | Both path outcomes are hidden; direction assignment is shuffled. | A choice cannot be strategic if there is no relevant information. Surprise alone does not let the player express intent. | Optional one-use scouting clue or broad environmental cues; retain unknown exact species, rooms and loot. |
| Pokémon identity | Species have IVs, typing and stats, but share a four-slot move template. | Many catches change numbers more than playstyle. | Two curated learnsets with utility moves and a meaningful move choice at a milestone. |
| Run identity | Four relics: weakness protection, damage, capture and recovery. | Predominantly numerical benefits rarely transform a strategy. | Add a small, tested set of interactions around poison and switching. |
| Repeated encounters | Normal battles often reward the obvious effective move; status is useful for catching. | Repeating the best button provides little adaptation. | A few opponents with readable intent and counters, without random unfair punishment. |
| Capture motivation | The collection persists, but there is no selected hunt influencing an expedition. | “Find anything” loses urgency as ownership grows; a six-member starting roster can make ordinary catches less useful. | Pick one habitat/type research request before departure. |
| Growth payoff | Several partners lacked evolution rules/assets; events were mainly log entries. | Training failed to deliver an expected, visible Pokémon moment. | Fixed now for all eight first partners; show level hint and evolution announcement. |
| Repeat-run purpose | Capped upgrades and cosmetic species milestones exist. | Collection count alone is a weak reason to immediately try a different team. | End screen highlights a new option and offers a specific next hunt/build goal. |
| Long-term challenge | Six perfect shiny fixtures now win almost every normal run. | Optimized collections can exhaust normal-mode challenge. | Optional team challenges and seeded runs after the core combat is enjoyable. |

These are hypotheses grounded in the prototype and the user's feedback, not measured explanations of player churn.

## Evolution audit and repair delivered

The problem was real: Zubat had no entry in `EVOLUTIONS` and Golbat was absent from imported data and assets. Paras, Geodude, Bellsprout and Poliwhirl also lacked a usable evolution path. Existing evolution checks only fired on a new level or camp training, so simply adding a threshold would leave an old level-30 Pokémon waiting unnecessarily.

All offered first partners now have a supported route:

| First partner | Short-run evolution milestones |
|---|---|
| Bulbasaur | Ivysaur 10 → Venusaur 18 |
| Charmander | Charmeleon 10 → Charizard 18 |
| Squirtle | Wartortle 10 → Blastoise 18 |
| Zubat | Golbat 12 |
| Geodude | Graveler 10 → Golem 18 |
| Paras | Parasect 12 |
| Bellsprout | Weepinbell 10 → Victreebel 18 |
| Poliwhirl | Poliwrath 16 |

Also completed Caterpie → Metapod 7 → Butterfree 10, and Haunter → Gengar 20. Existing Gastly, Magikarp and Dratini progression remains. The roster is now 74 species with 296 local normal/shiny front/back sprites. Data and sprites are imported from [PokéAPI](https://pokeapi.co/docs/v2) and [its sprite repository](https://github.com/PokeAPI/sprites).

These are deliberately accelerated prototype levels. Stone/trade methods for these supported families are simplified to levels; this is not a claim of mainline accuracy. Crobat/friendship, Eevee branching choices, and evolutions for other unfinished families remain outside this fix. Completing every Pokémon family is still content work, not solved by importing a larger list of names.

An eligible living party member now catches up at the next XP reward even if it does not gain a level, including at the level cap. Camp recovery also reaches that safe progression point. Loading preserves the active encounter and current forms rather than silently changing combat on resume. Shiny multiplier, individual IVs, source identity and status survive; wounds are retained by HP difference. The next run still starts from the owned starting form. Evolution registers in the guide and produces a visible announcement; details show the next required level.

## What the balance benchmark says

Both versions use the same 1,000 named seeds per starter/cohort, 51,000 campaigns per version, independent blind routes and a visible-state combat heuristic. All eight fresh/upgraded/collected-shiny partners, mixed three/six-member collections, perfect-shiny six-member collections, and the frozen baseline are included. Existing assertions were retained. No run failed to terminate.

| Signal | Before evolution repair | After repair |
|---|---:|---:|
| Fresh first-guardian clears, range across eight partners | 74.7–85.6% | 74.7–85.6% |
| Fresh Zubat full clear | 2.9% | 18.7% |
| Fresh other partners full clear, range | 3.2–6.8% | 3.8–8.8% |
| Ordinary mixed-six full clear, range | 26.3–43.7% | 36.5–68.9% |
| Perfect-shiny mixed-six full clear, range | 86.1–94.3% | 92.5–98.2% |

Evolution materially improves later survival. It also exposes a late-game starter gap, particularly Zubat, and very little normal-mode headroom for perfected shiny teams. This deserves targeted tuning of species move budgets and guardian counters. Raising every enemy level would risk erasing the payoff of collecting and evolving.

**These are not human win rates or a fun score.** The heuristic does not tactically switch, uses fixed healing thresholds and can perform worse after a stat change because its decisions change. The standard acceptance gate protects first-boss viability but does not enforce equal late-game strength. The reports disclose that limitation.

Full rows and exact reach/clear counts: [simulation.md](simulation.md), [simulation.json](simulation.json), [evolution-comparison.md](evolution-comparison.md), [evolution-comparison.json](evolution-comparison.json). The pre-repair payload is retained in `simulation-pre-evolution.json`; `benchmarks/baseline-v1/` is untouched.

## Prioritized ideas

1. **A hunt with a destination.** Before a run, choose one of three requests: find a new Water species, catch a Pokémon after applying a condition, or evolve a companion. Add a clear progress icon; claim once per expedition. Prefer an unlock/cosmetic reward over more permanent damage. Track event IDs so reload cannot repay it. Let players ignore the request.
2. **Mystery with agency.** Keep the exact discovery hidden, as requested. Test optional broad cues such as tracks versus a distant glow, or a limited scouting charge. A clue should alter expectations, never promise a specific encounter. Compare this against fully blind swipes before changing the default. A direction must not simply alternate between “correct” and “wrong.”
3. **Two builds that feel different.** Prototype a poison specialist and a switch-oriented team. Example rewards: poison ticks restore a small bounded amount to the lead; a one-use shield reduces damage on a voluntary switch; a hunter charm supports safe capture preparation. Switching still consumes a turn and the enemy still acts. Make interactions visible through a small icon and short effect line. Values are proposals to simulate, not changes already shipped.
4. **Moves worth choosing.** Offer one of two curated moves at a milestone. Let Zubat choose capture utility or speed pressure; let Geodude choose defense or a harder risky hit. Preserve four moves and the simple battle screen. Avoid importing hundreds of moves before supported effects are reliable.
5. **Guardians with personality.** Give each guardian one understandable pattern and counter: a telegraphed heavy attack, a short shield window or a status setup. Show a single intent icon. Publish the relevant battle information to the player and simulation policy together; no cheating preview of future opponents.
6. **A stronger moment of discovery.** Build on the current capture reveal: a brief entrance for unusual finds, an evolution transformation, and an end card showing the exact new team option earned. Respect reduced motion and avoid delaying every common battle.
7. **Collection mastery over endless power.** Species challenges unlock sidegrades, alternate starting charms or cosmetic habitats. Keep individual IV identities and protected favorites. Do not merge six best IVs into an artificial specimen without explicitly redesigning the collection.
8. **A small challenge mode later.** Locally seeded expeditions with fixed rules allow comparable attempts before accounts exist. Describe these as local practice, not trustworthy rankings. A backend is required before public competitive scores can be credible.

## Concrete next playable slice

Build a single biome experiment before expanding the campaign:

- Preserve the current 18-room mode as a control; add an opt-in six-room expedition.
- One selected research request, two build directions, six curated rewards, three distinct ordinary encounter patterns, one readable guardian.
- One target or evolution milestone can be achieved before the guardian; no promise of an unearned rare catch.
- Show only immediate actions and icons during play. Keep reward explanations to one line and details in the existing sheets.
- Separate clue generation, encounter randomness and battle randomness. Store committed choices atomically. Keep all thresholds/reward weights in shared configuration.
- Implement objectives and build effects in the engine, with stable IDs and a single settlement path. Add a typed move-effect registry before multiplying special moves. React renders outcomes; it does not calculate rewards or combat.
- Test with isolated saves and the shared simulator. Add a visible-state intent-aware bot only when players can see the same intent. Retain the blind policy for comparison.

This is the recommended next implementation, not functionality claimed as delivered in this review.

## How we decide whether it is better

First run a small formative test with 5–8 people; that sample can identify friction but cannot establish retention lifts. Observe one fresh run and one repeat attempt. Ask what they were trying to achieve, what choice mattered, and why they would start again. Compare the existing loop and experimental slice in counterbalanced order where practical.

Measure locally, without adding accounts:

| Question | Measurement | Provisional experiment target |
|---|---|---|
| Is there an early payoff? | Active time until first capture/evolution/build-changing reward | A noticeable payoff within about two minutes |
| Is combat dragging? | Median battle turns, actions and active time by encounter type | Most ordinary fights about 2–4 turns; investigate long outliers |
| Are choices understood? | Player can explain a route/reward decision without prompting | Most observed players can name a reason beyond randomness |
| Do runs differ? | Reward choices and actual build interactions triggered | Both proposed builds used successfully; no reward dominates every choice |
| Does collecting matter? | New catch placed into a subsequent lineup; voluntary hunt selection | Directional improvement over the control, not an invented industry rate |
| Does loss still invite another attempt? | Voluntary restart and the reason given after loss | A concrete new plan, rather than “I need more stats” |
| Is progression fair? | Human boss reach/clear plus stratified bot results | Wins possible fresh; separately inspect starter and optimized-team gaps |

These are design targets, not external benchmarks. Exclude paused/tab-hidden time and distinguish abandonment from a crash. Any later telemetry should have a clear local reset and should not touch the regular save during QA.

Advance to more content only if this experiment produces understandable choices, distinct runs and a reason to try another team. If it does not, revise the combat/reward loop before adding currencies or infrastructure.
