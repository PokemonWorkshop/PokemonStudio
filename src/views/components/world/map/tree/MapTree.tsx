import React, { useRef, useState } from 'react';
import { ClearInput } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { MapList } from './MapList';
import { MapTreeComponent } from './MapTreeComponent';
import { emitScrollContextMenu } from '@hooks/useContextMenu';
import { MapTreeContainer } from './style';

export const MapTree = () => {
  const [research, setResearch] = useState('');
  const { t } = useTranslation('database_maps');
  const treeScrollbarRef = useRef<HTMLDivElement>(null);

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
      <div className="tree-scrollbar" onScroll={emitScrollContextMenu} ref={treeScrollbarRef}>
        <div className="tree">
          <MapTreeComponent treeScrollbarRef={treeScrollbarRef} />
        </div>
      </div>
    </MapTreeContainer>
  );
};
