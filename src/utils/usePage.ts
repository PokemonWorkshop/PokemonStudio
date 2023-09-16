import { StudioMove } from '@modelEntities/move';
import { getEntityNameTextUsingTextId, getEntityNameText, useGetEntityNameTextUsingTextId } from './ReadingProjectText';
import { useProjectDataReadonly } from './useProjectData';
import { useTextInfosReadonly } from './useTextInfos';
import { StudioDex } from '@modelEntities/dex';
import { StudioType } from '@modelEntities/type';

export const useAbilityPage = () => {
  const { projectDataValues: abilities, selectedDataIdentifier: dbSymbol, state } = useProjectDataReadonly('abilities', 'ability');
  const ability = abilities[dbSymbol];
  const abilityName = getEntityNameTextUsingTextId(ability, state);

  return {
    ability,
    abilityName,
    cannotDelete: Object.keys(abilities).length <= 1,
  };
};

export const useMovePage = () => {
  const { projectDataValues: moves, selectedDataIdentifier: dbSymbol, state } = useProjectDataReadonly('moves', 'move');
  const move: StudioMove = moves[dbSymbol];
  const moveName = getEntityNameText(move, state);

  return {
    move,
    moveName,
    cannotDelete: Object.keys(moves).length <= 1,
  };
};

export const useCreaturePage = () => {
  const { projectDataValues: creatures, selectedDataIdentifier: identifier, state } = useProjectDataReadonly('pokemon', 'pokemon');
  const creature = creatures[identifier.specie];
  const form = creature.forms.find((f) => f.form === identifier.form) || creature.forms[0];
  const creatureName = getEntityNameText(creature, state);

  return {
    creature,
    form,
    creatureName,
    formName: '',
    cannotDelete: Object.keys(creatures).length <= 1,
  };
};

export const useTextPage = () => {
  const { currentTextInfo } = useTextInfosReadonly();
  return {
    textInfo: currentTextInfo,
    cannotDelete: currentTextInfo.fileId >= 8997,
  };
};

export const useMapPage = () => {
  const { projectDataValues: maps, selectedDataIdentifier: dbSymbol, state } = useProjectDataReadonly('maps', 'map');
  const map = maps[dbSymbol];

  return {
    map,
    hasMap: dbSymbol !== '__undef__',
    hasMapModified: state.mapsModified.length !== 0,
  };
};

export const useDexPage = () => {
  const { projectDataValues: allPokemon } = useProjectDataReadonly('pokemon', 'pokemon');
  const { projectDataValues: allDex, selectedDataIdentifier: dbSymbol } = useProjectDataReadonly('dex', 'dex');
  const dex: StudioDex = allDex[dbSymbol];
  const cannot = Object.keys(allDex).length <= 1;

  return {
    dex,
    allPokemon,
    cannotDelete: cannot,
    cannotImport: cannot,
  };
};

export const useTypePage = () => {
  const { projectDataValues: types, selectedDataIdentifier: typeSelected } = useProjectDataReadonly('types', 'type');
  const getTypeName = useGetEntityNameTextUsingTextId();
  const currentType: StudioType = types[typeSelected] || types[typeSelected];

  return {
    types,
    typeDbSymbol: typeSelected,
    currentTypeName: getTypeName(currentType),
    currentType,
  };
};

export const useTrainerPage = () => {
  const { projectDataValues: trainers, selectedDataIdentifier: trainerSelected, state } = useProjectDataReadonly('trainers', 'trainer');
  const trainer = trainers[trainerSelected];
  const trainerName = getEntityNameText(trainer, state);

  return {
    trainer,
    trainerName,
    cannotDelete: Object.keys(trainers).length <= 1,
  };
};

export const useGroupPage = () => {
  const { projectDataValues: groups, selectedDataIdentifier: groupSelected, state } = useProjectDataReadonly('groups', 'group');
  const group = groups[groupSelected];
  const groupName = getEntityNameText(group, state);

  return {
    group,
    groupName,
    cannotDelete: Object.keys(groups).length <= 1,
  };
};
