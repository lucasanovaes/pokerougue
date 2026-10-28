# Browser QA — collection onboarding and navigation

Validated against the local development server in isolated named playtest slots.
The regular player's save was not reset.

- Fresh account shows exactly eight partner choices, including Poliwhirl.
- Selecting Poliwhirl and confirming starts with Poliwhirl's rear sprite; reload preserves it.
- Restarting after onboarding shows Build your team, with only the owned partner.
- Caught Sandshrew in battle, restarted, selected it alongside the original partner,
  and reloaded. Both appear at level 5 with full HP; the catch remains in collection.
- Collection shows each specimen's individual IV total and starting cost.
- Research remained four across restarting and reloading after the first catch and room.
- Both Path A and Path B open an encounter after the configured 300 ms reveal.
- Desktop eight-choice layout checked at the default browser size. At 390 × 844,
  the content width was 390 with no horizontal overflow and all eight choices
  remained available. Collection selection and battle/capture flows were tested
  at that narrow size. The viewport override was reset afterward.

Automated regression tests separately cover first-choice immutability, legacy save
migration, no free starters, budget validation, saved collection identity, capped
upgrades/refunds, and reveal duration. See simulation.md for balance limits and results.

## Reset, shiny mode, and attack effects

Checked in the isolated `?playtest=shiny-reset-qa` slot, never resetting normal progress.

- Reset confirmation cancellation kept the two owned specimens, including shiny Pidgey.
- Confirmed the disposable test reset and reloaded: onboarding returned, collection
  count was zero, rarity was 256, and all-shiny mode was off.
- Enabled all-shiny mode, reloaded, and saw shiny encounters using actual alternate
  sprites and the ten-star aura. Previously caught shiny Pidgey also retained its
  rear sprite and aura when selected as lead and reloaded.
- Set rarity to 1024, enabled the override, then disabled it and reloaded: the
  toggle remained off and the configured rarity remained 1024.
- At 390 × 844, reset controls fit and no horizontal overflow occurred. Checked
  status and fire impacts in battle; corrected effects to measure the scene so
  art and labels keep their proportions. Restored the default viewport afterward.
- Desktop combat displayed both moves in actual order. A faster Butterfree's Sleep
  Powder landed before Pidgey's blocked action. Ember showed a fire projectile,
  impact, damage number, and target reaction; a knockout transitioned to rewards.
- Double-clicked Quick Attack and refreshed during playback: PP fell once (25 to
  24), the saved HP result resumed, and no duplicate turn or leftover lock appeared.
- Browser error log was empty at the checked point. Engine tests separately cover
  all 18 effect mappings, asset hashes, misses, immunity, status failure, switching,
  potions, KO suppression, and identical outcomes with presentation enabled/disabled.

Preview screenshots are saved alongside the project in the parent outputs folder.

## Discovery and collection iteration

Isolated slot: `?playtest=collection-iteration`. Existing regular game was read-only
checked and still displayed its saved expedition, party, and research.

- Captured normal Geodude and a shiny Bellsprout. Both displayed the dedicated reveal;
  the shiny used the alternate sprite and aura. Captures were accelerated with the
  existing capture-multiplier developer control in this test slot only.
- Field guide updated to three registered species and unlocked Trail Scout. The
  Seen filter showed exactly the three recorded entries; unknown entries hid names
  and artwork. Habitat/details controls worked.
- Collection name search returned one Bellsprout; shiny filter returned one specimen;
  ground filter returned only Geodude; IV ordering placed the strongest specimen first.
- Selecting Bulbasaur plus shiny Bellsprout exceeded six points and disabled start.
  Selecting Bulbasaur plus Geodude fit six points, showed 12/18 coverage and shared
  Ice weakness, and restored both level-five Pokémon after starting/reloading.
- At 390 × 844: no horizontal overflow, start button bottom at 802 px, responsive
  collection cards and field guide. Restored default viewport after testing.
- Saved before/after battle, collection, team builder, normal/shiny capture, and
  desktop/mobile field-guide screenshots. Checked browser console with no errors.

## Full collection teams and sequential guardians

Used explicit development-only isolated full-team and guardian checkpoints. These
fixtures cannot populate normal accounts, production builds, or existing saves.

- Normal mode selected six owned Pokémon with no point labels. Fill six slots kept
  the chosen lead; selecting Budget challenge blocked that same over-budget team.
  Returning to Normal re-enabled start.
- Started with all six, including shiny Pikachu, and reloaded. Team showed the six
  original species at level five, full HP, and the correct shiny sprite.
