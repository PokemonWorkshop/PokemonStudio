import { MOVE_BATTLE_STAGE_MOD_LIST, MOVE_STATUS_LIST, StudioBattleStageMod, StudioMove } from '@modelEntities/move';

export const isCustomStatus = (status: string) => {
  return !([...MOVE_STATUS_LIST, '__undef__'] as ReadonlyArray<string>).includes(status);
};

/**
 * Convert internal battleStageMod to a UI-friendly array that always contains all 7 stages.
 * Missing stages default to a modificator of 0.
 */
export const moveBattleStageToUI = (move: StudioMove): StudioBattleStageMod[] => {
  return MOVE_BATTLE_STAGE_MOD_LIST.map((stageType) => ({
    battleStage: stageType,
    modificator: move.battleStageMod.find(({ battleStage }) => battleStage === stageType)?.modificator ?? 0,
  }));
};

/**
 * Convert UI battleStageMod array back to internal format by filtering out zero modificators.
 */
export const uiToMoveBattleStage = (uiData: StudioBattleStageMod[]): StudioBattleStageMod[] => {
  return uiData.filter(({ modificator }) => modificator !== 0);
};
