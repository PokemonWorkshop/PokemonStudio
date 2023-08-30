import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@components/Dialog';
import { useTranslation } from 'react-i18next';
import { DropInputFolder } from '@components/inputs';
import { showNotification } from '@utils/showNotification';
import { basename } from '@utils/path';
import type { MapImportFiles } from './MapImportType';
import { MapImportList } from './MapImportList';
import { DarkButton, PrimaryButton } from '@components/buttons';
import styled from 'styled-components';
import { useMapImport } from '@utils/useMapImport';
import { useLoaderRef } from '@utils/loaderContext';

const MapImportContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;

  .message {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    user-select: none;

    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
  }

  .bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    user-select: none;

    .right-action {
      display: flex;
      flex-direction: row;
      gap: 24px;
      align-items: center;

      .cancel {
        ${({ theme }) => theme.fonts.normalRegular}
        color: ${({ theme }) => theme.colors.text400};

        :hover {
          cursor: pointer;
        }
      }
    }
  }
`;

const defaultMapName = (filePath: string) => {
  const filename = basename(filePath, '.tmx');
  return filename.replaceAll('_', ' ');
};

type MapImportState = 'select_folder' | 'searching_files' | 'select_files' | 'import';

type MapImportProps = {
  closeDialog: () => void;
  closeParentDialog: () => void;
};

export const MapImport = ({ closeDialog, closeParentDialog }: MapImportProps) => {
  const { t } = useTranslation('database_maps');
  const loaderRef = useLoaderRef();
  const mapImport = useMapImport();
  const [state, setState] = useState<MapImportState>('select_folder');
  const [folderPath, setFolderPath] = useState<string | undefined>(undefined);
  const [files, setFiles] = useState<MapImportFiles[]>([]);
  const amountMapShouldBeImport = useMemo(() => files.filter((file) => file.shouldBeImport).length, [files]);
  const [hasError, setHasError] = useState<boolean>(false);

  const getSubTitle = () => {
    switch (state) {
      case 'select_folder':
        return t('import_select_folder');
      case 'searching_files':
      case 'select_files':
      case 'import':
        if (hasError) {
          return t('import_error');
        }
        return t('import_select_maps');
    }
  };

  const handleImport = () => setState('import');

  const disableImport = () => {
    return files.some((file) => (file.shouldBeImport && file.error) || !file.mapName);
  };

  useEffect(() => {
    switch (state) {
      case 'searching_files':
        return window.api.getFilePathsFromFolder(
          { folderPath: folderPath!, extensions: ['.tmx'], isRecursive: true },
          ({ filePaths }) => {
            setFiles(
              filePaths.map((filePath) => ({
                path: filePath,
                filename: basename(filePath),
                mapName: defaultMapName(filePath),
                shouldBeImport: false,
              }))
            );
            setState('select_files');
          },
          ({ errorMessage }) => {
            showNotification('danger', t('import_tiled_maps'), errorMessage);
            setFolderPath(undefined);
            setState('select_folder');
          }
        );
      case 'import': {
        const filesToImport = files.filter((file) => file.shouldBeImport);
        mapImport(
          { filesToImport, tiledFilesSrcPath: folderPath! },
          () => {
            // we wait the end of the close dialog animation to close the loader and show a notification
            setTimeout(() => {
              loaderRef.current.close();
              const message = filesToImport.length > 1 ? t('import_success_message_plurial') : t('import_success_message_singular');
              showNotification('success', t('import_tiled_maps'), message);
            }, 200);
            closeDialog();
            closeParentDialog();
          },
          (error, genericError) => {
            files.forEach((file) => {
              const err = error.find((err) => err.path === file.path);
              if (err) file.error = err.errorMessage;
            });
            if (genericError) {
              setTimeout(() => loaderRef.current.setError('importing_tiled_maps_error', genericError, true), 200);
              closeDialog();
              closeParentDialog();
              return;
            }
            loaderRef.current.close();
            setHasError(true);
            setState('select_files');
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog title={t('import_tiled_maps')} subTitle={getSubTitle()} closeDialog={closeDialog} hasError={hasError}>
      {state === 'select_folder' && (
        <DropInputFolder
          onFolderChoosen={(folderPath) => {
            if (folderPath) {
              setFolderPath(folderPath);
              setState('searching_files');
            }
          }}
        />
      )}
      {(state === 'select_files' || state === 'searching_files' || state === 'import') && (
        <MapImportContainer>
          {state === 'select_files' && files.length === 0 && <div className="message">{t('no_files_found')}</div>}
          {((state === 'select_files' && files.length > 0) || state === 'import') && <MapImportList files={files} setFiles={setFiles} />}
          {state === 'searching_files' && <div className="message">{t('searching_files')}</div>}
          <div className="bottom">
            <DarkButton
              onClick={() => {
                setFolderPath(undefined);
                setFiles([]);
                setState('select_folder');
                setHasError(false);
              }}
            >
              {t('back')}
            </DarkButton>
            <div className="right-action">
              <span className="cancel" onClick={closeDialog}>
                {t('cancel')}
              </span>
              {amountMapShouldBeImport === 0 && <PrimaryButton disabled>{t('import')}</PrimaryButton>}
              {amountMapShouldBeImport > 0 && (
                <PrimaryButton onClick={handleImport} disabled={disableImport()}>
                  {amountMapShouldBeImport === 1
                    ? t('import_selected_map_singular')
                    : t('import_selected_map_plurial', { amount: amountMapShouldBeImport })}
                </PrimaryButton>
              )}
            </div>
          </div>
        </MapImportContainer>
      )}
    </Dialog>
  );
};