- Mobile 390 × 844: six preview sprites and six slots remained visible, no horizontal
  overflow, start button bottom at 696 px before the added one-line guardian hint.
  Corrected a selector-specificity issue that left unnecessary scenery height.
- Played all three first-guardian opponents through normal controls. Butterfree
  transitioned to Pikachu, then Eevee. Reloading after the first knockout retained
  Pikachu, 2/3 progress, and Charmander's injured HP.
- Switching Geodude into Pikachu spent the action and the enemy attacked; Electric
  immunity applied. Dig defeated Pikachu. Switched back to Charmander, used burn,
  potions, and attacks to finish Eevee.
- Reward choice appeared only after Eevee fell. All six teammates were restored.
  The menu showed 105 gold (45 + one 60-gold guardian award) and 10 research
  (five checkpoint rooms + one guardian award), not rewards for each opponent.
- Phone-sized guardian HUD displayed all three opponent indicators and 1/3 progress
  without overflow. Default viewport restored after testing. Browser error logs clear.

## Duplicate collection management — 2026-10-27

Verified the development server in `duplicate-browser-v1` and `duplicate-mobile-v1`, using the development-only `collection-duplicates` fixture. The regular save was not modified. Desktop viewport: 1280 × 720; narrow mobile: 390 × 844.

- Seven owned individuals render as one Bulbasaur card and a collapsed six-catch Pikachu group. Expanding displays six individual cards, separate IVs, shiny art, comparison badges, favorite controls and protected release controls. No nested buttons were found.
- The 138-IV keeper and its identical counterpart receive Best overall; the 62-IV fast specialist receives Best attacker. Suggestions contain only the 60-IV lower specimen and the identical extra, retaining the complementary attacker, favorite and shiny.
- Favoriting the lower specimen changes suggestions from two to one. Reload preserves the favorite. Unfavoriting restores two suggestions.
- Review shows all six IVs for both proposed releases, alongside a retained keeper and +2 research. Cancel keeps all seven and awards nothing. The normal team footer is hidden during review.
- Confirm leaves five individuals and awards two research. Reload retains five and exactly two research, with no further suggestions. No released specimen reappears.
- Manual review of the fast specialist clearly identifies manual selection and highlights the keeper's two lower IVs. Cancel preserves that specialist.
- Shiny and favorite release controls are disabled. Fill six slots selects only the five remaining owned individuals. Starting an expedition succeeds. The active normal individuals are then protected; these protections survive reload.
- At 390 × 844, the collection uses two columns, horizontal widths remain within the viewport, and the review's cancel/confirm controls remain reachable. Mobile release and subsequent expedition start were exercised. Viewport override was reset.

Screenshots: `../../verdant-duplicates-desktop.jpg`, `../../verdant-duplicates-mobile.jpg`, `../../verdant-release-review.jpg` (relative to this report).

Final automated verification: 139 tests pass; 51,000 blind-route simulations pass with zero invalid/non-terminating states; production build passes. Combat outcomes remain the same as the preceding full-team iteration. The saved simulation Markdown/JSON include all cohort and starter results. These bot results are not human win rates.

## Evolution repair and engagement review — 2026-10-27

Fresh opening walkthrough in `fun-benchmark-v1`: selected Zubat, applied poison to Clefairy, inspected capture odds, caught it with a Great Ball, selected supplies and entered the next encounter with Mankey. Reviewed the super-effective Wing Attack choice. This is an opening-loop walkthrough, not a claimed manual completion of the entire campaign.

Desktop evolution fixture (`evolution-desktop-v1`, 1280 × 720): inspected shiny Zubat at level 11 and saw “Evolves at level 12.” Camp training reached level 12, announced “Zubat evolved into Golbat!”, and displayed `/assets/pokemon/back/shiny/42.png`. Reload and inspection retained Golbat, the shiny boost, IVs, level 12 and the three missing HP (45/48).

Mobile overdue fixture (`evolution-mobile-v1`, 390 × 844): inspected a level-30 shiny Zubat and saw the overdue hint. Camp rest evolved it without requiring another level. Reload showed level-30 shiny Golbat at 103/103 HP with the real front shiny sprite. No horizontal overflow in the hint or detail sheet. Viewport reset afterward. Normal progress was not reset or changed.

Added 29 evolution tests covering every configured threshold, all offered partners, overdue chains, fainting, cap behavior, old encounter preservation, shiny/IV/source identity, collection history and fixture isolation. The engagement benchmark and full before/after simulation comparison are recorded separately. Screenshots live at `../../verdant-evolution-desktop.jpg` and `../../verdant-evolution-mobile.jpg`.

