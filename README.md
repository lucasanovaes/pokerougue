# Verdant — local Pokémon roguelite

A playable browser prototype focused on quick local iteration. No account, Firebase project, API key, or hosted backend is required.

## Play locally

The development server is already running at **http://127.0.0.1:5173/** for this session.

To start it again on this Mac, double-click **Start Verdant.command** in this folder. Keep its Terminal window open and open the Local URL it prints. If port 5173 is already occupied, Vite prints another available port.

Alternatively, open a terminal in this folder and run:

```sh
npm ci
npm run dev
```

Use the same browser and address to resume your save. Saves are stored in browser localStorage, so changing the port, using a different browser, or clearing website data creates a separate save. Internet is only needed to install dependencies or refresh imported assets; all game data, sprites, and fonts are included locally.

## Included in this build

- A one-time choice of one partner from Bulbasaur, Charmander, Squirtle, Zubat, Geodude, Paras, Bellsprout, and Poliwhirl; 74 species with individual 0–31 IVs.
- **Quick Run** (6 stops) or **Journey** (18 stops across three biomes), chosen with two simple lobby buttons.
- A fixed room schedule: **battle → battle → item → battle → camp → guardian**. Tap NEXT to move; inspect any route node to prepare your team.
- A focused play screen replaces the dashboard: rear-view Pokémon, a scene, and the current action. Team and Bag open on demand; Journal, help, and balance live in Menu.
- Battles and camp use the actual back sprite for your Pokémon, including shiny variants. The opponent faces you in battles.
- Opponent species and types are forecast before departure, including guardian supports. Seeded forecasts persist; IVs and shiny status are rolled only when an encounter begins.
- New routes use wild battles, items, camps, and guardians. Older active expeditions retain their original events, shops and elites.
- Six party slots, four moves, PP, physical/special damage, full 18-type effectiveness, priority, Speed, critical hits, and same-type attack bonus.
- Sleep, paralysis, poison, burn, potions, automatic emergency berries, and field revives.
- Capture probability based on species catch rate, HP, status, ball quality, relics, and configurable bonuses.
- Voluntary switching consumes a turn; the enemy attacks the incoming Pokémon. Replacing a fainted Pokémon is free.
- Experience, supported evolutions, item choices, four classic relics, and six Quick Run charms.
- Real shiny front/back sprites, sparkle effects, and a separately configurable shiny stat bonus.
- Local autosaves, seed entry, a battle journal, optional simple sound effects, and responsive layouts.

## Collection and progression

Your first partner and every successful catch join your permanent local collection, including catches you release when your party is full. Each individual keeps its IVs and shiny identity. On later runs, normal expeditions let you choose any one to six Pokémon you own, with no point limit. The optional Budget challenge retains the six-point starting rule and its extra shiny point. Run levels, HP, conditions, inventory, and evolution progress reset; six party slots remain available during expeditions.

Research is banked even on losses: one per completed room, three per newly caught species, and five per guardian. Upgrades are capped: one extra potion costs five, three extra balls cost five, and two 5% HP ranks cost eight and twelve. Refunds return the amount paid. Purchases and refunds affect new runs, never an active team. Journey wins unlock optional challenge tiers; Quick Run wins do not unlock that ladder.

The first two rooms always offer catchable encounters, non-battle rooms grant exploration XP, every guardian has a preceding camp, and guardian victories restore the team. Catches recover to at least 60% HP and lose negative conditions. The first guardian uses capped damage and no critical spikes. Curated move budgets balance the eight opening partners; tune these and other progression values in `src/engine/config.ts`.

## Shiny Pokémon

The default encounter probability is **1 in 256**, and shiny Pokémon gain **15% to all six calculated stats**, rounded down. IVs are rolled independently from shininess. This stat advantage is a custom game rule, not a claim about the original Pokémon games.

Open **Menu → Field lab** using the top-right icon. Edit shiny rarity, shiny stat bonus, capture multiplier, enemy levels, experience, and weakness protection. Settings affect this expedition and new expeditions. Existing Pokémon keep their generated shiny bonus and stats.

**Queue shiny** guarantees the next catchable wild encounter is shiny. It is an explicit local testing tool; elites and guardians do not consume the guarantee. You can set rarity to `1` to make every newly generated encounter shiny, or `4096` for a rarer setting.

Shininess, IVs, and encounter identity persist through saving, capture, and evolution. Reloading does not reroll encounters.

