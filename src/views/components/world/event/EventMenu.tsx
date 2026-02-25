import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NewFolderButtonOnlyIcon, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { NavigationDatabaseGroupStyle } from '@components/database/navigation/NavigationDatabaseGroup/NavigationDatabaseGroupStyle';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { SeparatorGreyLine } from '@components/separators/SeparatorGreyLine';
import { DbSymbol } from '../../../../models/entities/dbSymbol';
import { EVENT_NAME_TEXT_ID } from '../../../../models/entities/event/event';
import { useSetProjectText } from '../../../../utils/ReadingProjectText';
import { EventTree } from './EventTree';
import { EventEditorAndDeletionKeys, EventTreeEditorOverlay } from './editors/EventEditorOverlay';
import { createEvent } from '../../../../utils/entityCreation';

const EventMenuContainer = styled(NavigationDatabaseStyle)`
  ${NavigationDatabaseGroupStyle} {
    gap: 8px;
  }
  height: 100vh;
`;

const EventSubMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .buttons {
    display: flex;
    gap: 8px;

    .new {
      width: 100%;
    }
  }
`;

export const EventMenu = () => {
  const dialogsRef = useDialogsRef<EventEditorAndDeletionKeys>();
  const setText = useSetProjectText();
  const { t } = useTranslation();

  const handleNewFolder = () => {
    const newEvent = createEvent('event_folder_01' as DbSymbol, 1);

    setText(EVENT_NAME_TEXT_ID, newEvent.id, t('new_folder'));
  };

  // TODO: Remove isDev condition once events tree is finished.
  return (
    <EventMenuContainer>
      <NavigationDatabaseGroup title={t('events')}>
        <EventSubMenuContainer>
          <div className="buttons">
            <SecondaryButtonWithPlusIcon className="new" onClick={() => dialogsRef.current?.openDialog('new')} disabled={!window.api.isDev}>
              {t('new_event')}
            </SecondaryButtonWithPlusIcon>
            <NewFolderButtonOnlyIcon onClick={handleNewFolder} data-tooltip={t('new_folder')} disabled={!window.api.isDev} />
          </div>
          <SeparatorGreyLine />
          <EventTree />
        </EventSubMenuContainer>
      </NavigationDatabaseGroup>
      <EventTreeEditorOverlay ref={dialogsRef} />
    </EventMenuContainer>
  );
};
