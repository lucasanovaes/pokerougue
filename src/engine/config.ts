export interface Balance {
  allShiny: boolean;
  shinyChance: number;
  shinyStatMultiplier: number;
  captureMultiplier: number;
  enemyStrength: number;
  experienceMultiplier: number;
  weaknessReduction: number;
}
// All balance knobs live here. The in-game Field Lab edits a local copy.
export const DEFAULT_BALANCE: Balance = {
  allShiny: false,
  shinyChance: 1 / 256,
  shinyStatMultiplier: 1.15,
  captureMultiplier: 1,
  enemyStrength: 1,
  experienceMultiplier: 1,
  weaknessReduction: 0.3,
};
export const SAVE_VERSION = 2;
export const RUN_LENGTH = 18;
export const PARTY_SIZE = 6;
export const COLLECTION_POLICY = {releaseResearch:1} as const;
export type TeamRule = 'open'|'budget';
export const TEAM_PROGRESSION = {
  wildLevelPerExtraPair: 1, maxWildLevelBonus: 2,
  bossLevelPerExtraThree: 1, maxBossLevelBonus: 1,
  bossTeamThresholds: [3,5],
  supportLevelLag: 1, supportHp: 0.85, bossExperience: 1,
  multiBossHp: [2,1.1,1.15],
  supports: [[12,25],[81,54],[111,123]],
} as const;
export const PROGRESSION = {
  discoveryMs: 300,
  starterLevel: 5,
  starterBudget: 6,
  roomExperience: 6,
  catchHpFloor: 0.6,
  catchLevelLag: 2,
  earlyMovePower: 45,
  // Curated move budgets keep the eight opening partners competitive.
  speciesMovePower: {41:1.35,46:1.2,69:0.75,61:0.7} as Record<number,number>,
  earlyHitCap: 0.4,
  fixedOpeningDamageMultiplier: 0.85,
  fixedOpeningHitCap: 0.3,
  bossLevels: [9, 14, 19],
  bossPower: [50, 55, 60],
  bossHp: [3.2, 1.1, 1.15],
  firstBossHitCap: 0.4,
  researchPerRoom: 1,
  researchPerDiscovery: 3,
  researchPerBoss: 5,
  maxChallenge: 3,
} as const;
export const FIRST_PARTNERS = [1,4,7,41,74,46,69,61] as const;
export const BASE_FORMS:Record<number,number> = {2:1,3:1,5:4,6:4,8:7,9:7,11:10,12:10,26:25,42:41,47:46,62:61,70:69,71:69,75:74,76:74,93:92,94:92,130:129,134:133,135:133,136:133,148:147,149:147};
// Short-run level rules intentionally simplify stone/trade methods for supported families.
export const EVOLUTIONS:Record<number,[number,number]> = {1:[10,2],2:[18,3],4:[10,5],5:[18,6],7:[10,8],8:[18,9],10:[7,11],11:[10,12],41:[12,42],46:[12,47],61:[16,62],69:[10,70],70:[18,71],74:[10,75],75:[18,76],92:[12,93],93:[20,94],147:[12,148],148:[20,149],129:[10,130]};
