import React, { forwardRef } from 'react';
import { PrimaryButton } from '@components/buttons';
import { useProjectStudio } from '@hooks/useProjectStudio';
import { useTranslation } from 'react-i18next';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import theme from '@src/AppTheme';
import { BaseIcon } from '@components/icons/BaseIcon';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

type SettingsMapsUseTiledMessageBoxProps = {
  closeDialog: () => void;
};

export const SettingsMapsUseTiledMessageBox = forwardRef<EditorHandlingClose, SettingsMapsUseTiledMessageBoxProps>(({ closeDialog }, ref) => {
  const { projectStudioValues: projectStudio, setProjectStudioValues: setProjectStudio } = useProjectStudio();
  const { t } = useTranslation();

  const handleClick = () => {
    setProjectStudio({ ...projectStudio, isTiledMode: true });
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconContainer>
          <BaseIcon icon="map" size="s" color={theme.colors.primaryBase} />
        </MessageBoxIconContainer>
        <h3>{t('title_use_tiled_message_box')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('message_use_tiled_message_box')}</p>
        <p className="red">{t('important_use_tiled_message_box')}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <MessageBoxCancelLink onClick={closeDialog}>{t('cancel')}</MessageBoxCancelLink>
        <PrimaryButton onClick={handleClick}>{t('button_use_tiled')}</PrimaryButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
});
SettingsMapsUseTiledMessageBox.displayName = 'SettingsMapsUseTiledMessageBox';
