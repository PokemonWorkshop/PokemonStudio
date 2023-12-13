import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { BaseButtonStyle, WarningButton } from '@components/buttons';
import { DataBlockContainer } from '@components/database/dataBlocks';
import { useRMXP2StudioMapsUpdate } from '@utils/useRMXP2StudioMapsUpdate';
import { showNotification } from '@utils/showNotification';
import { useLoaderRef } from '@utils/loaderContext';
import { MapUpdateContainer } from './MapUpdate';

const MapRMXPUpdateContainer = styled(MapUpdateContainer)`
  ${BaseButtonStyle} {
    white-space: nowrap;
    min-width: 180px;
  }
`;

export const MapRMXP2StudioUpdate = () => {
  const { t } = useTranslation('database_maps');
  const update = useRMXP2StudioMapsUpdate();
  const loaderRef = useLoaderRef();

  const handleUpdate = async () => {
    update(
      () => {
        loaderRef.current.close();
        showNotification('success', t('update_rmxp_maps'), t('update_maps_success'));
      },
      ({ errorMessage }) => {
        loaderRef.current.setError('updating_maps_error', errorMessage, true);
      }
    );
  };

  return (
    <DataBlockContainer size="full" color="warning" data-disabled="true">
      <MapRMXPUpdateContainer>
        <div>
          <h2>{t('update_rmxp_maps')}</h2>
          <span className="message">{t('update_rmxp_maps_message')}</span>
        </div>
        <WarningButton onClick={handleUpdate}>{t('update_rmxp_maps_button')}</WarningButton>
      </MapRMXPUpdateContainer>
    </DataBlockContainer>
  );
};
