import { useGroupPage, useTrainerPage } from '@hooks/usePage';
import { CurrentBattlerType, PokemonBattlerFrom } from './PokemonBattlerEditorOverlay';
import { useProjectPokemon } from '@hooks/useProjectData';
import { useEffect, useMemo, useState } from 'react';
import { StudioExpandPokemonSetup, StudioGroupEncounter, StudioIvEv, createExpandPokemonSetup } from '@modelEntities/groupEncounter';
import { cloneEntity } from '@utils/cloneEntity';
import { createEncounter } from '@utils/entityCreation';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { cleanExpandPokemonSetup } from '@utils/cleanNaNValue';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { useUpdateGroup } from '@components/database/group/editors/useUpdateGroup';
import { ProjectData } from '@src/GlobalStateProvider';

type RecordExpandPokemonSetupValue = number | string | DbSymbol | DbSymbol[] | StudioIvEv;
export type RecordExpandPokemonSetup = Record<StudioExpandPokemonSetup['type'], RecordExpandPokemonSetupValue>;

const createOptionalExpandPokemonSetup = (encounter: StudioGroupEncounter) => {
  const keys = ['ability', 'nature', 'givenName', 'itemHeld', 'givenName', 'gender', 'caughtWith', 'rareness', 'ivs', 'evs', 'moves'] as const;
  keys.forEach(
    (key) => encounter.expandPokemonSetup.find((setup) => setup.type === key) || encounter.expandPokemonSetup.push(createExpandPokemonSetup(key))
  );
};

const createRecordExpandPokemonSetup = (
  encounter: StudioGroupEncounter,
  creatures: ProjectData['pokemon'],
  getEntityName: ReturnType<typeof useGetEntityNameText>
): RecordExpandPokemonSetup => {
  createOptionalExpandPokemonSetup(encounter);
  const { expandPokemonSetup } = encounter;
  const record = expandPokemonSetup.reduce((acc, obj) => {
    acc[obj.type] = obj.value;
    return acc;
  }, {} as RecordExpandPokemonSetup);
  // Update rareness and given name
  const specie = creatures[encounter.specie];
  record.rareness = record.rareness === -1 ? specie?.forms.find((form) => form.form === encounter.form)?.catchRate || 0 : record.rareness;
  record.givenName ||= specie ? getEntityName(specie) : '???';
  return record;
};

const buildExpandPokemonSetup = (record: RecordExpandPokemonSetup): StudioExpandPokemonSetup[] => {
  const keys = Object.keys(record) as (keyof RecordExpandPokemonSetup)[];
  return keys.map((key) => ({
    type: key,
    value: record[key],
  })) as StudioExpandPokemonSetup[];
};

const notBetween = (value: number, min: number, max: number) => value < min || value > max;
const cleanNullValue = (value: number, replaceBy?: number) => {
  return value === null || isNaN(value) ? replaceBy || 0 : value;
};
const stats = ['hp', 'atk', 'dfe', 'ats', 'dfs', 'spd'] as const;

export type PartialStudioGroupEncounter = Omit<StudioGroupEncounter, 'expandPokemonSetup'>;

type Props = {
  action: 'edit' | 'creation';
  currentBattler: CurrentBattlerType;
  from: PokemonBattlerFrom;
};

