import { useGlobalState } from '@src/GlobalStateProvider';
import { DragEventHandler, useState } from 'react';
import { useChoosefile } from './useChooseFile';
import { useCopyFile } from './useCopyFile';
import { useShowItemInFolder } from './useShowItemInFolder';
import { dirname, join } from './path';

type Props = {
  name: string;
  path: string;
  extensions: string[];
  onResourceChoosen: (path: string) => void;
};

export const useResource = ({ name, path, extensions, onResourceChoosen }: Props) => {
  const [state] = useGlobalState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [flipFlap, setFlipFlap] = useState(false);
  const chooseFile = useChoosefile();
  const copyFile = useCopyFile();
  const showItemInFolder = useShowItemInFolder();

  const onDrop: DragEventHandler<HTMLDivElement> = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      copyFile(
        { srcFile: acceptedFiles[0].path, destFolder: dirname(path) },
        ({ destFile }) =>
          setTimeout(() => {
            onResourceChoosen(destFile);
            setFlipFlap((last) => !last);
          }),
        ({ errorMessage }) => window.api.log.error(errorMessage)
      );
    }
  };

  const onClick = async () => {
    setIsDialogOpen(true);
    chooseFile(
      { name, extensions, destFolderToCopy: dirname(path) },
      ({ path: resourcePath }) => {
        setTimeout(() => {
          onResourceChoosen(resourcePath);
          setFlipFlap((last) => !last);
          setIsDialogOpen(false);
        });
      },
      () => setIsDialogOpen(false)
    );
  };

  const onClickFolder = async (filePath: string, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation();
    if (!state.projectPath) return;

    showItemInFolder(
      { filePath: join(state.projectPath, filePath), extensions },
      () => {},
      () => {}
    );
  };

  const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    onDrop,
    onDragOver,
    onClick,
    onClickFolder,
    isDialogOpen,
    flipFlap,
  };
};
