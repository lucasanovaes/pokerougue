export interface Balance {
  shinyChance: number;
  shinyStatMultiplier: number;
  captureMultiplier: number;
  enemyStrength: number;
  experienceMultiplier: number;
  weaknessReduction: number;
}
// All balance knobs live here. The in-game Field Lab edits a local copy.
export const DEFAULT_BALANCE: Balance = {
  shinyChance: 1 / 256,
  shinyStatMultiplier: 1.15,
  captureMultiplier: 1,
  enemyStrength: 1,
  experienceMultiplier: 1,
  weaknessReduction: 0.3,
};
export const SAVE_VERSION = 1;
export const RUN_LENGTH = 18;
export const PARTY_SIZE = 6;
