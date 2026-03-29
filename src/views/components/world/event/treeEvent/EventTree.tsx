import React, { useRef, useState } from 'react';
import { ClearInput } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { emitScrollContextMenu } from '@hooks/useContextMenu';
import { MapTreeContainer } from '../../map/tree/style';
import styled from 'styled-components';
import { EventTreeComponent } from './EventTreeComponent';
import { EventList } from './EventList';

const EventTreeContainer = styled(MapTreeContainer)`
  .no-event {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
    padding: 9.5px 15px;
  }
`;

export const EventTree = () => {
  const { t } = useTranslation();
  const [research, setResearch] = useState('');
  const treeScrollbarRef = useRef<HTMLDivElement>(null);

  return (
    <EventTreeContainer isTiledMode={true} hideMapTree={research !== ''}>
      <ClearInput
        value={research}
        onChange={(event) => setResearch(event.target.value)}
        onClear={() => setResearch('')}
        placeholder={t('event_research')}
        className="research-input"
      />
      {research !== '' && <EventList research={research} />}
      <div className="tree-scrollbar" onScroll={emitScrollContextMenu} ref={treeScrollbarRef}>
        <EventTreeComponent treeScrollbarRef={treeScrollbarRef} />
      </div>
    </EventTreeContainer>
  );
};
