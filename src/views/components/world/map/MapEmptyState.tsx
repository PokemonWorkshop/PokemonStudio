import React from 'react';
import { PageEmptyState } from '@components/pages';
import { useTranslation } from 'react-i18next';
import { ReactComponent as MapIcon } from '@assets/icons/navigation/map-icon.svg';
import { MapDialogsRef } from './editors/MapEditorOverlay';
import { PrimaryButton, SecondaryButton } from '@components/buttons';
import { MapImportDialogsRef } from './editors/MapImport/MapImportOverlay';
import styled from 'styled-components';

const MapEmptyStateContainer = styled.div`
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

type MapEmptyStateProps = {
  dialogsRef: MapDialogsRef;
  dialogsMapImportRef: MapImportDialogsRef;
};

export const MapEmptyState = ({ dialogsRef, dialogsMapImportRef }: MapEmptyStateProps) => {
  const { t } = useTranslation('database_maps');

  return (
    <PageEmptyState title={t('title_empty_state')} icon={<MapIcon />} description={t('description_empty_state')}>
      <MapEmptyStateContainer>
        <PrimaryButton onClick={() => dialogsRef.current?.openDialog('new')}>{t('new')}</PrimaryButton>
        <SecondaryButton onClick={() => dialogsMapImportRef.current?.openDialog('import', true)}>{t('import')}</SecondaryButton>
        <span className="helper">{t('helper_empty_state')}</span>
      </MapEmptyStateContainer>
    </PageEmptyState>
  );
};
