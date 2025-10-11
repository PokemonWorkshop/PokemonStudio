import React, { useRef, useState } from 'react';
import { ClearInput } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { emitScrollContextMenu } from '@hooks/useContextMenu';
import { MapTreeContainer } from '../map/tree/style';
import styled from 'styled-components';

const EventTreeContainer = styled(MapTreeContainer)`
  .no-event {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
    padding: 9.5px 15px;
  }

  .tree-scrollbar {
    display: none; // Remove this when implement the event tree
  }
`;

export const EventTree = () => {
  const [research, setResearch] = useState('');
  const { t } = useTranslation();
  const treeScrollbarRef = useRef<HTMLDivElement>(null);

  return (
    <EventTreeContainer hideMapTree={research !== ''}>
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
      {/* TODO: integrate no event in the future tree like map tree */}
      <span className="no-event">{t('no_event_found')}</span>
    </EventTreeContainer>
  );
};
