import { useGlobalState } from '@src/GlobalStateProvider';

export const useImageSaving = () => {
  const [state, setState] = useGlobalState();

  const addImage = (destination: string, source: string) => {
    const updatedSavingImage = { ...state.savingImage, [destination]: source };
    setState({ ...state, savingImage: updatedSavingImage });
  };

  const removeImage = (destination: string) => {
    const updatedSavingImage = { ...state.savingImage };
    delete updatedSavingImage[destination];
    setState({ ...state, savingImage: updatedSavingImage });
  };

  const getImage = (destination: string): string | undefined => {
    return state.savingImage[destination];
  };

  return { addImage, removeImage, getImage };
};
