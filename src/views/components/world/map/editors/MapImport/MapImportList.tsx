import ErrorIcon from '@assets/icons/global/error2.svg';
import { Checkbox } from '@components/Checkbox';
import { Input } from '@components/inputs';
import { Select } from '@ds/Select';
import { SelectContainer } from '@ds/Select/SelectContainer';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { cloneEntity } from '@utils/cloneEntity';
import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoSizer, List } from 'react-virtualized';
import styled from 'styled-components';
import { MapImportFiles } from './MapImportType';

const MapImportListContainer = styled.div`
  ${({ theme }) => theme.fonts.normalRegular}
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};

  .header {
    display: grid;
    grid-template-columns: 252px 192px auto;
    column-gap: 32px;
    color: ${({ theme }) => theme.colors.text400};
    padding-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark18};
    justify-content: left;
  }

  .map {
    display: grid;
    grid-template-columns: 18px 218px;
    column-gap: 16px;
    user-select: none;

    .filename-icon {
      display: flex;
      align-items: center;
      gap: 8px;
      color: ${({ theme }) => theme.colors.text100};
    }

    .filename-icon {
      .filename {
        width: 218px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .filename-with-error {
        width: 194px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

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
    height: 474px;
    margin-left: -8px;
    margin-right: -12px;

    ${SelectContainer} {
      width: 240px;
    }

    & .scrollable-view {
      & .ReactVirtualized__Grid__innerScrollContainer {
        overflow: visible !important; // fix the overflow to show the select options
      }

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
  height: 48px;
  box-sizing: border-box;
  border-radius: 8px;

  .map {
    .filename-icon {
      ${({ hasError, theme }) => hasError && `color: ${theme.colors.dangerBase}`};
    }
  }

  ${Input} {
    width: 192px;
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
  const { t } = useTranslation();
  const mapOptions = useSelectOptions('maps');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => [{ value: 'new', label: t('new_map') }, ...mapOptions], [mapOptions]);

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

  const handleMapId = (dbSymbol: string, index: number) => {
    const filesCloned = cloneEntity(files);
    filesCloned[index].dbSymbol = dbSymbol === 'new' ? undefined : dbSymbol;
    setFiles(filesCloned);
  };

  return (
    <MapImportListContainer>
      <div className="header">
        <div className="map">
          <Checkbox checked={!files.some((file) => !file.shouldBeImport)} onChange={(event) => allFilesChecked(event.target.checked)} />
          <span>{t('file')}</span>
        </div>
        <span>{t('map_in_studio')}</span>
        <span>{t('map_name')}</span>
      </div>
      <div className="list">
        <AutoSizer>
          {({ width, height }) => {
            return (
              <List
                className="scrollable-view"
                width={width}
                height={height}
                rowHeight={50}
                rowCount={files.length}
                rowRenderer={({ key, index, style }) => {
                  const file = files[index];
                  const hasError = file.error !== undefined;
                  return (
                    <MapLineContainer key={key} style={{ ...style, height: '48px' }} checked={file.shouldBeImport} hasError={hasError}>
                      <div className="map">
                        <Checkbox checked={file.shouldBeImport} onChange={(event) => handleFileChecked(event.target.checked, index)} />
                        <div className="filename-icon">
                          <span className={`filename${hasError ? '-with-error' : ''}`}>{file.filename}</span>
                          {hasError && (
                            <span className="icon" data-tooltip={file.error}>
                              <ErrorIcon style={{ pointerEvents: 'none' }} />
                            </span>
                          )}
                        </div>
                      </div>
                      <Input value={file.mapName} onChange={(event) => handleMapName(event.target.value, index)} />
                      <Select
                        value={file.dbSymbol === undefined ? 'new' : `${file.dbSymbol}`}
                        options={options}
                        onChange={(value) => handleMapId(value, index)}
                      />
                    </MapLineContainer>
                  );
                }}
                tabIndex={null}
              />
            );
          }}
        </AutoSizer>
      </div>
    </MapImportListContainer>
  );
};
