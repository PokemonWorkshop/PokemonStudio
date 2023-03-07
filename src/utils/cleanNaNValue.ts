import { StudioDisplayConfig, StudioSaveConfig, StudioSettingConfig, StudioTextConfig } from '@modelEntities/config';
import { StudioCreatureForm } from '@modelEntities/creature';
import { StudioExpandPokemonSetup, StudioGroupEncounter, StudioIvEv } from '@modelEntities/groupEncounter';
import { StudioItem } from '@modelEntities/item';
import { StudioMove } from '@modelEntities/move';
import { StudioQuest } from '@modelEntities/quest';
import { StudioTrainer } from '@modelEntities/trainer';
import { StudioZone } from '@modelEntities/zone';
import { ProjectData, State } from '@src/GlobalStateProvider';
import { getEntityNameText } from './ReadingProjectText';

/**
 * Replace NaN value by 0 or for the value given
 * @param value The value from which we want to remove NaN
 * @param replaceBy Replace NaN value by the value given. By default, the value is 0.
 * @returns The value without NaN
 */
export const cleanNaNValue = (value: number, replaceBy?: number) => {
  return isNaN(value) ? replaceBy || 0 : value;
};

export const cleaningDisplayNaNValues = (v: StudioDisplayConfig) => {
  v.gameResolution.x = cleanNaNValue(v.gameResolution.x, 320);
  v.gameResolution.y = cleanNaNValue(v.gameResolution.y, 240);
  v.windowScale = cleanNaNValue(v.windowScale, 1);
  v.tilemapSettings.tilemapSize.x = cleanNaNValue(v.tilemapSettings.tilemapSize.x, 22);
  v.tilemapSettings.tilemapSize.y = cleanNaNValue(v.tilemapSettings.tilemapSize.y, 17);
  v.tilemapSettings.autotileIdleFrameCount = cleanNaNValue(v.tilemapSettings.autotileIdleFrameCount, 1);
  v.tilemapSettings.characterTileZoom = cleanNaNValue(v.tilemapSettings.characterTileZoom, 0.5);
  v.tilemapSettings.characterSpriteZoom = cleanNaNValue(v.tilemapSettings.characterSpriteZoom, 0.5);
  v.tilemapSettings.center.x = cleanNaNValue(v.tilemapSettings.center.x);
  v.tilemapSettings.center.y = cleanNaNValue(v.tilemapSettings.center.y);
  v.tilemapSettings.maplinkerOffset.x = cleanNaNValue(v.tilemapSettings.maplinkerOffset.x);
  v.tilemapSettings.maplinkerOffset.y = cleanNaNValue(v.tilemapSettings.maplinkerOffset.y);
};

export const cleaningSaveNaNValues = (v: StudioSaveConfig) => {
  v.maximumSave = cleanNaNValue(v.maximumSave);
  v.saveKey = cleanNaNValue(v.saveKey);
};

export const cleaningSettingsNaNValues = (v: StudioSettingConfig) => {
  v.pokemonMaxLevel = cleanNaNValue(v.pokemonMaxLevel, 100);
  v.maxBagItemCount = cleanNaNValue(v.maxBagItemCount);
};

export const cleaningTextNaNValues = (v: StudioTextConfig) => {
  v.fonts.ttfFiles.forEach((ttfFile) => {
    ttfFile.id = cleanNaNValue(ttfFile.id);
    ttfFile.lineHeight = cleanNaNValue(ttfFile.lineHeight);
    ttfFile.size = cleanNaNValue(ttfFile.size);
  });
  v.fonts.altSizes.forEach((altSize) => {
    altSize.id = cleanNaNValue(altSize.id);
    altSize.lineHeight = cleanNaNValue(altSize.lineHeight);
    altSize.size = cleanNaNValue(altSize.size);
  });
  Object.values(v.messages).forEach((message) => {
    message.lineCount = cleanNaNValue(message.lineCount);
    message.borderSpacing = cleanNaNValue(message.borderSpacing);
    message.defaultColor = cleanNaNValue(message.defaultColor);
    message.defaultFont = cleanNaNValue(message.defaultFont);
  });
  Object.values(v.choices).forEach((choice) => {
    choice.borderSpacing = cleanNaNValue(choice.borderSpacing);
    choice.defaultColor = cleanNaNValue(choice.defaultColor);
    choice.defaultFont = cleanNaNValue(choice.defaultFont);
  });
};

