import { getEntityNameTextUsingTextId } from './ReadingProjectText';
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
