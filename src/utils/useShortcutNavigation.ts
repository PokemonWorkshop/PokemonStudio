import { ProjectData, SelectedDataIdentifier } from '@src/GlobalStateProvider';
import { useProjectData, useProjectPokemon } from './useProjectData';
import { NavigateFunction, useNavigate } from 'react-router-dom';
export interface IClickable {
  isClickable: boolean;
  callback: () => void;
}

export const useShortcutNavigation = <
  Key extends keyof ProjectData,
  SelectedIdentifier extends Exclude<keyof SelectedDataIdentifier, 'textInfo' | 'pokemon'>
>(
  key: Key,
  selected: SelectedIdentifier,
  path?: string
) => {
  const { setSelectedDataIdentifier } = useProjectData(key, selected);
  const navigate: NavigateFunction = useNavigate();

  return (dbSymbol: string) => {
    setSelectedDataIdentifier({ [selected]: dbSymbol } as Record<SelectedIdentifier, string>);

    if (path) navigate(path);
  };
};

export const usePokemonShortcutNavigation = () => {
  const { setSelectedDataIdentifier } = useProjectPokemon();
  const navigate: NavigateFunction = useNavigate();

  return (specie: string, form = 0) => {
    setSelectedDataIdentifier({ pokemon: { specie, form } });
    navigate('/database/pokemon');
  };
};