export const cleaningCreatureFormNaNValues = (v: StudioCreatureForm) => {
  v.catchRate = cleanNaNValue(v.catchRate);
  v.hatchSteps = cleanNaNValue(v.hatchSteps);
  v.baseExperience = cleanNaNValue(v.baseExperience, 1);
  v.baseLoyalty = cleanNaNValue(v.baseLoyalty);
  v.baseHp = cleanNaNValue(v.baseHp);
  v.baseAtk = cleanNaNValue(v.baseAtk);
  v.baseDfe = cleanNaNValue(v.baseDfe);
  v.baseAts = cleanNaNValue(v.baseAts);
  v.baseDfs = cleanNaNValue(v.baseDfs);
  v.baseSpd = cleanNaNValue(v.baseSpd);
  v.evHp = cleanNaNValue(v.evHp);
  v.evAtk = cleanNaNValue(v.evAtk);
  v.evDfe = cleanNaNValue(v.evDfe);
  v.evAts = cleanNaNValue(v.evAts);
  v.evDfs = cleanNaNValue(v.evDfs);
  v.evSpd = cleanNaNValue(v.evSpd);
  v.itemHeld.forEach((itemHeld) => (itemHeld.chance = cleanNaNValue(itemHeld.chance)));
  v.frontOffsetY = cleanNaNValue(v.frontOffsetY);
};

export const cleaningItemNaNValues = (v: StudioItem) => {
  Object.entries(v).forEach(([key, value]) => {
    if (typeof value === 'number' && isNaN(value)) (v as unknown as Record<string, number>)[key] = key === 'eventId' ? 1 : 0;
  });
};

export const cleaningMoveNaNValues = (v: StudioMove) => {
  v.power = cleanNaNValue(v.power);
  v.accuracy = cleanNaNValue(v.accuracy);
  v.pp = cleanNaNValue(v.pp);
  v.priority = cleanNaNValue(v.priority);
  v.effectChance = cleanNaNValue(v.effectChance);
  v.mapUse = cleanNaNValue(v.mapUse);
  v.moveStatus.forEach((status) => (status.luckRate = cleanNaNValue(status.luckRate)));
  v.battleStageMod.forEach((bsm) => (bsm.modificator = cleanNaNValue(bsm.modificator)));
};

const removeExpandPokemonSetup = (encounter: StudioGroupEncounter, type: StudioExpandPokemonSetup['type']) => {
  const index = encounter.expandPokemonSetup.findIndex((eps) => eps.type === type);
  if (index !== -1) encounter.expandPokemonSetup.splice(index, 1);
};

const removeExpandPokemonSetupWithCondition = (
  encounter: StudioGroupEncounter,
  type: StudioExpandPokemonSetup['type'],
  condition: string | number
) => {
  const index = encounter.expandPokemonSetup.findIndex((eps) => eps.type === type && eps.value === condition);
  if (index !== -1) encounter.expandPokemonSetup.splice(index, 1);
};

const cleanNanValueEncounter = (encounter: StudioGroupEncounter) => {
  if (encounter.shinySetup.kind === 'rate') encounter.shinySetup.rate = cleanNaNValue(encounter.shinySetup.rate, 0);
  cleanNaNValue(encounter.randomEncounterChance, 1);
  if (encounter.levelSetup.kind === 'fixed') encounter.levelSetup.level = cleanNaNValue(encounter.levelSetup.level, 1);
  else {
    encounter.levelSetup.level.minimumLevel = cleanNaNValue(encounter.levelSetup.level.minimumLevel, 1);
    encounter.levelSetup.level.maximumLevel = cleanNaNValue(encounter.levelSetup.level.maximumLevel, 1);
  }
  type EvIvSetup = { value: StudioIvEv; type: 'evs' | 'ivs' };
  ['evs', 'ivs'].forEach((type) => {
    const ievs = encounter.expandPokemonSetup.find<EvIvSetup>((eps): eps is EvIvSetup => eps.type === type)?.value;
    if (!ievs) return;
    ievs.atk = cleanNaNValue(ievs.atk, 0);
    ievs.ats = cleanNaNValue(ievs.ats, 0);
    ievs.dfe = cleanNaNValue(ievs.dfe, 0);
    ievs.dfs = cleanNaNValue(ievs.dfs, 0);
    ievs.spd = cleanNaNValue(ievs.spd, 0);
    ievs.hp = cleanNaNValue(ievs.hp, 0);
  });
  const loyalty = encounter.expandPokemonSetup.find((eps) => eps.type === 'loyalty');
  if (loyalty) loyalty.value = cleanNaNValue(loyalty.value as number, 70);
  const rareness = encounter.expandPokemonSetup.find((eps) => eps.type === 'rareness');
  if (rareness) rareness.value = cleanNaNValue(rareness.value as number, -1);
};