## Discovery-focused iteration

**Menu → Field guide** tracks all 74 species. Unseen entries hide names and sprites;
seen encounters reveal a preview; first partners, catches, and evolutions register
entries permanently. Filters show missing/seen entries and static habitat lists.
Route previews reveal species without granting guide ownership or recording an encounter as visited. Cosmetic collection
badges unlock at 3, 8, 16, 32, and 74 registered species, inside the guide. Badges do not add stats or currency.

Captures have a simple celebratory reveal and a SUMMARY button. Individual IV quality stays in the summary and PC Box. Individual specimens remain separate. IV quality is
based only on the six IVs; shininess retains its separate configurable stat bonus.

Team setup uses six visible slots and the entire searchable collection. Filter by
type or shiny, sort by IV quality, and inspect each specimen. A coverage preview
shows how many single defending types the starting moves hit super effectively
and which incoming types are weaknesses for every selected teammate. This is a
simple type preview, not a battle-strength score: it does not model levels, Speed,
abilities, dual-type opponents, or opponent moves. Normal expeditions allow six owned individuals without a point budget; Budget challenge is an optional restriction.

Diglett and Exeggcute now appear on the coast, and Onix in the highlands.
Bulbasaur and Poliwhirl can also be found on the coast, so the one-time partner
choice never locks a player out of completing the guide. Every
field-guide entry has a current encounter, partner, or implemented evolution route.
Older saves keep their collection and research; seen/registered history is recovered
from recorded catches and the active expedition. Unrecorded encounters from older
finished runs cannot be reconstructed.

The play surface uses a handheld-style frame, local pixel lettering, pixel terrain, front/back sprites and FIGHT / BAG / POKÉMON / RUN commands. Advanced options, collection progress, research and detailed stats live in sheets. Move types, PP, HP and important intent cues remain visible. Presentation uses local SVG/CSS.

## Starting with a full collection team

Normal is the default: bring up to six distinct owned individuals, including
shinies and duplicate species with different individual identities. No Pokémon are
granted for free. **Collection → Fill six slots** keeps the selected lead and fills
remaining spaces with owned specimens. Remove one before choosing a seventh.
Levels reset to five; IVs, shiny status, and the capped next-run upgrades remain.

**OPTIONS → Team rules → Budget challenge** optionally restores the six-point rule. This is
separate from the difficulty tiers unlocked by victories.

New expeditions snapshot the number of starters. Starting with one or two keeps
single guardians. Three or four starters face a support plus guardian; five or six
face two supports plus guardian. Guardian opponents enter sequentially, with the
main guardian last. The indicator shows remaining opponents. No final gold,
guardian research, reward choice, or full-team restoration occurs until the last
opponent falls. Shared battle XP is divided across the guardian team, preventing
additional opponents from multiplying the whole expedition's experience budget.

Starting with more Pokémon adds at most two levels to ordinary encounters and one
to guardians. Enemy scaling ignores IV quality, shininess, purchased upgrades,
and Pokémon caught later. Thus stronger collection specimens retain their actual
advantage, and recruiting during a run does not suddenly strengthen its enemies.
All values are in `TEAM_PROGRESSION` in `src/engine/config.ts`.

Existing active saves preserve their encounter, party, and the older solo-guardian
schedule; the new rules apply when starting another expedition. Multi-opponent
battles save and resume their queue, HP, PP, statuses, and defeated count.

For reproducible UI QA, development builds accept an empty isolated slot with
`?playtest=your-test-slot&fixture=full-team` (owned-six lobby) or
`?playtest=your-test-slot&fixture=guardian-team` (first-guardian checkpoint).
Fixtures never overwrite existing saves and are disabled in production and on
regular save URLs. Simulation fixtures are also test-only collections.

## Reset and developer tools

**Menu → Reset all progress** asks for confirmation, then clears the collection,
research, upgrades, records, current run, and local balance/developer settings.
Reloading returns to the one-time first-partner choice. Cancelling keeps progress.
Only this save slot is affected; named playtest slots remain isolated.

**Menu → Field lab → Enable all Pokémon shinies** makes every newly generated
encounter shiny, including elites and guardians. It saves immediately. Turning it
off restores your configured shiny rarity. Existing specimens keep their identity;
it does not unlock species or convert the collection. Captures made in test mode
remain in the local collection until reset.

