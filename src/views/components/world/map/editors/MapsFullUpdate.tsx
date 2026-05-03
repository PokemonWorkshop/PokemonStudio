import { PrimaryButton } from '@components/buttons';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { BaseIcon } from '@components/icons/BaseIcon';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import { useMapUpdate } from '@hooks/useMapUpdate';
import theme from '@src/AppTheme';
import { useLoaderRef } from '@utils/loaderContext';
import { getSetting } from '@utils/settings';
import React, { ForwardedRef } from 'react';
import { useTranslation } from 'react-i18next';

type MapsFullUpdateProps = {
  ref: ForwardedRef<EditorHandlingClose>;
  closeDialog: () => void;
};

export const MapsFullUpdate = ({ ref, closeDialog }: MapsFullUpdateProps) => {
  const { t } = useTranslation();
  const mapUpdate = useMapUpdate();
  const loaderRef = useLoaderRef();
  const disabledUpdate = !getSetting('tiledPath');

  const handleUpdate = async () => {
    mapUpdate(
      { type: 'full' },
      () => {
        // we wait the end of the close dialog animation to show the success
        setTimeout(() => loaderRef.current.setSuccess('update_maps', t('full_map_dialog_success')), 200);
        closeDialog();
      },
      (error, genericError) => {
        // we wait the end of the close dialog animation to show the error
        setTimeout(() => {
          if (error.length !== 0) {
            error.forEach((err) => window.api.log.error(`[Map update] ${err.filename}.tmx:`, err.errorMessage));
            loaderRef.current.setError('updating_maps_error', t('update_maps_error_convert'), true);
          } else {
            loaderRef.current.setError('updating_maps_error', genericError || t('update_maps_error_generic'), true);
          }
        }, 200);
        closeDialog();
      },
    );
  };

  useEditorHandlingClose(ref);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconContainer>
          <BaseIcon icon="map" size="s" color={theme.colors.primaryBase} />
        </MessageBoxIconContainer>
        <h3>{t('update_maps')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('full_map_dialog_message')}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <MessageBoxCancelLink onClick={closeDialog}>{t('close')}</MessageBoxCancelLink>
        <PrimaryButton onClick={handleUpdate} disabled={disabledUpdate}>
          {t('update')}
        </PrimaryButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
};
