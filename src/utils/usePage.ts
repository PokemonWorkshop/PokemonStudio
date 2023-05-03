import { getEntityNameTextUsingTextId, getEntityNameText } from './ReadingProjectText';
import { useProjectDataReadonly } from './useProjectData';
import { useTextInfosReadonly } from './useTextInfos';

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
  const move = moves[dbSymbol];
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
