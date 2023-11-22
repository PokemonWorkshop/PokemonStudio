import React from 'react';
import theme from '@src/AppTheme';
import styled from 'styled-components';

import { useProjectMaps } from '@utils/useProjectData';
import { useMapBreadcrumb } from '@utils/MapUtils';

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

const breadcrumbStyling = (
  breadcrumb: {
    klass: string;
    name: string;
    mapDbSymbol?: string | undefined;
  }[],
  selected: {
    klass: string;
    name: string;
    mapDbSymbol?: string | undefined;
  },
  i: number
) => {
  if (breadcrumb.length > 1 && i == breadcrumb.length - 1) return 'breadcrumb-selected';

  const isFolder = selected.klass === 'MapInfoFolder';
  if (isFolder) return 'breadcrumb-disable';
  if (!isFolder) return 'breadcrumb-default';
};

export const MapBreadcrumb = () => {
  const { projectDataValues: maps, selectedDataIdentifier: currentDbSymbol, setSelectedDataIdentifier } = useProjectMaps();
  const map = maps[currentDbSymbol];
  const breadcrumb = useMapBreadcrumb(map.dbSymbol);

  const handleClick = (selected: { klass: string; name: string; mapDbSymbol?: string }) => {
    const dbSymbol = selected.mapDbSymbol || '';
    const isFolder = selected.klass === 'MapInfoFolder';
    const isDeleted = isFolder ? false : maps[dbSymbol] === undefined;

    if (isFolder || isDeleted) return;

    setSelectedDataIdentifier({ map: dbSymbol });
  };

  return (
    <MapBreadcrumbStyle>
      {breadcrumb.map((selected, i) => (
        <React.Fragment key={i}>
          <span className={breadcrumbStyling(breadcrumb, selected, i)} onClick={() => handleClick(selected)}>
            {selected.name}
          </span>
          {i < breadcrumb.length - 1 ? <span className="breadcrumb-divider"> / </span> : null}
        </React.Fragment>
      ))}
    </MapBreadcrumbStyle>
  );
};
