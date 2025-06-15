import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import theme from '@src/AppTheme';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import { BaseIcon } from '@components/icons/BaseIcon';
import { PrimaryButton } from '@components/buttons';
import { EditorOverlayContainer } from '@components/editor';
import { useUnsavedWarning } from './unsavedWarningContext';

const OverlayContainer = styled(EditorOverlayContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8001;
`;

export const UnsavedWarningModal = () => {
  const { t } = useTranslation();
  const { showModal, closeModal, onConfirmQuit } = useUnsavedWarning();

  if (!showModal) return null;

  return (
    <OverlayContainer className="active">
      <MessageBoxContainer>
        <MessageBoxTitleIconContainer>
          <MessageBoxIconContainer>
            <BaseIcon icon="save" size="s" color={theme.colors.primaryBase} />
          </MessageBoxIconContainer>
          <h3>{t('unsaved_title_modal')}</h3>
        </MessageBoxTitleIconContainer>
        <MessageBoxTextContainer>
          <p>{t('unsaved_description_modal')}</p>
        </MessageBoxTextContainer>
        <MessageBoxActionContainer>
          <MessageBoxCancelLink onClick={closeModal}>{t('cancel')}</MessageBoxCancelLink>
          <MessageBoxCancelLink onClick={onConfirmQuit}>{t('quit')}</MessageBoxCancelLink>
          <PrimaryButton onClick={onConfirmQuit}>{t('save')}</PrimaryButton>
        </MessageBoxActionContainer>
      </MessageBoxContainer>
    </OverlayContainer>
  );
};
