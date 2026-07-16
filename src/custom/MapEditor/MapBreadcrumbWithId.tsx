import React from 'react';
import theme from '@src/AppTheme';
import styled from 'styled-components';

import { useProjectMaps } from '@hooks/useProjectData';
import { useMapBreadcrumb } from '@hooks/useMapBreadcrumb';

/**
 * Fork-local copy of Studio's MapBreadcrumb that appends the map's numeric id to
 * the selected (last) crumb — e.g. "tester (22)" — so the map's RMXP/rxdata id
 * (the `Map###.rxdata` number, what events and transfers reference) is visible
 * at a glance in the map editor.
 *
 * Kept here, and used ONLY by MapEditorPage, rather than editing the upstream
 * MapBreadcrumb (which the Data tab also renders) — see [[project-studio-fork]].
 * Styling and click-to-navigate behaviour mirror the original.
 */

const MapBreadcrumbStyle = styled.div`
  user-select: none;
  cursor: default;
  width: 1024px;

  @media ${theme.breakpoints.dataBox422} {
    width: 504px;
  }

  span {
    font: ${theme.fonts.normalRegular};
    font-weight: 400;
    font-size: 14px;
    padding: 4px 8px 4px 8px;
    gap: 8px;

    &.breadcrumb-divider {
      color: ${theme.colors.text500};
      padding: 4px 2px 4px 2px;
      gap: 0px;
    }

    &.breadcrumb-disable {
      color: ${theme.colors.text500};
    }

    &.breadcrumb-selected {
      color: ${theme.colors.text100};
      font-weight: 500;
    }

    &.breadcrumb-default {
      color: ${theme.colors.text400};
      :hover {
        color: ${theme.colors.text400};
        background-color: ${theme.colors.dark16};
        border-radius: 4px;
        cursor: pointer;
      }
    }
  }
`;

type Crumb = { klass: string; name: string; mapDbSymbol?: string | undefined };

const breadcrumbStyling = (breadcrumb: Crumb[], selected: Crumb, i: number) => {
  if (breadcrumb.length > 1 && i === breadcrumb.length - 1) return 'breadcrumb-selected';
  return selected.klass === 'MapInfoFolder' ? 'breadcrumb-disable' : 'breadcrumb-default';
};

export const MapBreadcrumbWithId = () => {
  const { projectDataValues: maps, selectedDataIdentifier: currentDbSymbol, setSelectedDataIdentifier } = useProjectMaps();
  const map = maps[currentDbSymbol];
  const breadcrumb = useMapBreadcrumb(map.dbSymbol);

  const handleClick = (selected: Crumb) => {
    const dbSymbol = selected.mapDbSymbol || '';
    const isFolder = selected.klass === 'MapInfoFolder';
    const isDeleted = isFolder ? false : maps[dbSymbol] === undefined;
    if (isFolder || isDeleted) return;
    setSelectedDataIdentifier({ map: dbSymbol });
  };

  return (
    <MapBreadcrumbStyle>
      {breadcrumb.map((selected, i) => {
        // The last crumb is the open map — show its numeric id after the name.
        const isSelectedMap = i === breadcrumb.length - 1 && selected.klass !== 'MapInfoFolder';
        return (
          <React.Fragment key={i}>
            <span className={breadcrumbStyling(breadcrumb, selected, i)} onClick={() => handleClick(selected)}>
              {isSelectedMap ? `${selected.name} (${map.id})` : selected.name}
            </span>
            {i < breadcrumb.length - 1 ? <span className="breadcrumb-divider"> / </span> : null}
          </React.Fragment>
        );
      })}
    </MapBreadcrumbStyle>
  );
};
