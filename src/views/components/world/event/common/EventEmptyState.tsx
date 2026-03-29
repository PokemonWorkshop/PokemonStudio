import React from 'react';
import { PageEmptyState } from '@components/pages';
import { useTranslation } from 'react-i18next';
import MapIcon from '@assets/icons/navigation/map-icon.svg';
import { EventDialogsRef } from '../editors/EventEditorOverlay';
import { PrimaryButton, SecondaryButton } from '@components/buttons';
import styled from 'styled-components';

export const EventEmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;

  .helper {
    text-align: center;
    ${({ theme }) => theme.fonts.normalSmall}
    color: ${({ theme }) => theme.colors.text400};
  }

  ${PrimaryButton},
  ${SecondaryButton} {
    width: 100%;
  }
`;

type EventEmptyStateProps = {
  dialogsRef: EventDialogsRef;
};

export const EventEmptyState = ({ dialogsRef }: EventEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <PageEmptyState title={t('event_title_empty_state')} icon={<MapIcon />} description={t('event_description_empty_state')}>
      <EventEmptyStateContainer>
        <PrimaryButton onClick={() => dialogsRef.current?.openDialog('new')}>{t('new_event')}</PrimaryButton>
        <SecondaryButton disabled>{t('import')}</SecondaryButton>
      </EventEmptyStateContainer>
    </PageEmptyState>
  );
};
