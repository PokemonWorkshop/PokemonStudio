import { ProjectText, useGlobalState } from '@src/GlobalStateProvider';

export const useProjectSavingLanguage = () => {
  const [state, setState] = useGlobalState();
  const setProjectSavingLanguage = (savingLanguage: string[]) => setState({ ...state, savingLanguage: savingLanguage }); // TODO: probably useless, so can be removed
  const addNewLanguageProjectText = (languageCode: string) => {
    const projectText: [string, string[][]][] = Object.entries(state.projectText);
    projectText.forEach(([, projectTextValue]) => {
      const hasLanguage = projectTextValue[0]?.find((header) => header === languageCode);
      if (!hasLanguage) {
        projectTextValue.forEach((line, index) => {
          if (index === 0) {
            return line.push(languageCode);
          }
          line.push('');
        });
      }
    });
    setState((state) => ({
      ...state,
      projectText: projectText.reduce((prev, [key, value]) => {
        prev[Number(key)] = value;
        return prev;
      }, {} as ProjectText),
    }));
  };

  return { savingLanguage: state.savingLanguage, setSavingLanguage: setProjectSavingLanguage, addNewLanguageProjectText };
};
