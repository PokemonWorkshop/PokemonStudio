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
import { PrimaryButton, SecondaryButton } from '@components/buttons';
import theme from '@src/AppTheme';
import { getSetting } from '@utils/settings';
import { useOpenStudioLogsFolder } from '@utils/useOpenStudioLogsFolder';

type MapOpenTiledErrorProps = {
  closeDialog: () => void;
};

export const MapOpenTiledError = forwardRef<EditorHandlingClose, MapOpenTiledErrorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation(['database_maps', 'error']);
  const navigate = useNavigate();
  const openStudioLogsFolder = useOpenStudioLogsFolder();
  const isTiledPathConfigured = !!getSetting('tiledPath');

  const onClickLogs = async () => {
    openStudioLogsFolder(
      () => {},
      ({ errorMessage }) => window.api.log.error(errorMessage)
    );
  };

  useEditorHandlingClose(ref);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconErrorContainer>
          <BaseIcon icon="map" size="s" color={theme.colors.dangerBase} />
        </MessageBoxIconErrorContainer>
        <h3>{t('database_maps:title_open_tiled_error')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        {isTiledPathConfigured ? <p>{t('database_maps:message_open_tiled_error')}</p> : <p>{t('database_maps:message_config_open_tiled_error')}</p>}
      </MessageBoxTextContainer>
      {isTiledPathConfigured ? (
        <MessageBoxActionContainer>
          <SecondaryButton onClick={onClickLogs}>{t('error:logs')}</SecondaryButton>
          <PrimaryButton onClick={closeDialog}>{t('database_maps:close')}</PrimaryButton>
        </MessageBoxActionContainer>
      ) : (
        <MessageBoxActionContainer>
          <MessageBoxCancelLink onClick={closeDialog}>{t('database_maps:close')}</MessageBoxCancelLink>
          <PrimaryButton onClick={() => navigate('/settings/maps')}>{t('database_maps:configure_tiled_path')}</PrimaryButton>
        </MessageBoxActionContainer>
      )}
    </MessageBoxContainer>
  );
});
MapOpenTiledError.displayName = 'MapOpenTiledError';
