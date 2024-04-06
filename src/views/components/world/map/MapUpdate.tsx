import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { BaseButtonStyle, WarningButton } from '@components/buttons';
import { DataBlockContainer } from '@components/database/dataBlocks';
import { useMapUpdate } from '@utils/useMapUpdate';
import { showNotification } from '@utils/showNotification';
import { useLoaderRef } from '@utils/loaderContext';
import { getSetting } from '@utils/settings';
import { TooltipWrapper } from '@ds/Tooltip';

export const MapUpdateContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;

  // TODO: Remove h2 rule from global style & remove '!important' from here!
  h2 {
    color: ${(props) => props.theme.colors.text100} !important;
    margin-bottom: 8px;
  }

  .message {
    font-size: 14px;
    color: ${(props) => props.theme.colors.text100};
  }

  ${BaseButtonStyle} {
    white-space: nowrap;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    flex-direction: column;
    align-items: start;
  }
`;

export const MapUpdate = () => {
  const { t } = useTranslation('database_maps');
  const mapUpdate = useMapUpdate();
  const loaderRef = useLoaderRef();
  const disabledUpdate = !getSetting('tiledPath');

  const handleUpdate = async () => {
    mapUpdate(
      () => {
        loaderRef.current.close();
        showNotification('success', t('update_maps'), t('update_maps_success'));
      },
      (error, genericError) => {
        if (error.length !== 0) {
          error.forEach((err) => window.api.log.error(`[Map update] ${err.filename}.tmx:`, err.errorMessage));
          loaderRef.current.setError('updating_maps_error', t('update_maps_error_convert'), true);
        } else {
          loaderRef.current.setError('updating_maps_error', genericError || t('update_maps_error_generic'), true);
        }
      }
    );
  };

  return (
    <DataBlockContainer size="full" color="warning" data-disabled="true">
      <MapUpdateContainer>
        <div>
          <h2>{t('update_maps')}</h2>
          <span className="message">{t('update_maps_message')}</span>
        </div>
        <TooltipWrapper data-tooltip={disabledUpdate ? t('map_process_disabled') : undefined}>
          <WarningButton onClick={handleUpdate} disabled={disabledUpdate}>
            {t('update_maps_button')}
          </WarningButton>
        </TooltipWrapper>
      </MapUpdateContainer>
    </DataBlockContainer>
  );
};
