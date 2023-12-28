import { useGlobalState } from '@src/GlobalStateProvider';

export const useOpenTiled = () => {
  const [{ projectPath }] = useGlobalState();

  return (tiledMapFilename: string) =>
    projectPath &&
    window.api.openTiled(
      {
        tiledPath: 'C:/Program Files/Tiled/tiled.exe',
        projectPath,
        tiledMapFilename,
      },
      () => {},
      (e) => {
        alert(e.errorMessage); // TODO: Open dialog for error and setting up tiled path
      }
    );
};