export const cleanExpandPokemonSetup = (encounter: StudioGroupEncounter, species: ProjectData['pokemon'], isWild: boolean, state: State) => {
  cleanNanValueEncounter(encounter);
  removeExpandPokemonSetupWithCondition(encounter, 'ability', '__undef__');
  removeExpandPokemonSetupWithCondition(encounter, 'nature', '__undef__');
  removeExpandPokemonSetupWithCondition(encounter, 'itemHeld', '__undef__');
  removeExpandPokemonSetupWithCondition(encounter, 'caughtWith', 'poke_ball');
  removeExpandPokemonSetupWithCondition(encounter, 'gender', -1);
  removeExpandPokemonSetupWithCondition(encounter, 'givenName', '');
  removeExpandPokemonSetupWithCondition(encounter, 'rareness', -1);
  const specie = species[encounter.specie];
  if (specie) {
    removeExpandPokemonSetupWithCondition(encounter, 'givenName', getEntityNameText(specie, state));
    const form = specie.forms.find((f) => f.form === encounter.form);
    if (form) removeExpandPokemonSetupWithCondition(encounter, 'rareness', form.catchRate);
  }
  if (isWild) {
    removeExpandPokemonSetup(encounter, 'ivs');
    removeExpandPokemonSetup(encounter, 'caughtWith');
    removeExpandPokemonSetup(encounter, 'originalTrainerName');
    removeExpandPokemonSetup(encounter, 'originalTrainerId');
    removeExpandPokemonSetup(encounter, 'givenName');
    removeExpandPokemonSetup(encounter, 'itemHeld');
  } else {
    removeExpandPokemonSetup(encounter, 'rareness');
  }
};

export const cleaningTrainerNaNValues = (v: StudioTrainer) => {
  v.baseMoney = cleanNaNValue(v.baseMoney);
  v.bagEntries.forEach((bagEntry) => {
    bagEntry.amount = cleanNaNValue(bagEntry.amount, 1);
  });
  v.battleId = cleanNaNValue(v.battleId);
};

export const cleaningNaNToNull = (value: number | null): number | null => {
  if (value === null) return null;

  return isNaN(value) ? null : value;
};

export const cleaningZoneNaNValues = (v: StudioZone) => {
  v.panelId = cleanNaNValue(v.panelId);
  v.position.x = cleaningNaNToNull(v.position.x);
  v.position.y = cleaningNaNToNull(v.position.y);
  v.warp.x = cleaningNaNToNull(v.warp.x);
  v.warp.y = cleaningNaNToNull(v.warp.y);
};

export const cleaningQuestNaNValues = (v: StudioQuest) => {
  v.objectives.map(({ objectiveMethodName, objectiveMethodArgs }) => {
    switch (objectiveMethodName) {
      case 'objective_beat_npc':
        objectiveMethodArgs[2] = cleanNaNValue(objectiveMethodArgs[2] as number, 1);
        break;
      case 'objective_obtain_egg':
        objectiveMethodArgs[0] = cleanNaNValue(objectiveMethodArgs[0] as number, 1);
        break;
      case 'objective_obtain_item':
      case 'objective_beat_pokemon':
      case 'objective_catch_pokemon':
      case 'objective_hatch_egg':
        objectiveMethodArgs[1] = cleanNaNValue(objectiveMethodArgs[1] as number, 1);
        break;
    }
  });
  v.earnings.map(({ earningMethodName, earningArgs }) => {
    switch (earningMethodName) {
      case 'earning_money':
        earningArgs[0] = cleanNaNValue(earningArgs[0] as number, 100);
        break;
      case 'earning_item':
        earningArgs[1] = cleanNaNValue(earningArgs[1] as number, 1);
        break;
    }
  });
};
