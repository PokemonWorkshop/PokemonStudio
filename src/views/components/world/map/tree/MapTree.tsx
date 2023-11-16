import React, { useState } from 'react';
import { ClearInput } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { MapList } from './MapList';
import { MapTreeComponent } from './MapTreeComponent';
import { emitScrollContextMenu } from '@utils/useContextMenu';
import { MapTreeContainer } from './style';

export const MapTree = () => {
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
