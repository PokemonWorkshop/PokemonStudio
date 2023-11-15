import React, { useState } from 'react';
import styled from 'styled-components';
import { ClearInput, Input } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { MapList } from './MapList';
import { MapTreeComponent } from './MapTreeComponent';
import { emitScrollContextMenu } from '@utils/useContextMenu';

type MapTreeContainerProps = {
  hideMapTree: boolean;
};

const MapTreeContainer = styled.div<MapTreeContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .tree-scrollbar {
    height: calc(100vh - 291px);
    overflow-y: scroll;
    margin-right: -9px;
    display: ${({ hideMapTree }) => (hideMapTree ? 'none' : 'block')};

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
  }

  .tree {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .research-input {
    height: 35px;
  }
`;

export const MapTreeV2 = () => {
  const [research, setResearch] = useState('');
  const { t } = useTranslation('database_maps');

  return (
    <MapTreeContainer hideMapTree={research !== ''}>
      <ClearInput
        value={research}
        onChange={(event) => setResearch(event.target.value)}
        onClear={() => setResearch('')}
        placeholder={t('map_research')}
        className="research-input"
      />
      {research !== '' && <MapList research={research} />}
      <div className="tree-scrollbar" onScroll={emitScrollContextMenu}>
        <div className="tree">
          <MapTreeComponent />
        </div>
      </div>
    </MapTreeContainer>
  );
};