export const usePokemonBattler = ({ action, currentBattler, from }: Props) => {
  const { trainer } = useTrainerPage();
  const { group } = useGroupPage();
  const { projectDataValues: creatures, state } = useProjectPokemon();
  const updateTrainer = useUpdateTrainer(trainer);
  const updateGroup = useUpdateGroup(group);
  const getEntityName = useGetEntityNameText();
  const [canNew, setCanNew] = useState<boolean>(false);
  const [isChangeOrder, setIsChangeOrder] = useState<boolean>(false);

  const encounterInit = (): PartialStudioGroupEncounter => {
    if (action === 'edit') {
      switch (from) {
        case 'group': {
          const currentEncounter = cloneEntity(group.encounters[currentBattler.index]);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { expandPokemonSetup, ...partialEncounter } = currentEncounter;
          return partialEncounter;
        }
        case 'trainer': {
          const currentEncounter = cloneEntity(trainer.party[currentBattler.index]);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { expandPokemonSetup, ...partialEncounter } = currentEncounter;
          return partialEncounter;
        }
        default:
          assertUnreachable(from);
      }
    }
    const newEncounter = createEncounter(from === 'group');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { expandPokemonSetup, ...partialNewEncounter } = newEncounter;
    return partialNewEncounter;
  };

  const expandPokemonSetupInit = () => {
    if (action === 'edit') {
      switch (from) {
        case 'group':
          return createRecordExpandPokemonSetup(cloneEntity(group.encounters[currentBattler.index]), creatures, getEntityName);
        case 'trainer': {
          return createRecordExpandPokemonSetup(cloneEntity(trainer.party[currentBattler.index]), creatures, getEntityName);
        }
        default:
          assertUnreachable(from);
      }
    }
    const record = createRecordExpandPokemonSetup(createEncounter(from === 'group'), creatures, getEntityName);
    if (from !== 'group') record.originalTrainerName = getEntityName(trainer);
    return record;
  };

  const [encounter, setEncounter] = useState<PartialStudioGroupEncounter>(encounterInit());
  const [defaultEncounter] = useState<PartialStudioGroupEncounter>(encounter);
  const [expandPokemonSetup, setExpandPokemonSetup] = useState<RecordExpandPokemonSetup>(expandPokemonSetupInit());
  const [defaultExpandPokemonSetup] = useState<RecordExpandPokemonSetup>(expandPokemonSetup);
  const creatureUnavailable = useMemo(() => encounter.specie === '__undef__' || !creatures[encounter.specie], [creatures, encounter]);
  const formAvailable = useMemo(
    () =>
      !creatureUnavailable &&
      (creatures[encounter.specie].forms.length > 1 || !creatures[encounter.specie].forms.find((form) => form.form === encounter.form)),
    [creatures, encounter, creatureUnavailable]
  );

  const updateExpandPokemonSetup = (updates: Partial<RecordExpandPokemonSetup>) => {
    const updatedExpandPokemonSetup = {
      ...cloneEntity(expandPokemonSetup),
      ...updates,
    };
    setExpandPokemonSetup(updatedExpandPokemonSetup);
  };

  const updateEncounter = (updates: Partial<PartialStudioGroupEncounter>) => {
    const updatedEncounter = {
      ...cloneEntity(encounter),
      ...updates,
    };
    if (updatedEncounter.specie !== encounter.specie) {
      updatedEncounter.form = 0;
      const updatedGivenName = creatures[updatedEncounter.specie] ? getEntityName(creatures[updatedEncounter.specie]) : '???';
      const updatedRareness = creatures[updatedEncounter.specie]?.forms.find((form) => form.form === updatedEncounter.form)?.catchRate || 0;
      updateExpandPokemonSetup({ givenName: updatedGivenName, rareness: updatedRareness });
    }
    setEncounter(updatedEncounter);
  };

  const cleanEncounter = () => {
    const encounterCleaned = cloneEntity(encounter);
    const expandPokemonSetupCleaned = cloneEntity(expandPokemonSetup);
    // Replace NaN / null values by the default values
    if (action === 'edit') {
      encounterCleaned.randomEncounterChance = cleanNullValue(encounterCleaned.randomEncounterChance, defaultEncounter.randomEncounterChance);
      const levelSetup = encounterCleaned.levelSetup;
      const defaultLevelSetup = defaultEncounter.levelSetup;
      if (levelSetup.kind === 'fixed' && defaultLevelSetup.kind === 'fixed') {
        levelSetup.level = cleanNullValue(levelSetup.level, defaultLevelSetup.level);
      } else if (levelSetup.kind === 'minmax' && defaultLevelSetup.kind === 'minmax') {
        levelSetup.level.minimumLevel = cleanNullValue(levelSetup.level.minimumLevel, defaultLevelSetup.level.minimumLevel);
        levelSetup.level.maximumLevel = cleanNullValue(levelSetup.level.maximumLevel, defaultLevelSetup.level.maximumLevel);
      }
      encounterCleaned.shinySetup = isNaN(encounterCleaned.shinySetup.rate) ? defaultEncounter.shinySetup : encounterCleaned.shinySetup;
      expandPokemonSetupCleaned.loyalty = cleanNullValue(expandPokemonSetupCleaned.loyalty as number, defaultExpandPokemonSetup.loyalty as number);
      expandPokemonSetupCleaned.rareness = cleanNullValue(expandPokemonSetupCleaned.rareness as number, defaultExpandPokemonSetup.rareness as number);
      const defaultEvs = defaultExpandPokemonSetup.evs as StudioIvEv;
      const defaultIvs = defaultExpandPokemonSetup.ivs as StudioIvEv;
      stats.forEach((stat) => {
        const evs = expandPokemonSetupCleaned.evs as StudioIvEv;
        evs[stat] = cleanNullValue(evs[stat], defaultEvs[stat]);
      });
      stats.forEach((stat) => {
        const ivs = expandPokemonSetupCleaned.ivs as StudioIvEv;
        ivs[stat] = cleanNullValue(ivs[stat], defaultIvs[stat]);
      });
    }
    const newEncounter = { ...cloneEntity(encounterCleaned), expandPokemonSetup: buildExpandPokemonSetup(cloneEntity(expandPokemonSetupCleaned)) };
    cleanExpandPokemonSetup(newEncounter, creatures, from === 'group', state);
    return newEncounter;
  };

  const updateStudioEntity = () => {
    const newEncounter = cleanEncounter();
    switch (from) {
      case 'group': {
        const newEncounters = cloneEntity(group.encounters);
        if (action === 'creation') {
          newEncounters.push(newEncounter);
        } else {
          newEncounters[currentBattler.index] = newEncounter;
        }
        return updateGroup({ encounters: newEncounters });
      }
      case 'trainer': {
        const newParty = cloneEntity(trainer.party);
        if (action === 'creation') {
          newParty.push(newEncounter);
        } else {
          if (isChangeOrder && currentBattler.index !== 0) {
            newParty.splice(currentBattler.index, 1);
            newParty.unshift(newEncounter);
          } else {
            newParty[currentBattler.index] = newEncounter;
          }
        }
        return updateTrainer({ party: newParty });
      }
      default:
        assertUnreachable(from);
    }
  };

  const computeCanNew = () => {
    if (creatureUnavailable) return false;

    if (isNaN(encounter.randomEncounterChance) || notBetween(encounter.randomEncounterChance, 0, 100)) return false;

    const levelSetup = encounter.levelSetup;
    if (levelSetup.kind === 'fixed' && (isNaN(levelSetup.level) || notBetween(levelSetup.level, 1, 100))) return false;
    else if (levelSetup.kind === 'minmax') {
      const minLevel = levelSetup.level.minimumLevel;
      const maxLevel = levelSetup.level.maximumLevel;
      const pokemonMaxLevel = state.projectConfig.settings_config.pokemonMaxLevel;
      if (
        isNaN(minLevel) ||
        isNaN(maxLevel) ||
        notBetween(minLevel, 1, pokemonMaxLevel) ||
        notBetween(maxLevel, 1, pokemonMaxLevel) ||
        maxLevel < minLevel
      ) {
        return false;
      }
    }

    const shinySetup = encounter.shinySetup;
    if (shinySetup.kind === 'rate' && (isNaN(shinySetup.rate) || notBetween(shinySetup.rate, 0, 1))) return false;
    const loyalty = expandPokemonSetup.loyalty as number;
    if (isNaN(loyalty) || notBetween(loyalty, 0, 255)) return false;

    const rareness = expandPokemonSetup.rareness as number;
    if (isNaN(rareness) || notBetween(rareness, 0, 255)) return false;

    stats.forEach((stat) => {
      const evs = expandPokemonSetup.evs as StudioIvEv;
      const value = evs[stat];
      if (isNaN(value) || notBetween(value, 0, 9999)) return false;
    });

    stats.forEach((stat) => {
      const ivs = expandPokemonSetup.ivs as StudioIvEv;
      const value = ivs[stat];
      if (isNaN(value) || notBetween(value, 0, 9999)) return false;
    });

    return true;
  };

  const canClose = () => {
    if (action === 'creation') return true;

    if (notBetween(encounter.randomEncounterChance, 0, 100)) return false;

    const levelSetup = encounter.levelSetup;
    const defaultLevelSetup = defaultEncounter.levelSetup;
    const pokemonMaxLevel = state.projectConfig.settings_config.pokemonMaxLevel;
    if (levelSetup.kind === 'fixed' && defaultLevelSetup.kind === 'fixed' && notBetween(levelSetup.level, 1, pokemonMaxLevel)) {
      return false;
    } else if (levelSetup.kind === 'minmax' && defaultLevelSetup.kind === 'minmax') {
      const minLevel = levelSetup.level.minimumLevel;
      const maxLevel = levelSetup.level.maximumLevel;
      if (notBetween(minLevel, 1, pokemonMaxLevel) || notBetween(maxLevel, 1, pokemonMaxLevel) || maxLevel < minLevel) return false;
    }

    const shinySetup = encounter.shinySetup;
    if (shinySetup.kind === 'rate' && notBetween(shinySetup.rate, 0, 1)) return false;

    if (notBetween(expandPokemonSetup.loyalty as number, 0, 255)) return false;

    if (notBetween(expandPokemonSetup.rareness as number, 0, 255)) return false;

    stats.forEach((stat) => {
      const evs = expandPokemonSetup.evs as StudioIvEv;
      if (notBetween(evs[stat], 0, 9999)) return false;
    });
    stats.forEach((stat) => {
      const ivs = expandPokemonSetup.ivs as StudioIvEv;
      if (notBetween(ivs[stat], 0, 9999)) return false;
    });

    return true;
  };

  useEffect(() => {
    if (action === 'edit') return;

    setCanNew(computeCanNew());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter, expandPokemonSetup]);

  return {
    encounter,
    updateEncounter,
    expandPokemonSetup,
    updateExpandPokemonSetup,
    isChangeOrder,
    setIsChangeOrder,
    updateStudioEntity,
    canClose,
    canNew,
    creatureUnavailable,
    formAvailable,
    state,
  };
};
