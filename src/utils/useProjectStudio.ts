import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import { useGlobalState } from '@src/GlobalStateProvider';

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate projectStudio data from a specific screen.
 * @note This Hook **SHOULD NEVER** be used with `useGlobalState()`! **This cause data inconsistency**. If you need anything, this hook returns everything you need, just pass the result to children of your page!
 * @example
 * const {
 *  projectStudioValues: projectStudio,
 *  setProjectStudioValues: setProjectStudio,
 * } = useProjectStudio();
 */
export const useProjectStudio = () => {
  const [state, setState] = useGlobalState();
  const projectStudioValues = state.projectStudio;

  const setProjectStudioValues = (newStudioValues: ProjectStudioModel) => {
    if (JSON.stringify(newStudioValues) !== JSON.stringify(projectStudioValues)) {
      setState((currentState) => ({
        ...currentState,
        projectStudio: newStudioValues,
        savingProjectStudio: true,
      }));
    } else {
      setState((currentState) => ({
        ...currentState,
        projectStudio: newStudioValues,
      }));
    }
  };

  return {
    projectStudioValues,
    setProjectStudioValues,
    state,
  };
};

export type UseProjectStudioReturnType = ReturnType<typeof useProjectStudio>;
