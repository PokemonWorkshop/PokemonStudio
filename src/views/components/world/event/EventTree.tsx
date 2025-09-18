import React, { useRef, useState } from 'react';
import { ClearInput } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { emitScrollContextMenu } from '@hooks/useContextMenu';
import { MapTreeContainer } from '../map/tree/style';

export const EventTree = () => {
  const [research, setResearch] = useState('');
  const { t } = useTranslation();
  const treeScrollbarRef = useRef<HTMLDivElement>(null);

  return (
    <MapTreeContainer hideMapTree={research !== ''}>
      <ClearInput
        value={research}
        onChange={(event) => setResearch(event.target.value)}
        onClear={() => setResearch('')}
        placeholder={t('event_research')}
        className="research-input"
      />
      <div className="tree-scrollbar" onScroll={emitScrollContextMenu} ref={treeScrollbarRef}>
        <div className="tree"></div>
      </div>
    </MapTreeContainer>
  );
};
