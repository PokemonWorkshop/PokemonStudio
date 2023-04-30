import { getEntityNameTextUsingTextId, getEntityNameText } from './ReadingProjectText';
import { useProjectDataReadonly } from './useProjectData';

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
  //TODO: get data
  const texts = {
    filename: '100047',
    name: 'Phrases de victoire',
    description: "Ce fichier de texte contient les textes utilisés dans le cas d'une défaite du joueur contre un dresseur.",
    data: [] as never[],
  };
  return {
    texts,
    cannotDelete: false,
  };
};
