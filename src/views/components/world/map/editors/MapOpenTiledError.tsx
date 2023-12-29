import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconErrorContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import { useNavigate } from 'react-router-dom';
import { BaseIcon } from '@components/icons/BaseIcon';
import { PrimaryButton } from '@components/buttons';
import theme from '@src/AppTheme';
import { getSetting } from '@utils/settings';

type MapOpenTiledErrorProps = {
  closeDialog: () => void;
};

export const MapOpenTiledError = forwardRef<EditorHandlingClose, MapOpenTiledErrorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_maps');
  const navigate = useNavigate();
  const isTiledPathConfigured = !!getSetting('tiledPath');

  useEditorHandlingClose(ref);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconErrorContainer>
          <BaseIcon icon="map" size="s" color={theme.colors.dangerBase} />
        </MessageBoxIconErrorContainer>
        <h3>{t('title_open_tiled_error')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        {isTiledPathConfigured ? <p>{t('message_open_tiled_error')}</p> : <p>{t('message_config_open_tiled_error')}</p>}
      </MessageBoxTextContainer>
      {isTiledPathConfigured ? (
        <MessageBoxActionContainer>
          <PrimaryButton onClick={closeDialog}>{t('close')}</PrimaryButton>
        </MessageBoxActionContainer>
      ) : (
        <MessageBoxActionContainer>
          <MessageBoxCancelLink onClick={closeDialog}>{t('close')}</MessageBoxCancelLink>
          <PrimaryButton onClick={() => navigate('/settings/maps')}>{t('configure_tiled_path')}</PrimaryButton>
        </MessageBoxActionContainer>
      )}
    </MessageBoxContainer>
  );
});
MapOpenTiledError.displayName = 'MapOpenTiledError';
