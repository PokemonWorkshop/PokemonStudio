import { EventEmptyState } from '@components/world/event/common/EventEmptyState';
import { PageContainerStyle } from '../database/PageContainerStyle';
import { EventEditor } from '@components/world/event/EventEditor';
import { useEventPage } from '@src/hooks/usePage';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { EventEditorAndDeletionKeys, EventEditorOverlay } from '@components/world/event/editors/EventEditorOverlay';
import { EventV3Placeholder } from '@components/world/event/common/EventV3Placeholder';
import styled from 'styled-components';
import React from 'react';

export const EventPageStyle = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  ${PageContainerStyle} {
    padding-top: 16px;
  }
`;

export const EventPage = () => {
  const { event, hasEventAvailable } = useEventPage();
  const dialogsRef = useDialogsRef<EventEditorAndDeletionKeys>();
  const isDev = window.api.isDev;

  return isDev ? (
    hasEventAvailable ? (
      <EventEditor event={event} />
    ) : (
      <EventPageStyle>
        <EventEmptyState dialogsRef={dialogsRef} />
        <EventEditorOverlay ref={dialogsRef} />
      </EventPageStyle>
    )
  ) : (
    <EventPageStyle>
      <EventV3Placeholder />
    </EventPageStyle>
  );
};
