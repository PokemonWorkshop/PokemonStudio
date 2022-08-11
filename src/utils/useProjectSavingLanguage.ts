import { useGlobalState } from '@src/GlobalStateProvider';

export const useProjectSavingLanguage = () => {
  const [state, setState] = useGlobalState();
  const setProjectSavingLanguage = (savingLanguage: string[]) => setState({ ...state, savingLanguage: savingLanguage });

  return { savingLanguage: state.savingLanguage, setSavingLanguage: setProjectSavingLanguage };
};
