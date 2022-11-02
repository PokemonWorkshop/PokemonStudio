import { ProjectData, projectTextSave, SelectedDataIdentifier, useGlobalState } from '@src/GlobalStateProvider';
import { SavingMap } from './SavingUtils';

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate data from a specific screen by specifying the data key & data selected key to be able to mutate data.
 * @note This Hook **SHOULD NEVER** be used with `useGlobalState()` or `useGlobalSelectedDataIdentifier()`! **This cause data inconsistency**. If you need anything, this hook returns everything you need, just pass the result to children of your page!
 * @note This Hook is type safe as long as you use the corresponding `selected` key that should match the `key` you use to access data.
 * @example
 * const {
 *  projectDataValues: items,
 *  selectedDataIdentifier: itemDbSymbol,
 *  setSelectedDataIdentifier,
 *  setProjectDataValues: setItems,
 *  bindProjectDataValue: bindItem,
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
export const useProjectData = <Key extends keyof ProjectData, SelectedIdentifier extends keyof SelectedDataIdentifier>(
  key: Key,
  selected: SelectedIdentifier
) => {
  const [state, setState] = useGlobalState();

  const setSelectedDataIdentifier = (newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    setState((currentState) => ({
      ...currentState,
      selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
    }));
  };

  const setProjectDataValues = (newDataValues: Partial<ProjectData[typeof key]>, newSelectedData?: Pick<SelectedDataIdentifier, typeof selected>) => {
    const id = String(Object.keys(newDataValues)[0]);
    setState((currentState) => {
      const projectDataValues = currentState.projectData[key];
      if (JSON.stringify(newDataValues[id]) !== JSON.stringify(projectDataValues[id])) {
        return {
          ...currentState,
          projectData: { ...currentState.projectData, [key]: { ...projectDataValues, ...newDataValues } },
          selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
          savingData: new SavingMap(currentState.savingData.set({ key, id }, 'UPDATE')),
          tmpHackHasTextToSave: projectTextSave.some((b) => b),
        };
      } else {
        return {
          ...currentState,
          projectData: { ...currentState.projectData, [key]: { ...projectDataValues, ...newDataValues } },
          selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
          tmpHackHasTextToSave: projectTextSave.some((b) => b),
        };
      }
    });
  };

  const bindProjectDataValue = (newData: ProjectData[typeof key][keyof ProjectData[typeof key]]) => {
    newData.projectText = { texts: state.projectText, config: state.projectConfig.language_config };
    return newData;
  };

  const removeProjectDataValue = (identifier: keyof ProjectData[typeof key], newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    if (newSelectedData[selected] === identifier) {
      throw new Error(`When deleting ${String(identifier)} you cannot use ${JSON.stringify(newSelectedData)} as newSelectedData parameter.`);
    }
    setState((currentState) => {
      const newProjectDataValues = { ...currentState.projectData[key] };
      delete newProjectDataValues[identifier];
      return {
        ...currentState,
        projectData: { ...currentState.projectData, [key]: newProjectDataValues },
        selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
        savingData: new SavingMap(currentState.savingData.set({ key, id: String(identifier) }, 'DELETE')),
      };
    });
  };

  const getPreviousDbSymbol = (listObject: ProjectData[typeof key], currentId: number, minimumId = 1): string => {
    const entries = Object.entries(listObject);
    if (currentId <= minimumId)
      return entries.map(([value, itemData]) => ({ value, index: itemData.id })).filter((d) => d.index === entries.length - 1 + minimumId)[0].value;

    return entries.map(([value, itemData]) => ({ value, index: itemData.id })).filter((d) => d.index === currentId - 1)[0].value;
  };

  const getNextDbSymbol = (listObject: ProjectData[typeof key], currentId: number, minimumId = 1): string => {
    const entries = Object.entries(listObject);
    if (currentId >= entries.length - 1 + minimumId)
      return entries.map(([value, itemData]) => ({ value, index: itemData.id })).filter((d) => d.index === minimumId)[0].value;

    return entries.map(([value, itemData]) => ({ value, index: itemData.id })).filter((d) => d.index === currentId + 1)[0].value;
  };

  return {
    projectDataValues: state.projectData[key],
    selectedDataIdentifier: state.selectedDataIdentifier[selected],
    setSelectedDataIdentifier,
    setProjectDataValues,
    bindProjectDataValue,
    removeProjectDataValue,
    getPreviousDbSymbol,
    getNextDbSymbol,
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
