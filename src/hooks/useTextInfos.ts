import { StudioTextInfo } from '@modelEntities/textInfo';
import { useGlobalState } from '@src/GlobalStateProvider';
import { addSelectOption, removeSelectOption } from './useSelectOptions';

/**
 * Captain Hook of the Hooks. This hook allow you to manipulate textInfos data from a specific screen.
 * @example
 * const {
 *  textInfosValues: textInfos,
 *  setTextInfosValues: setTextInfos,
 * } = useTextInfos();
 */
export const useTextInfos = () => {
  const [state, setState] = useGlobalState();
  const textInfosValues = state.textInfos;
  const selectedDataIdentifier = state.selectedDataIdentifier['textInfo'];

  const setSelectedDataIdentifier = (newSelectedData: { textInfo: number }) => {
    setState((currentState) => ({
      ...currentState,
      selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
    }));
  };

  const setTextInfosValues = (newTextInfosValues: StudioTextInfo[], newSelectedData?: { textInfo: number }) => {
    if (JSON.stringify(newTextInfosValues) !== JSON.stringify(textInfosValues)) {
      setState((currentState) => {
        const newState = {
          ...currentState,
          textInfos: newTextInfosValues,
          selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
          savingTextInfos: true,
        };
        if (newTextInfosValues.length > currentState.textInfos.length) {
          addSelectOption('textInfos', newState);
        }
        if (newTextInfosValues.length < currentState.textInfos.length) {
          removeSelectOption('textInfos', String(currentState.selectedDataIdentifier.textInfo));
        }
        return newState;
      });
    } else {
      setState((currentState) => ({
        ...currentState,
        textInfos: newTextInfosValues,
        selectedDataIdentifier: { ...currentState.selectedDataIdentifier, ...newSelectedData },
      }));
    }
  };

  const getPreviousFileId = () => {
    const sortedValues = textInfosValues.sort((a, b) => b.fileId - a.fileId);
    return sortedValues.find(({ fileId }) => fileId < selectedDataIdentifier)?.fileId || sortedValues[0].fileId;
  };

  const getNextFileId = () => {
    const sortedValues = textInfosValues.sort((a, b) => a.fileId - b.fileId);
    return sortedValues.find(({ fileId }) => fileId > selectedDataIdentifier)?.fileId || sortedValues[0].fileId;
  };

  return {
    textInfosValues,
    currentTextInfo: state.textInfos.find((textInfo) => textInfo.fileId === selectedDataIdentifier) || state.textInfos[0],
    selectedDataIdentifier,
    setSelectedDataIdentifier,
    setTextInfosValues,
    getPreviousFileId,
    getNextFileId,
    state,
  };
};

/**
 * Captain Hook of the Hooks. This hook allow you to read text infos data from a specific screen.
 * @example
 * const {
 *  textInfosValues: textInfos,
 *  selectedDataIdentifier: fileId,
 *  state, // For specific use like text
 * } = useTextInfosReadonly;
 */
export const useTextInfosReadonly = () => {
  const [state] = useGlobalState();
  const selectedDataIdentifier = state.selectedDataIdentifier['textInfo'];

  return {
    textInfosValues: state.textInfos,
    currentTextInfo: state.textInfos.find((textInfo) => textInfo.fileId === selectedDataIdentifier) || state.textInfos[0],
    selectedDataIdentifier,
    state,
  };
};

export type UseTextInfosReturnType = ReturnType<typeof useTextInfos>;
