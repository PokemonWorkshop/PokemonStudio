import { DbSymbol } from '@modelEntities/dbSymbol';
import { ProjectData, SelectedDataIdentifier, State, useGlobalState } from '@src/GlobalStateProvider';
import { getEntityNameText, getEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { SavingMap, SavingTextMap } from '@utils/SavingUtils';
import { buildTextUpdate, TextUpdate } from './updateProjectText';
import { addSelectOption, removeSelectOption } from './useSelectOptions';
import { buildCreaturesListByDexOrder } from '@utils/buildCreaturesListByDexOrder';

const getPreviousDbSymbolById = (values: { id: number; dbSymbol: DbSymbol }[], currentId: number) => {
  const sortedValues = values.sort((a, b) => b.id - a.id);
  return sortedValues.find(({ id }) => id < currentId)?.dbSymbol || sortedValues[0].dbSymbol;
};

type EntityTextIdWithDbSymbol = Parameters<typeof getEntityNameTextUsingTextId>[0] & { dbSymbol: DbSymbol };
type EntityIdWithDbSymbol = Parameters<typeof getEntityNameText>[0] & { dbSymbol: DbSymbol };
const getPreviousDbSymbolByName = (values: (EntityTextIdWithDbSymbol | EntityIdWithDbSymbol)[], currentDbSymbol: string, state: State) => {
  if (values.length === 0) return '__undef__';
  const sortedValues =
    'textId' in values[0]
      ? (values as EntityTextIdWithDbSymbol[]).sort((a, b) =>
          getEntityNameTextUsingTextId(a, state).localeCompare(getEntityNameTextUsingTextId(b, state))
        )
      : (values as EntityIdWithDbSymbol[]).sort((a, b) => getEntityNameText(a, state).localeCompare(getEntityNameText(b, state)));
  const keys = sortedValues.map(({ dbSymbol }) => dbSymbol);
  return keys[keys.indexOf(currentDbSymbol as DbSymbol) - 1] || keys[keys.length - 1];
};

const getNextDbSymbolById = (values: { id: number; dbSymbol: DbSymbol }[], currentId: number) => {
  const sortedValues = values.sort((a, b) => a.id - b.id);
  return sortedValues.find(({ id }) => id > currentId)?.dbSymbol || sortedValues[0].dbSymbol;
};

const getNextDbSymbolByName = (values: (EntityTextIdWithDbSymbol | EntityIdWithDbSymbol)[], currentDbSymbol: string, state: State) => {
  if (values.length === 0) return '__undef__';
  const sortedValues =
    'textId' in values[0]
      ? (values as EntityTextIdWithDbSymbol[]).sort((a, b) =>
          getEntityNameTextUsingTextId(a, state).localeCompare(getEntityNameTextUsingTextId(b, state))
        )
      : (values as EntityIdWithDbSymbol[]).sort((a, b) => getEntityNameText(a, state).localeCompare(getEntityNameText(b, state)));
  const keys = sortedValues.map(({ dbSymbol }) => dbSymbol);
  return keys[keys.indexOf(currentDbSymbol as DbSymbol) + 1] || keys[0];
};

export const getPreviousDbSymbolByDexOrder = (currentDbSymbol: string, state: State) => {
  const creaturesList = buildCreaturesListByDexOrder(state);
  const keys = creaturesList.map(({ dbSymbol }) => dbSymbol);
  return keys[keys.indexOf(currentDbSymbol as DbSymbol) - 1] || keys[keys.length - 1];
};

export const getNextDbSymbolByDexOrder = (currentDbSymbol: string, state: State) => {
  const creaturesList = buildCreaturesListByDexOrder(state);
  const keys = creaturesList.map(({ dbSymbol }) => dbSymbol);
  return keys[keys.indexOf(currentDbSymbol as DbSymbol) + 1] || keys[0];
};

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate data from a specific screen by specifying the data key & data selected key to be able to mutate data.
 * @note This Hook is type safe as long as you use the corresponding `selected` key that should match the `key` you use to access data.
 * @example
 * const {
 *  projectDataValues: items,
 *  selectedDataIdentifier: itemDbSymbol,
 *  setSelectedDataIdentifier,
 *  setProjectDataValues: setItems,
 *  removeProjectDataValue: deleteItem,
 * } = useProjectData('items', 'item');
 * // Change the item page
 * setSelectedDataIdentifier('master_ball');
 * // mutate an existing item
 * const mutatedBall = new BallItemModel();
 * // <- assign stuff
 * setItems({ master_ball: bindItem(mutatedBall) });
 * // Delete an item
 * deleteItem('master_ball', { item: 'poke_ball' }); // <- The second argument ensure that you don't fallback on the same item that was deleted!
 * @param key Key of the data collection you want to access from state.projectData
 * @param selected Key of the data identifier you want to access from state.selectedDataIdentifier
 */
export const useProjectData = <Key extends keyof ProjectData, SelectedIdentifier extends keyof Omit<SelectedDataIdentifier, 'textInfo'>>(
  key: Key,
  selected: SelectedIdentifier
) => {
  const [state, setState] = useGlobalState();
  const selectedDataIdentifier = state.selectedDataIdentifier[selected];

  const setSelectedDataIdentifier = (newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    setState((currentState) => ({
      ...currentState,
      selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
    }));
  };

  const setProjectDataValues = (
    newDataValues: Partial<ProjectData[typeof key]>,
    newSelectedData?: Pick<SelectedDataIdentifier, typeof selected>,
    textUpdates?: TextUpdate
  ) => {
    const id = String(Object.keys(newDataValues)[0]);
    setState((currentState) => {
      const projectDataValues = currentState.projectData[key];
      const { fileIdUpdatedTexts, projectText } = textUpdates
        ? buildTextUpdate(textUpdates, currentState)
        : { fileIdUpdatedTexts: [], projectText: currentState.projectText };
      if (JSON.stringify(newDataValues[id]) !== JSON.stringify(projectDataValues[id])) {
        const newState = {
          ...currentState,
          projectData: { ...currentState.projectData, [key]: { ...projectDataValues, ...newDataValues } },
          selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
          projectText,
          savingData: new SavingMap(currentState.savingData.set({ key, id }, 'UPDATE')),
          savingText: new SavingTextMap(currentState.savingText.setMultiple(fileIdUpdatedTexts, 'UPDATE')),
        };
        if (key === 'mapLinks') return newState;

        // Add the new text
        if (key === 'dex') {
          addSelectOption('dex', newState);
          addSelectOption('creatures', newState);
        } else {
          addSelectOption(key === 'pokemon' ? 'creatures' : key, newState);
        }
        return newState;
      } else {
        return {
          ...currentState,
          projectData: { ...currentState.projectData, [key]: { ...projectDataValues, ...newDataValues } },
          selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
          projectText,
        };
      }
    });
  };

  const removeProjectDataValue = (identifier: keyof ProjectData[typeof key], newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    if (newSelectedData[selected] === identifier) {
      throw new Error(`When deleting ${String(identifier)} you cannot use ${JSON.stringify(newSelectedData)} as newSelectedData parameter.`);
    }
    setState((currentState) => {
      const newProjectDataValues = { ...currentState.projectData[key] };
      delete newProjectDataValues[identifier];
      const newState = {
        ...currentState,
        projectData: { ...currentState.projectData, [key]: newProjectDataValues },
        selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
        savingData: new SavingMap(currentState.savingData.set({ key, id: String(identifier) }, 'DELETE')),
      };
      // Remove the text
      if (key !== 'mapLinks') removeSelectOption(key === 'pokemon' ? 'creatures' : key, String(identifier));
      return newState;
    });
  };

  const getPreviousDbSymbol = (mode: 'id' | 'name') => {
    const currentDbSymbol = typeof selectedDataIdentifier === 'string' ? selectedDataIdentifier : selectedDataIdentifier.specie;
    switch (mode) {
      case 'id':
        return getPreviousDbSymbolById(Object.values(state.projectData[key]), state.projectData[key][currentDbSymbol].id);
      case 'name':
        return getPreviousDbSymbolByName(Object.values(state.projectData[key]), currentDbSymbol, state);
      default:
        return ((v: never) => v)(mode);
    }
  };

  const getNextDbSymbol = (mode: 'id' | 'name') => {
    const currentDbSymbol = typeof selectedDataIdentifier === 'string' ? selectedDataIdentifier : selectedDataIdentifier.specie;
    switch (mode) {
      case 'id':
        return getNextDbSymbolById(Object.values(state.projectData[key]), state.projectData[key][currentDbSymbol].id);
      case 'name':
        return getNextDbSymbolByName(Object.values(state.projectData[key]), currentDbSymbol, state);
      default:
        return ((v: never) => v)(mode);
    }
  };

  return {
    projectDataValues: state.projectData[key],
    selectedDataIdentifier: selectedDataIdentifier,
    setSelectedDataIdentifier,
    setProjectDataValues,
    removeProjectDataValue,
    getPreviousDbSymbol,
    getNextDbSymbol,
    state,
  };
};

/**
 * Captain Hook of the Hooks. This hook allow you to read data from a specific screen by specifying the data key & data selected key.
 * @note This Hook is type safe as long as you use the corresponding `selected` key that should match the `key` you use to access data.
 * @example
 * const {
 *  projectDataValues: items,
 *  selectedDataIdentifier: itemDbSymbol,
 *  setSelectedDataIdentifier,
 *  state, // For specific use like text
 * } = useProjectData('items', 'item');
 * @param key Key of the data collection you want to access from state.projectData
 * @param selected Key of the data identifier you want to access from state.selectedDataIdentifier
 */
export const useProjectDataReadonly = <Key extends keyof ProjectData, SelectedIdentifier extends keyof Omit<SelectedDataIdentifier, 'textInfo'>>(
  key: Key,
  selected: SelectedIdentifier
) => {
  const [state] = useGlobalState();
  const selectedDataIdentifier = state.selectedDataIdentifier[selected];

  return {
    projectDataValues: state.projectData[key],
    selectedDataIdentifier: selectedDataIdentifier,
    state,
  };
};

export const useProjectPokemon = () => useProjectData('pokemon', 'pokemon');
export type UseProjectPokemonReturnType = ReturnType<typeof useProjectPokemon>;
export const useProjectMoves = () => useProjectData('moves', 'move');
export type UseProjectMoveReturnType = ReturnType<typeof useProjectMoves>;
export const useProjectItems = () => useProjectData('items', 'item');
export type UseProjectItemReturnType = ReturnType<typeof useProjectItems>;
export const useProjectQuests = () => useProjectData('quests', 'quest');
export type UseProjectQuestsReturnType = ReturnType<typeof useProjectQuests>;
export const useProjectTrainers = () => useProjectData('trainers', 'trainer');
export type UseProjectTrainersReturnType = ReturnType<typeof useProjectTrainers>;
export const useProjectTypes = () => useProjectData('types', 'type');
export type UseProjectTypesReturnType = ReturnType<typeof useProjectTypes>;
export const useProjectZones = () => useProjectData('zones', 'zone');
export type UseProjectZonesReturnType = ReturnType<typeof useProjectZones>;
export const useProjectAbilities = () => useProjectData('abilities', 'ability');
export type UseProjectAbilitiesReturnType = ReturnType<typeof useProjectAbilities>;
export const useProjectGroups = () => useProjectData('groups', 'group');
export type UseProjectGroupsReturnType = ReturnType<typeof useProjectGroups>;
export const useProjectDex = () => useProjectData('dex', 'dex');
export type UseProjectDexReturnType = ReturnType<typeof useProjectDex>;
export const useProjectMapLinks = () => useProjectData('mapLinks', 'mapLink');
export type UseProjectMapLinksReturnType = ReturnType<typeof useProjectMapLinks>;
export const useProjectMaps = () => useProjectData('maps', 'map');
export type UseProjectMapsReturnType = ReturnType<typeof useProjectMaps>;
