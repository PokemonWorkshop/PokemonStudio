import styled from 'styled-components';
import { EventEmptyState } from '../../components/world/map/event/EventEmptyState';
import { PageContainerStyle } from '../database/PageContainerStyle';
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
  return (
    <EventPageStyle>
      <EventEmptyState />
    </EventPageStyle>
  );
};