Shinies have a short starburst entrance, an expanding ring, and a gentle sparkle
orbit on both front and rear sprites. Reduced-motion preferences keep a static glow.

## Attack presentation

Moves now have type-colored projectiles, an attacker lunge, impact particles,
recoil, and brief damage/status feedback. The curated effects cover all 18 types.
The actual turn result supplies Speed order, misses, immunities, status failures,
and fainting. Each move takes 480 ms; reduced-motion playback is shorter.
Inputs lock during playback. The resolved turn is saved before animation, so
refreshing cannot repeat its damage or rewards.

[PokéAPI's move endpoint](https://pokeapi.co/docs/v2#moves) supplies move data rather
than attack animation files. Small effect images are cached from the
[Pokémon Showdown effect directory](https://play.pokemonshowdown.com/fx/), with
our own animation/presentation code. See `THIRD_PARTY_ASSETS.md` and the source/hash
manifest in `public/assets/fx/sources.json`. Run `npm run import:effects` to refresh
them (requires curl and internet); gameplay itself stays local.

## Balance and architecture

- `src/engine/config.ts`: default balance controls, save version, run length, and party size.
- `src/engine/game.ts`: framework-independent rules, commands, seeded randomness, room generation, move definitions, capture calculations, progression, and save validation.
- `src/data/pokemon.json`: imported species, stats, types, and species catch rates.
- `src/data/types.json`: complete attack/defense effectiveness matrix.
- `src/App.tsx`: React interface, persistent discovery reveal, and local save adapter.
- `src/RouteMap.tsx`: public route planning, opponent types and guardian squad inspection.
- `src/engine/route.ts`: fixed room schedule, seeded species forecasts and the fast transition duration.
- `src/handheld.css`: handheld game frame, pixel font, overworld and command-box presentation.
- `src/PathChoice.tsx`: legacy swipe controls, retained for compatibility tests; not rendered by the current game.
- `src/engine/exploration.ts`: deliberate-gesture thresholds; short drags and vertical scrolls cancel.
- `src/exploration.css`: base exploration styling and reveal transitions.
- `src/play.css`: the focused scene layout, compact battle controls, rear-view perspective, and responsive tool sheets.
- `src/style.css`: responsive presentation and lightweight sprite effects.
- `public/assets/pokemon/`: all local normal/shiny front/back sprites.
- `scripts/import-pokemon.mjs`: repeatable, cached PokéAPI importer. Edit its species ID list and run `npm run import:pokemon` to refresh content. This is the only game-data step that needs the internet.

New runs commit the next fixed stop, then enter after a 120 ms reveal. The opponent forecast is generated from the seed independently of battle RNG. Repeated input cannot skip a stop, and reload resumes an existing commitment. Old active encounters are preserved without rerolling or converting the current map; a new expedition adopts the fixed route. Old starter saves upgrade safely when departing.

The first build intentionally uses React and ordinary web rendering rather than adding Phaser or a backend yet. The engine has no React or Firebase dependency, so either can be added without rewriting battle rules.

Capture formula:

```text
chance = clamp(
  speciesCatchRate / 255
  × (3 × maxHP - 2 × currentHP) / (3 × maxHP)
  × ballMultiplier × statusMultiplier × captureMultiplier × relicMultiplier,
  0.01, 0.95
)
```

Standard ball: ×1. Great Ball: ×1.5. Sleep: ×2. Other supported conditions: ×1.5. Prismatic Lens: ×1.25.

The Grounding Charm reduces extra weakness damage: `1 + (effectiveness - 1) × (1 - protection)`. At default 30% protection, ×2 becomes ×1.7. Resistances and immunities remain intact.

The curated move set uses simplified move powers and PP. Each species gets Quick Attack, a primary-type attack, a condition/stat move, and a stronger primary/secondary-type attack. Guardians use a stronger move-selection policy. Their actions are chosen before the player action resolves.

Experience uses `enemyLevel × 22 × experienceMultiplier`, with 70% shared to living reserves. The next level requires `currentLevel × 12` XP. Starters evolve at levels 10 and 18 for shorter runs. Gastly evolves at 12, Dratini at 12/20, and Magikarp at 10. All eight first-partner families now evolve: Zubat → Golbat at 12; Paras → Parasect at 12; Bellsprout → Weepinbell at 10 → Victreebel at 18; Geodude → Graveler at 10 → Golem at 18; Poliwhirl → Poliwrath at 16. Caterpie → Metapod at 7 → Butterfree at 10, and Haunter → Gengar at 20 are also supported. These short-run rules deliberately replace stone/trade requirements for these families; they are not mainline levels or methods. Golbat is currently terminal; Crobat/friendship and other missing families remain future work. An overdue living party member evolves on its next XP reward (even without a level gain) or camp recovery/training. Loading an existing battle preserves its current forms until that safe progression point. Pokémon details show the next level requirement, and an evolution announcement identifies the new form. All four normal/shiny front/back sprites are local. Evolution history registers in the field guide; subsequent runs still begin at the original collection form. Camps restore the team or offer one level of training.

## Managing duplicate catches

The collection groups individuals by the species they start as on the next run. Expand a group to choose individual team members, compare their IVs, or mark favorites. **Best overall** identifies the highest sum of all six IVs; **Best attacker** identifies the highest Attack or Special Attack IV plus Speed IV. Ties receive the same badge. These are comparison hints, not a promise about battle performance.

Cleanup suggestions require a retained individual of the same normal/shiny variant to equal or exceed **every** IV. Complementary specialists remain. Equivalent duplicates keep the protected individual first, then the oldest catch. Shinies, favorites, selected/active team members, and the last individual of each starting species are protected from release. Normal variants are never suggested solely because a shiny has higher IVs.

Review shows each released individual beside its retained counterpart and all six IVs. Cancel makes no change. Manual release also requires confirmation and can remove a specialist, with lower keeper IVs highlighted. Confirming grants **1 research per individual**, configured in `COLLECTION_POLICY.releaseResearch`. Release history prevents old run snapshots from restoring released catches or paying release rewards twice. Field-guide history remains recorded. Existing saves migrate with no favorites or released entries; active legacy teams are protected conservatively by their IV/variant match.

Development-only browser fixture: `?playtest=duplicates-qa&fixture=collection-duplicates` creates a seven-individual lobby with IV trade-offs, equivalent duplicates, a favorite, and a shiny. It runs only in the development server, requires an isolated playtest slot, and never overwrites existing progress.

## Verification

```sh
npm run verify
```

Tests cover type matchups and immunities, local sprite completeness, deterministic seeds, IVs, shiny bonuses, capture modifiers, six-member replacement, Speed and priority, switching, forced replacement, PP exhaustion, recoil, camps, shopping, defeat, victory, and save/resume. Route tests cover the published room schedule, forecasts versus actual encounters, guardian supports, independent RNG, saved commitments, duplicate-input protection and legacy continuity. Separate compatibility tests retain the old blind-path behavior. The legacy/control simulation preserves 51,000 full expeditions: 1,000 seeds per starter and cohort, covering the frozen original trio and all eight fresh, upgraded, and collected-shiny partners, plus mixed three-member, six-member, and perfect-shiny six-member collection fixtures. A further 128,000 legacy Quick Run checks and 192,000 current fixed-route runs compare control/public-forecast policies across modes, styles, cohorts and partners: 371,000 runs total. Public-route decisions may use the same species/types shown in the map, never hidden IVs, shinies or future rewards. Reports are saved in `reports/simulation.md` and `.json`; bot rates are development signals, not predicted human win rates.

For browser QA, add `?playtest` or a named slot such as `?playtest=onboarding-v2` to the local URL. Each slot isolates run, collection, research, and balance settings. Normal progress is saved atomically in `verdant.session.v2`; legacy standalone runs and older profiles migrate on load. Existing active encounters retain their HP and identity.

## Prototype boundaries

This is a complete small run loop, not a full Pokémon battle simulator. Abilities, natures, EVs, held-item slots, a full trainer campaign, comprehensive move effects, trading, PvP, and accounts are not implemented yet. Legacy elite encounters use one opponent. Guardians field one to three opponents based on the starting lineup. The run resets levels, temporary team state, money, and inventory; owned specimens and research persist.

Save storage is local and untrusted. There are no ranked results or cloud rewards. A later backend can reuse the engine and validate commands. Seed replay requires the same content/balance and player decisions.

## Sources

- Species, stats, catch rates, and type chart: https://pokeapi.co/docs/v2
- Sprite library including real shiny variants: https://github.com/PokeAPI/sprites
- Local fonts: Pixelify Sans (current game lettering), DM Sans and Manrope from Google Fonts, with included OFL licenses. Pixelify Sans source/license: `public/fonts/PixelifySans-SOURCE.md`.

Pokémon names and artwork belong to their respective rights holders. API access and this prototype do not grant publication or commercial rights. The data and asset paths are isolated to make later replacement straightforward.

## Discovery trail experiment

Choose **QUICK RUN** before departing. **JOURNEY** is the 18-stop mode (formerly Classic). Run style, hunt and budget options are available through OPTIONS. Starting a new expedition still asks before replacing an active run; existing saves are not converted into the experiment.

- Choose **Venom** (poison ticks heal your living lead) or **Relay** (first voluntary switch each battle halves the incoming hit). Every trail Pokémon receives Toxic Spores or Brace in its third move slot. Switching still spends a turn; fainted replacements remain free.
- Pick **New discovery**, **Careful catcher**, **Growing together**, or **Just explore**. New discovery is unavailable when all three forecast wild encounters are already owned. Completing a request records one permanent cosmetic field badge, even on a later loss. The request pays no research or permanent combat stats. Badges are visible in the research sheet; the run's progress and charms are available through the small flag/check button in the header.
- New fixed routes do not use scouting or left/right choices. The overworld already exposes the room sequence and species; exact traits and item offers remain discoveries.
- Six new charms support poison damage/catching/recovery and switching protection/power/recovery. They are exclusive to the experiment. Choose charms after battles and from caches; acquired charms are removed from subsequent offers.
- Three visible wild patterns introduce bracing, quick strikes and condition setup. The guardian cycles **Bracing → Heavy strike → Cleansing gust**; the final step clears its conditions that turn. A compact intent chip is shown before every action; its longer explanation is available on hover. Brace has priority and blocks 65% of one hit in the current turn.
- At camp, optionally open MOVE TUTOR to choose one team technique before resting or training. The lesson replaces the third move, is usable once per trail, survives evolution and expires with the run. The remaining three species/type moves stay intact.
- Growth is faster in this six-room format, with local levels and guardian HP tuned separately from Classic. All parameters live in `src/engine/trail.ts`. Normal and shiny identity, IVs and collected individuals persist normally; levels and trail charms reset.

The short mode has a separate simulation suite in `reports/trail-simulation.md` and `.json`. It compares an unchanged blind-direction control bot with a bot that responds to public battle intents/statuses. Neither reads hidden rooms or future encounters. Each style, first partner and fresh/upgraded/perfect-shiny/six-member cohort has at least 1,000 seeds per policy. These 128,000 legacy short expeditions and the 51,000 legacy/frozen-baseline campaigns remain controls. The current fixed-route suite adds 192,000 expeditions in `fixed-route-simulation.md` and `.json`. Bot results are not human win rates or proof of engagement. Venom and Relay are not yet equally strong; use the experiment for human playtesting before another content expansion.

## Clearer upgrades and friendlier openings

The next iteration strengthens the existing loop: **win → choose a reward → see its benefit → build strength during the run**. It adds no currencies, mastery trees, new upgrade effects or changes to level/evolution rules.

- Fixed-route battles now offer existing run upgrades earlier. Journey offers a relic alongside potions and capture supplies; Quick Run offers its existing charms alongside a potion choice. Fully collected pools fall back to useful supplies. New fixed routes do not offer gold, because their schedule has no merchant. Legacy saved offers retain their behavior.
- Reward buttons show real local item sprites, the benefit and RUN UPGRADE/SUPPLIES labels. Choosing an item shows a short pickup banner. Active starting upgrades and run charms appear in a compact icon bar; tap it for details.
- UPGRADES is directly available in the lobby, with a badge when a purchase is affordable. Permanent upgrades show potion, Poké Ball and HP Up sprites plus rank markers. Purchases affect the next run, never the active snapshot.
- Potions are accurately labeled **+2 potions**, used from the bag to heal up to 30 HP each. They do not heal immediately on reward selection. Potion, ball, berry and revive artwork also appears in the bag.
- The first two fixed-route encounters deal 15% less move damage and have a 30%-of-max-HP per-hit cap. Enemy levels and XP rewards stay unchanged, preserving growth and evolution timing. The later route and legacy damage rules are unchanged.

Run charms reset on a new expedition; collection identity and capped permanent starting upgrades persist. Item sprites are cached in `public/assets/items/`, with source hashes in `sources.json`. Refresh them with `npm run import:items`; no item API is called during gameplay.
