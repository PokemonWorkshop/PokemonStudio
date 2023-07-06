import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMaps } from '@utils/useProjectData';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoSizer, List } from 'react-virtualized';
import styled from 'styled-components';

const MapTreeContainer = styled.div`
  height: 700px;
  ${({ theme }) => theme.fonts.normalMedium}

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

    & span {
      display: block;
      padding: 8px 16px;
      border-radius: 8px;
      box-sizing: border-box;
      ${({ theme }) => theme.fonts.normalMedium}
      color: ${({ theme }) => theme.colors.text400};
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    & span.current {
      color: ${({ theme }) => theme.colors.text100};
      background: ${({ theme }) => theme.colors.dark23};
    }

    & span:hover:not(span.current) {
      background-color: ${({ theme }) => theme.colors.dark22};
    }
  }
`;

export const MapTree = () => {
  const { projectDataValues: maps, selectedDataIdentifier: dbSymbol, setSelectedDataIdentifier } = useProjectMaps();
  const mapsList = useMemo(() => Object.values(maps), [maps]);
  const getMapName = useGetEntityNameText();
  const navigate = useNavigate();

  return (
    <MapTreeContainer>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <List
              className="scrollable-view"
              width={width}
              height={height}
              rowHeight={35}
              rowCount={mapsList.length}
              rowRenderer={({ key, index, style }) => {
                const map = mapsList[index];
                return (
                  <span
                    key={key}
                    className={dbSymbol === map.dbSymbol ? 'current' : ''}
                    onClick={() => {
                      setSelectedDataIdentifier({ map: map.dbSymbol });
                      navigate('/world/map');
                    }}
                    style={{ ...style, height: '35px' }}
                  >
                    {getMapName(map)}
                  </span>
                );
              }}
              tabIndex={null}
            />
          );
        }}
      </AutoSizer>
    </MapTreeContainer>
  );
};
