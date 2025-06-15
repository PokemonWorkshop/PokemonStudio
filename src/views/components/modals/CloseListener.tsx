import { useEffect, useRef } from 'react';
import { useSaveProjectAction } from '@src/hooks/useProjectSave/useSaveProjectAction';
import { useUnsavedWarning } from '@components/modals/unsavedWarningContext';

/**
 * React component that listens for application close requests and handles unsaved data warnings.
 *
 * When a close request is received (via `window.api.requestClose`), this component checks if there is unsaved data.
 * - If there is unsaved data, it opens a confirmation modal and, upon confirmation, saves the data before closing.
 * - If there is no unsaved data, it proceeds to close the application immediately.
 *
 * This component does not render any UI and should be mounted at the root of the application.
 *
 * @returns null
 */
export const CloseListener = () => {
  const { openModal, setOnConfirmQuit } = useUnsavedWarning();
  const { isDataToSave, handleSave } = useSaveProjectAction();

  const isDataToSaveRef = useRef(isDataToSave);
  useEffect(() => {
    isDataToSaveRef.current = isDataToSave;
  }, [isDataToSave]);

  useEffect(() => {
    const listener = async (_event: unknown, forceQuit = false) => {
      if (isDataToSaveRef.current) {
        setOnConfirmQuit(async () => {
          await handleSave();
          await window.api.safeClose(forceQuit);
        });
        openModal();
      } else {
        await window.api.safeClose(forceQuit);
      }
    };

    window.api.requestClose.on(listener);
    return () => {
      window.api.requestClose.removeListener(listener);
    };
  }, [openModal, setOnConfirmQuit, handleSave]);

  return null;
};
