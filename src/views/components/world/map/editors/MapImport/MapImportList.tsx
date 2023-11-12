import React, { Dispatch, SetStateAction } from 'react';
import { MapImportFiles } from './MapImportType';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@components/Checkbox';
import { AutoSizer, List } from 'react-virtualized';
import { Input } from '@components/inputs';
import { cloneEntity } from '@utils/cloneEntity';
import { ReactComponent as ErrorIcon } from '@assets/icons/global/error2.svg';
import { useToolTip } from '@utils/useToolTip';

const MapImportListContainer = styled.div`
  ${({ theme }) => theme.fonts.normalRegular}
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};

  .header {
    display: grid;
    grid-template-columns: auto 308px;
    column-gap: 32px;
    color: ${({ theme }) => theme.colors.text400};
    padding-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark18};
    justify-content: left;
  }

  .map {
    display: grid;
    grid-template-columns: 18px 274px;
    column-gap: 16px;
    user-select: none;

    .filename {
      display: flex;
      align-items: center;
      gap: 8px;
      color: ${({ theme }) => theme.colors.text100};
      width: 274px;
      overflow: hidden;
      text-overflow: ellipsis;

      .icon {
        height: 18px;
      }

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  .list {
    height: 402px;
    margin-left: -8px;
    margin-right: -12px;

    & .scrollable-view {
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        margin-bottom: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background-color: ${({ theme }) => theme.colors.dark12};
        opacity: 0.8;
        box-sizing: border-box;
        border: 1px solid ${({ theme }) => theme.colors.text500};
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background-color: ${({ theme }) => theme.colors.dark15};
        border-color: ${({ theme }) => theme.colors.text400};
      }
    }
  }
`;

type MapLineContainerProps = { checked: boolean; hasError: boolean };

const MapLineContainer = styled.div<MapLineContainerProps>`
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 4px 4px 4px 8px;
  height: 40px;
  box-sizing: border-box;
  border-radius: 8px;

  .map {
    .filename {
      ${({ hasError, theme }) => hasError && `color: ${theme.colors.dangerBase}`};
    }
  }

  ${Input} {
    height: 32px;
    width: 100%;
  }

  ${({ checked, theme }) => checked && `background-color: ${theme.colors.dark19}`};

  :hover {
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;

type MapImportListType = {
  files: MapImportFiles[];
  setFiles: Dispatch<SetStateAction<MapImportFiles[]>>;
};

export const MapImportList = ({ files, setFiles }: MapImportListType) => {
  const { t } = useTranslation('database_maps');
  const { buildOnMouseEnter, onMouseLeave, renderToolTip } = useToolTip('map-import-tooltip');

  const allFilesChecked = (checked: boolean) => {
    setFiles(files.map((file) => ({ ...file, shouldBeImport: (file.shouldBeImport = checked) })));
  };

  const handleFileChecked = (checked: boolean, index: number) => {
    const filesCloned = cloneEntity(files);
    filesCloned[index].shouldBeImport = checked;
    setFiles(filesCloned);
  };

  const handleMapName = (newMapName: string, index: number) => {
    const filesCloned = cloneEntity(files);
    filesCloned[index].mapName = newMapName;
    setFiles(filesCloned);
  };

  return (
    <MapImportListContainer>
      <div className="header">
        <div className="map">
          <Checkbox checked={!files.some((file) => !file.shouldBeImport)} onChange={(event) => allFilesChecked(event.target.checked)} />
          <span>{t('file')}</span>
        </div>
        {t('map_name')}
      </div>
      <div className="list">
        <AutoSizer>
          {({ width, height }) => {
            return (
              <List
                className="scrollable-view"
                width={width}
                height={height}
                rowHeight={42}
                rowCount={files.length}
                rowRenderer={({ key, index, style }) => {
                  const file = files[index];
                  const hasError = file.error !== undefined;
                  return (
                    <MapLineContainer key={key} style={{ ...style, height: '40px' }} checked={file.shouldBeImport} hasError={hasError}>
                      <div className="map">
                        <Checkbox checked={file.shouldBeImport} onChange={(event) => handleFileChecked(event.target.checked, index)} />
                        <div className="filename">
                          <span>{file.filename}</span>
                          {hasError && (
                            <span className="icon" onMouseLeave={onMouseLeave} onMouseEnter={buildOnMouseEnter(file.error || '', 'top-begin')}>
                              <ErrorIcon />
                            </span>
                          )}
                        </div>
                      </div>
                      <Input value={file.mapName} onChange={(event) => handleMapName(event.target.value, index)} />
                    </MapLineContainer>
                  );
                }}
                tabIndex={null}
              />
            );
          }}
        </AutoSizer>
      </div>
      {renderToolTip()}
    </MapImportListContainer>
  );
};
