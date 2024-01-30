import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageBoxActionContainer,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import theme from '@src/AppTheme';
import { BaseIcon, IconName } from '@components/icons/BaseIcon';
import { SecondaryButton } from './buttons';
import styled from 'styled-components';

const SuccessDialogIconContainer = styled(MessageBoxIconContainer)`
  background-color: ${({ theme }) => theme.colors.successHover};
`;

type SuccessDialogProps = {
  icon: IconName;
  title: string;
  message: string;
  onClose: () => void;
};

export const SuccessDialog = ({ icon, title, message, onClose }: SuccessDialogProps) => {
  const { t } = useTranslation('loader');

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <SuccessDialogIconContainer>
          <BaseIcon icon={icon} size="s" color={theme.colors.successBase} />
        </SuccessDialogIconContainer>
        <h3>{title}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{message}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <SecondaryButton onClick={onClose}>{t('close')}</SecondaryButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
};
