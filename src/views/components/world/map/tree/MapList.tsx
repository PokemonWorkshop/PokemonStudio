import DotIcon from '@assets/icons/global/dot.svg';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useContextMenu } from '@hooks/useContextMenu';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useMapInfo } from '@hooks/useMapInfo';
import { useProjectMaps } from '@hooks/useProjectData';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioMapInfoValue } from '@modelEntities/mapInfo';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoSizer, List } from 'react-virtualized';
import styled from 'styled-components';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from '../editors/MapEditorOverlay';
import { MapTreeContextMenu } from './MapTreeContextMenu';

const MapListContainer = styled.div`
  height: calc(100vh - 291px);
  margin-top: 4px;

  & .scrollable-view {
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
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

    .map,
    .item-selected {
      display: flex;
      height: 35px;
      padding: 0px 8px;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      color: ${({ theme }) => theme.colors.text100};
      box-sizing: border-box;

      .name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        ${({ theme }) => theme.fonts.normalRegular}
      }

      .icon {
        display: flex;
        height: 18px;
        width: 18px;
        align-items: center;
        justify-content: center;
      }

      .point-icon {
        width: 2px;
        height: 2px;
        background-color: ${({ theme }) => theme.colors.text400};
        border-radius: 100%;
      }

      /* The "..." dot menu icon — hidden by default, shown on row hover.
         Mirrors the affordance in MapTreeComponent so the searched-list
         view feels the same as the unfiltered tree view. */
      .icon-dot {
        display: none;
        height: 24px;
        width: 24px;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        flex-shrink: 0;
        cursor: pointer;
        color: ${({ theme }) => theme.colors.text400};

        :hover {
          background-color: ${({ theme }) => theme.colors.dark22};
          color: ${({ theme }) => theme.colors.text100};
        }
      }

      :hover {
        background-color: ${({ theme }) => theme.colors.dark18};
        cursor: pointer;
      }

      :hover .icon-dot {
        display: flex;
      }
    }

    .item-selected {
      background-color: ${({ theme }) => theme.colors.dark20};

      :hover {
        background-color: ${({ theme }) => theme.colors.dark20};
      }
    }
  }

  .no-item-tree {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
    padding: 9.5px 15px;
  }
`;

const filter = (options: SelectOption[], research: string) => {
  if (research === '') return options;

  const researchLowerCase = research.toLowerCase();
  return options.filter((option) => option.label.toLowerCase().indexOf(researchLowerCase) !== -1);
};

type MapListProps = {
  research: string;
};

export const MapList = ({ research }: MapListProps) => {
  const { selectedDataIdentifier: currentMap, setSelectedDataIdentifier: setCurrentMap } = useProjectMaps();
  const { mapInfo } = useMapInfo();
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const [mapInfoSelected, setMapInfoSelected] = useState<StudioMapInfoValue>();
  const { t } = useTranslation();
  const options = useSelectOptions('maps');
  const optionsFiltered = useMemo(() => filter(options, research), [options, research]);

  // The MapList row only knows the map's dbSymbol; the context menu wants
  // the StudioMapInfoValue. Build a quick reverse-lookup once per render.
  const infoByDbSymbol = useMemo(() => {
    const out = new Map<DbSymbol, StudioMapInfoValue>();
    for (const value of Object.values(mapInfo)) {
      if (value.data.klass === 'MapInfoMap') out.set(value.data.mapDbSymbol, value);
    }
    return out;
  }, [mapInfo]);

  const openMenu = (dbSymbol: DbSymbol) => (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    const info = infoByDbSymbol.get(dbSymbol);
    if (!info) return;
    setMapInfoSelected(info);
    // Match MapTreeComponent: defer one tick so the selection state has
    // landed before the menu reads it.
    setTimeout(() => buildOnClick(event, true));
  };

  return (
    <>
      <MapListContainer>
        {optionsFiltered.length !== 0 ? (
          <AutoSizer>
            {({ width, height }) => {
              return (
                <List
                  className="scrollable-view"
                  width={width}
                  height={height}
                  rowHeight={39}
                  rowCount={optionsFiltered.length}
                  rowRenderer={({ key, index, style }) => {
                    const option = optionsFiltered[index];
                    const dbSymbol = option.value as DbSymbol;
                    return (
                      <div
                        className={currentMap === option.value ? 'item-selected' : 'map'}
                        key={`${option.value}-${key}`}
                        onClick={() => setCurrentMap({ map: option.value })}
                        onContextMenu={openMenu(dbSymbol)}
                        style={{ ...style, height: '35px' }}
                      >
                        <span className="icon">
                          <span className="point-icon" />
                        </span>
                        <span className="name">{option.label}</span>
                        <span className="icon icon-dot" onClick={openMenu(dbSymbol)}>
                          <DotIcon />
                        </span>
                      </div>
                    );
                  }}
                  tabIndex={null}
                />
              );
            }}
          </AutoSizer>
        ) : (
          <div className="no-item-tree">{t('no_map_found')}</div>
        )}
      </MapListContainer>
      {mapInfoSelected &&
        renderContextMenu(
          <MapTreeContextMenu
            mapInfoValue={mapInfoSelected}
            isDeleted={false}
            enableRename={() => { /* renaming in the search view isn't supported — use the tree */ }}
            dialogsRef={dialogsRef}
          />,
        )}
      <MapEditorOverlay ref={dialogsRef} />
    </>
  );
};
