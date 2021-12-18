import { ProjectData, projectTextSave, SelectedDataIdentifier, useGlobalState } from '@src/GlobalStateProvider';
import { SavingMap } from './SavingUtils';

export const useProjectDoubleData = <
  Key1 extends keyof ProjectData,
  Key2 extends keyof ProjectData,
  SelectedIdentifier extends keyof SelectedDataIdentifier
>(
  key1: Key1,
  key2: Key2,
  selected: SelectedIdentifier
) => {
  const [state, setState] = useGlobalState();
  const projectDataValues1 = state.projectData[key1];
  const projectDataValues2 = state.projectData[key2];

  const setSelectedDataIdentifier = (newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    setState({
      ...state,
      selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
    });
  };

  const setProjectDoubleDataValues = (
    newDataValues1: Partial<ProjectData[typeof key1]>,
    newDataValues2: Partial<ProjectData[typeof key2]>,
    newSelectedData?: Pick<SelectedDataIdentifier, typeof selected>
  ) => {
    const id1 = String(Object.keys(newDataValues1)[0]);
    const id2 = String(Object.keys(newDataValues2)[0]);
    if (
      JSON.stringify(newDataValues1[id1]) === JSON.stringify(projectDataValues1[id1]) &&
      JSON.stringify(newDataValues2[id2]) === JSON.stringify(projectDataValues2[id2])
    ) {
      setState({
        ...state,
        projectData: {
          ...state.projectData,
          [key1]: { ...projectDataValues1, ...newDataValues1 },
          [key2]: { ...projectDataValues2, ...newDataValues2 },
        },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    } else if (JSON.stringify(newDataValues1[id1]) === JSON.stringify(projectDataValues1[id1])) {
      setState({
        ...state,
        projectData: {
          ...state.projectData,
          [key1]: { ...projectDataValues1, ...newDataValues1 },
          [key2]: { ...projectDataValues2, ...newDataValues2 },
        },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        savingData: new SavingMap(state.savingData.set({ key: key2, id: id2 }, 'UPDATE')),
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    } else if (JSON.stringify(newDataValues2[id2]) === JSON.stringify(projectDataValues2[id2])) {
      setState({
        ...state,
        projectData: {
          ...state.projectData,
          [key1]: { ...projectDataValues1, ...newDataValues1 },
          [key2]: { ...projectDataValues2, ...newDataValues2 },
        },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        savingData: new SavingMap(state.savingData.set({ key: key1, id: id1 }, 'UPDATE')),
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    } else {
      setState({
        ...state,
        projectData: {
          ...state.projectData,
          [key1]: { ...projectDataValues1, ...newDataValues1 },
          [key2]: { ...projectDataValues2, ...newDataValues2 },
        },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        savingData: new SavingMap(new SavingMap(state.savingData.set({ key: key1, id: id1 }, 'UPDATE')).set({ key: key2, id: id2 }, 'UPDATE')),
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    }
  };

  const setProjectDataValues = (
    newDataValues: Partial<ProjectData[typeof key1]>,
    newSelectedData?: Pick<SelectedDataIdentifier, typeof selected>
  ) => {
    const id = String(Object.keys(newDataValues)[0]);
    if (JSON.stringify(newDataValues[id]) === JSON.stringify(projectDataValues1[id])) {
      setState({
        ...state,
        projectData: {
          ...state.projectData,
          [key1]: { ...projectDataValues1, ...newDataValues },
        },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    } else {
      setState({
        ...state,
        projectData: {
          ...state.projectData,
          [key1]: { ...projectDataValues1, ...newDataValues },
        },
        selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
        savingData: new SavingMap(state.savingData.set({ key: key1, id }, 'UPDATE')),
        tmpHackHasTextToSave: projectTextSave.some((b) => b),
      });
    }
  };

  const bindProjectDataValue = (
    newData1: ProjectData[typeof key1][keyof ProjectData[typeof key1]],
    newData2?: ProjectData[typeof key2][keyof ProjectData[typeof key2]]
  ) => {
    newData1.projectText = { texts: state.projectText, config: state.projectConfig.language_config };
    if (newData2) newData2.projectText = { texts: state.projectText, config: state.projectConfig.language_config };
    return { newData1, newData2 };
  };

  const removeProjectDataValue = (identifier: keyof ProjectData[typeof key1], newSelectedData: Pick<SelectedDataIdentifier, typeof selected>) => {
    if (newSelectedData[selected] === identifier) {
      throw new Error(`When deleting ${String(identifier)} you cannot use ${JSON.stringify(newSelectedData)} as newSelectedData parameter.`);
    }
    const newProjectDataValues = { ...projectDataValues1 };
    delete newProjectDataValues[identifier];
    setState({
      ...state,
      projectData: { ...state.projectData, [key1]: newProjectDataValues },
      selectedDataIdentifier: { ...state.selectedDataIdentifier, ...newSelectedData },
      savingData: new SavingMap(state.savingData.set({ key: key1, id: String(identifier) }, 'DELETE')),
    });
  };

  return {
    projectDataValues: projectDataValues1,
    projectDataValues2,
    selectedDataIdentifier: state.selectedDataIdentifier[selected],
    setSelectedDataIdentifier,
    setProjectDoubleDataValues,
    setProjectDataValues,
    bindProjectDataValue,
    removeProjectDataValue,
    state,
  };
};

export const useProjectZonesGroups = () => useProjectDoubleData('zones', 'groups', 'zone');
export type UseProjectZonesGroupsReturnType = ReturnType<typeof useProjectZonesGroups>;
export const useProjectPokemonDex = () => useProjectDoubleData('pokemon', 'dex', 'pokemon');
export type UseProjectPokemonDexReturnType = ReturnType<typeof useProjectPokemonDex>;
