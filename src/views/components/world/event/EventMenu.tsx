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
import { useSetProjectText } from '../../../../utils/ReadingProjectText';
import { EventTree } from './EventTree';
import { EventEditorAndDeletionKeys, EventTreeEditorOverlay } from './editors/EventEditorOverlay';
import { useEventTree } from '../../../../hooks/useEventTree';
import { EVENT_FOLDER_NAME_TEXT_ID } from '../../../../models/entities/event/event-tree';
import { addNewEventTreeFolder, findEventHasFolder } from '../../../../utils/events/EventUtils';
import { useProjectEvents } from '../../../../hooks/useProjectData';

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
  const { eventTree, setEventTree } = useEventTree();
  const { selectedDataIdentifier: currentEvent } = useProjectEvents();

  const currentFolderInfo = currentEvent ? findEventHasFolder(eventTree, currentEvent as DbSymbol) : undefined;

  const handleNewFolder = () => {
    let index = 0;
    while (eventTree[`event_folder_${index}`]) index++;
    const dbSymbol = `event_folder_${index}` as DbSymbol;
    const textId = index;

    setText(EVENT_FOLDER_NAME_TEXT_ID, textId, t('new_folder'));
    setEventTree(
      addNewEventTreeFolder(eventTree, {
        id: dbSymbol,
        children: [],
        hasChildren: false,
        isExpanded: false,
        data: { klass: 'EventFolder', dbSymbol, id: textId },
      }),
    );
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
      <EventTreeEditorOverlay ref={dialogsRef} eventValue={currentFolderInfo} />
    </EventMenuContainer>
  );
};
