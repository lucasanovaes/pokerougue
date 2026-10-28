# Clear progression without more systems

The intended next step is a clear existing loop: win an approachable encounter, choose a visible reward, notice the upgrade, then use the stronger team. No mastery tree, new currency, new charm effect, or leveling/evolution redesign was added.

## Changes

Existing relics now appear after ordinary fixed-route victories instead of remaining mostly hidden behind caches and guardians. Journey offers an available relic, potions and catching supplies. Quick Run offers existing charms with a potion choice. Exhausted pools fall back to useful supplies. Gold is omitted from new fixed-route offers because those routes have no merchant; old stored offers still work.

Each reward has a locally cached Pokémon item illustration, a prominent effect and a RUN UPGRADE or SUPPLIES label. The medicine label was corrected: its engine effect adds two potions, not immediate HP. It now explains that potions heal up to 30 HP when used from the bag. A selection produces a short visual pickup message; the message awards nothing and is not replayed as a second transaction on refresh.

A small icon bar shows actual owned charms and the active run's snapshotted permanent upgrades. Its detail sheet distinguishes THIS RUN from STARTING UPGRADE. It reads the run snapshot, not newly purchased profile ranks, so a purchase during a battle cannot falsely appear to strengthen that battle.

The lobby now has direct UPGRADES access and an affordable-purchase badge. The existing three permanent upgrade types use potion, Poké Ball and HP Up artwork and filled rank markers. Caps, costs and refunds remain unchanged. Potions, balls, berries and revives also use the same item sprites in the bag. No remote item API is needed during play.

To keep three choices visible together, reward scenes are shorter and capture celebrations compact. The benefit is prominent; the smaller line states when it applies. Details are not expanded into another permanent play-screen panel.

## Gentler opening

For the first two encounters of new fixed routes only, enemy move damage is multiplied by 0.85 and capped at 30% of the defending Pokémon's max HP per hit. Levels, IVs, species forecasts and XP payouts remain unchanged. This eases setup/catching without delaying evolution or making the later guardian curve use lower-level teammates. The shared knobs are in PROGRESSION. Existing legacy route policies retain their previous rules.

## Progression meaning

Run charms reset on the next expedition. Collection individuals, IVs, shiny ownership and capped permanent upgrades carry over. This remains a roguelite progression loop, with power choices during each run and a limited persistent head start. The purpose of this iteration is to make those benefits understandable before expanding the system.

## Validation and limits

Regression tests cover local sprite signatures/hashes, accurate item descriptions, configured weakness protection, reward scope, actual active snapshots, affordable upgrades, one-time claims, save/resume, useful fallback offers, early damage caps and unchanged XP. Browser checks use isolated desktop/mobile slots and verify real potion use, purchases, item pickup feedback and non-retroactive permanent upgrades.

The mandatory 371,000-expedition suite retains the frozen/legacy controls and current fixed-route cohorts. Earlier access to upgrades changes the strength curve as well as reward visibility, so any increased clear rate cannot be attributed to UI alone. Quick Run remains easier and Venom can be very strong; bot success is not a human win rate or evidence of replayability. Player feedback should determine the next small tuning change.
