// @hooks/useSaveProjectAction.ts
import { useProjectSave } from '@hooks/useProjectSave';
import { useLoaderRef } from '@utils/loaderContext';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { SaveEditorAndDeletionKeys } from '@components/save/SaveEditorOverlay';

export const useSaveProjectAction = () => {
  const { isDataToSave, isMapsToSave, save } = useProjectSave();
  const loaderRef = useLoaderRef();
  const dialogsRef = useDialogsRef<SaveEditorAndDeletionKeys>();

  const handleSave = async () => {
    const skipMapWarning = localStorage.getItem('neverRemindMeMapModification') === 'true';

    if (skipMapWarning || !isMapsToSave) {
      save(
        () => loaderRef.current.close(),
        ({ errorMessage }) => loaderRef.current.setError('saving_project_error', errorMessage)
      );
      return;
    }

    dialogsRef.current?.openDialog('map_warning', true);
  };

  return {
    handleSave,
    isDataToSave,
    isMapsToSave,
    dialogsRef,
  };
};
