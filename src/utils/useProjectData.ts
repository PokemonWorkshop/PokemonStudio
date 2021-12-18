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
  const projectDataValues = state.projectData[key];

  const setSelectedDataIdentifier = (newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    setState({
      ...state,
      selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
    });
  };

  const setProjectDataValues = (newDataValues: Partial<ProjectData[typeof key]>, newSelectedData?: Pick<SelectedDataIdentifier, typeof selected>) => {
    const id = String(Object.keys(newDataValues)[0]);
    if (JSON.stringify(newDataValues[id]) !== JSON.stringify(projectDataValues[id])) {
      setState({
        ...state,
        projectData: { ...state.projectData, [key]: { ...projectDataValues, ...newDataValues } },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        savingData: new SavingMap(state.savingData.set({ key, id }, 'UPDATE')),
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    } else {
      setState({
        ...state,
        projectData: { ...state.projectData, [key]: { ...projectDataValues, ...newDataValues } },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    }
  };

  const bindProjectDataValue = (newData: ProjectData[typeof key][keyof ProjectData[typeof key]]) => {
    newData.projectText = { texts: state.projectText, config: state.projectConfig.language_config };
    return newData;
  };

  const removeProjectDataValue = (identifier: keyof ProjectData[typeof key], newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    if (newSelectedData[selected] === identifier) {
      throw new Error(`When deleting ${String(identifier)} you cannot use ${JSON.stringify(newSelectedData)} as newSelectedData parameter.`);
    }
    const newProjectDataValues = { ...projectDataValues };
    delete newProjectDataValues[identifier];
    setState({
      ...state,
      projectData: { ...state.projectData, [key]: newProjectDataValues },
      selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
      savingData: new SavingMap(state.savingData.set({ key, id: String(identifier) }, 'DELETE')),
    });
  };

  return {
    projectDataValues,
    selectedDataIdentifier: state.selectedDataIdentifier[selected],
    setSelectedDataIdentifier,
    setProjectDataValues,
    bindProjectDataValue,
    removeProjectDataValue,
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