## Discovery trail experiment — 2026-10-27

Tested only isolated named playtest slots; normal progress was not reset. Desktop: 1280 × 720. Narrow mobile: 390 × 844, with the viewport reset afterward.

- In `discovery-live-v2`, selected Discovery trail and Careful catcher in the lobby, started with an actual owned shiny Zubat, used Toxic Spores on Jigglypuff, and made capture attempts. A successful conditioned catch completed the hunt and displayed the saved catch and three charm options. Reload preserved completion; selecting Toxic Fang added it to the detail sheet. The sheet recorded two HP actually restored by Venom Heart.
- Early QA caught the scout inside the existing hidden exploration action panel. It was moved into the world scene. Final behavior reserves its single charge from room 3, after the two opening capture opportunities. In `trail-fork-v1`, scouting displayed left tracks and a right glow; reload preserved both. Following the visible right glow reached a cache with charm choices. No exact encounter/species/reward appeared in the pre-commit clues.
- In `trail-mobile-guardian-v1`, the guardian's Bracing action advanced to Heavy strike, shown with its counter hint. Switching into Geodude took the announced enemy attack, reducing HP from 33 to 26 rather than giving a free turn. The following intent was Cleansing gust. Reload preserved one guarded hit and one switch in the detail sheet. No horizontal overflow at 390 × 844.
- In `trail-camp-mobile-v1`, selected Brace as the one-time team lesson, reloaded and confirmed the lesson controls were gone. Training evolved shiny Zubat to Golbat. At the next guardian encounter, Golbat's four moves still contained Brace in slot three. No horizontal overflow in camp or battle.
- In `trail-finish-v1`, the checkpoint was created through real engine evolution/battle commands. Selected the final charm, reached Expedition complete at room 6, and reloaded. The outcome retained Growing Together. Beginning another expedition returned to the owned collection and the six-room selector. Selecting Classic restored an 18-room header and removed the trail HUD. Inspecting the new team showed the original shiny Zubat at level 5 with full HP, preserving its shiny ownership.
- A scout is disabled at opening rooms and at the final guardian; duplicate charges and already-owned-only discovery requests are rejected by the engine. Field badges have no currency payout, are deduplicated on synchronization and remain earned after a later loss. These failure cases have regression coverage.

Screenshots (relative to this report): `../../verdant-trail-mobile.jpg`, `../../verdant-trail-scout.jpg`, `../../verdant-trail-complete.jpg`, and `../../verdant-trail-setup.jpg`. Simulation reports distinguish the blind control from the public-intent bot; their rates are not human win rates or a measure of fun.

## Fixed routes and handheld UI — 2026-10-27

Checked at 1280 × 720 and 390 × 844 in isolated named slots; the normal save was not reset. The existing 371,000-run verification combines 51,000 legacy/frozen-baseline campaigns, 128,000 legacy short runs and 192,000 current fixed-route runs. These are bot checks, not human retention or enjoyment measures.

- `handheld-lobby-v1`: the lobby exposes Quick Run/Journey, six slots, a route strip, PC BOX, OPTIONS and START. Filled six slots from owned specimens. The planning sheet showed Butterfree, Pikachu and Eevee for the guardian squad; selecting Pikachu displayed Electric typing. Departure retained that team. The first forecast Mankey matched the actual first opponent. The overworld contained no swipe arrows or scouting controls.
- Desktop battles opened with FIGHT/BAG/POKÉMON/RUN and hid the duplicate dock. FIGHT opened four moves; BACK returned to commands. Move type/PP stayed visible. Enemy exact HP was hidden visually and retained in its accessible label. Player HP, status, level and sprites remained visible.
- `handheld-mobile-v1`: selected Quick Run, opened OPTIONS, selected Careful catcher, and returned to the compact lobby. No horizontal overflow. The public forecast was Pidgey → Rattata → Item → Sandshrew → Camp → Eevee. Inspecting a future guardian replaced NEXT with BACK, preventing a misleading attempt to skip ahead. Returning to the current node entered the forecast Pidgey.
- On mobile, applied Toxic Spores, returned through commands to BAG and caught Pidgey with a Great Ball. The request completed; the capture screen showed only the celebration, name and SUMMARY action. Chose Toxic Fang and reloaded. The saved overworld marked Pidgey cleared and Rattata next. All six nodes fit within the map width.
- Mobile QA caught an inherited `.route-map` layout collision and stretched terrain. The new map has its own `overworld-map` class and measured SVG coordinates. Rechecked: terrain width 368 px inside a 390 px viewport, every node within bounds, square grass/tree proportions, no horizontal overflow.
- `handheld-camp-v1`: camp showed rest/train and a MOVE TUTOR entry. Opened the tutor sheet, selected Brace, reloaded and confirmed it stayed learned. Training evolved shiny Zubat to Golbat; the next guardian battle retained Brace among its four moves. Reload returned to the four battle commands while preserving Golbat at level 13.
- Resumed the older `trail-mobile-guardian-v1` save in the new UI. Its existing Eevee remained at 179/182 HP and Geodude at 26/33, with the same Cleansing gust intent after reload. The current encounter was not converted or rerolled.
- `handheld-finish-v1`: chose the final reward, reached completion at stop six, reloaded, then began another expedition and switched to Journey. The new run showed 1/18; inspecting the owned shiny Zubat showed level 5/full HP, preserving its shiny identity.

