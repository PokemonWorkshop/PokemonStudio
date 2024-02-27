import { StudioProject } from '@modelEntities/project';
import { useGlobalState } from '@src/GlobalStateProvider';

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate projectStudio data from a specific screen.
 * @example
 * const {
 *  projectStudioValues: projectStudio,
 *  setProjectStudioValues: setProjectStudio,
 * } = useProjectStudio();
 */
export const useProjectStudio = () => {
  const [state, setState] = useGlobalState();
  const projectStudioValues = state.projectStudio;

  const setProjectStudioValues = (newStudioValues: StudioProject) => {
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

/**
 * Captain Hook of the Hooks. This hook allow you to read projectStudio data from a specific screen.
 * @example
 * const {
 *  projectStudioValues: projectStudio,
 * } = useProjectStudioReadonly();
 */
export const useProjectStudioReadonly = () => {
  const [state] = useGlobalState();

  return {
    projectStudioValues: state.projectStudio,
    state,
  };
};

export type UseProjectStudioReturnType = ReturnType<typeof useProjectStudio>;
