import { useGlobalState } from '@src/GlobalStateProvider';
import { getSetting } from '../utils/settings';
import { MapDialogsRef } from '@components/world/map/editors/MapEditorOverlay';

export const useOpenTiled = () => {
  const [{ projectPath }] = useGlobalState();
  const tiledPath = getSetting('tiledPath');

  return (tiledMapFilename: string, dialogsRef: MapDialogsRef) =>
    projectPath &&
    window.api.openTiled(
      {
        tiledPath,
        projectPath,
        tiledMapFilename,
      },
      () => {},
      (e) => {
        window.api.log.error(e.errorMessage);
        dialogsRef.current?.openDialog('open_tiled_error', true);
      }
    );
};
