import { useGlobalState } from '@src/GlobalStateProvider';

export const useImageSaving = () => {
  const [state, setState] = useGlobalState();

  const addImage = (destination: string, source: string) => {
    setState((currentState) => ({ ...currentState, savingImage: { ...currentState.savingImage, [destination]: source } }));
  };

  const removeImage = (destination: string) => {
    setState((currentState) => {
      const updatedSavingImage = { ...currentState.savingImage };
      delete updatedSavingImage[destination];
      return { ...currentState, savingImage: updatedSavingImage };
    });
  };

  const getImage = (destination: string): string | undefined => {
    return state.savingImage[destination];
  };

  return { addImage, removeImage, getImage };
};
