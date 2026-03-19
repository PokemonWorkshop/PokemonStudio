import styled from 'styled-components';
import { EventEmptyState } from '../../components/world/map/event/EventEmptyState';
import { PageContainerStyle } from '../database/PageContainerStyle';
import React from 'react';
import { EventEditor } from '@components/world/event/EventEditor';

export const EventPageStyle = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  ${PageContainerStyle} {
    padding-top: 16px;
  }
`;

export const EventPage = () => {
  const isDev = window.api.isDev;
  return isDev ? (
    <EventEditor />
  ) : (
    <EventPageStyle>
      <EventEmptyState />
    </EventPageStyle>
  );
};