Final screenshots: `../../verdant-handheld-battle.jpg`, `../../verdant-handheld-route-mobile.jpg`, `../../verdant-handheld-battle-mobile.jpg`, and `../../verdant-handheld-lobby-mobile.jpg`. Advanced data and run mechanics remain available in sheets; visual simplification did not delete the collection, IVs, shinies, badges, upgrades or saved encounters.

## Upgrade visibility and gentle openings — 2026-10-27

Validated at 1280 × 720 and 390 × 844 using isolated `upgrade-icons-*`, `upgrade-permanent-v1` and `upgrade-lobby-mobile-v1` slots. Normal player progress was not reset.

- Reward choices loaded real local potion, Dragon Fang and Assault Vest sprites. Large labels showed +2 POTIONS, +15% DAMAGE and the configured weakness reduction. RUN UPGRADE and SUPPLIES separated persistent-in-run power from inventory rewards. All three choices fit vertically on desktop and mobile; no horizontal overflow.
- Selected Amber Fang: the +15% DAMAGE pickup banner appeared and its item icon entered the active upgrade bar. Reload retained one actual charm; opening the bar described Amber Fang as THIS RUN. The selection did not award the charm twice.
- On mobile selected potions: the bag count increased from four to six, while Bulbasaur remained at 15/20 HP. Using a potion then healed to 20/20 and reduced the count to five. The bag used actual ball, berry, potion and revive artwork.
- The lobby showed an UPGRADES button with an affordable-count badge. Its three buttons fit on a 390 px screen. The permanent sheet used Potion, Poké Ball and HP Up sprites, with filled rank markers after purchase.
- Purchased one Vitality rank and First aid, reloaded and started: the active bar showed two starting upgrades; Bulbasaur began at 21/21 HP instead of 20, and the bag held five potions instead of four.
- Purchased the second Vitality rank during that run: the active details continued to show +5% MAX HP, proving the already-created team did not receive the future +10% snapshot retroactively.
- Early QA exposed a checkpoint accidentally entering the guardian branch and inherited vertical reward-card layout. Both were corrected, fixture phase assertions added, and fresh isolated slots retested.

Screenshots: `../../verdant-upgrade-rewards.jpg`, `../../verdant-upgrade-rewards-mobile.jpg`, `../../verdant-upgrade-pickup.jpg`, and `../../verdant-permanent-upgrades.jpg`. Opening rules are covered by damage/XP regression tests and the complete simulation suite; no new progression system or currency was added.

## Capture animation — 28 October 2026

- Added a local-sprite Poké Ball/Great Ball arc, absorption flash, three shakes, and gold sparkle/click finish. Failed catches restore the wild sprite before the existing enemy attack animation.
- Desktop isolated slot `?playtest=capture-effects-oct28`: failed Poké Ball and Great Ball attempts consumed exactly one ball each and played the counterattack; successful Great Ball transitioned to the collection reveal and rewards.
- Mobile 390×844: successful Poké Ball throw stayed within the battle scene and transitioned to rewards. Ball artwork distinguishes regular and Great Balls. Interaction panel is inert during playback.
- Capture resolves and saves once before visual playback; reloading does not repeat the command. Reduced-motion mode uses a short static ball/result presentation.
- Production build passed. Regression tests and simulations were deliberately skipped at the user's explicit request. Catch probabilities, battle rules, engine data and save format were unchanged.
- Screenshots: `outputs/verdant-ball-throw-mobile.jpg`, `outputs/verdant-capture-effects.jpg` (workspace-relative).
