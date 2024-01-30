import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageBoxActionContainer,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import { ReactComponent as SuccessIcon } from '@assets/icons/global/success.svg';
import { DarkButton } from './buttons';
import styled from 'styled-components';

const SuccessDialogIconContainer = styled(MessageBoxIconContainer)`
  background-color: ${({ theme }) => theme.colors.successHover};
  color: ${({ theme }) => theme.colors.successBase};
`;

type SuccessDialogProps = {
  title: string;
  message: string;
  onClose: () => void;
};

export const SuccessDialog = ({ title, message, onClose }: SuccessDialogProps) => {
  const { t } = useTranslation('loader');

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <SuccessDialogIconContainer>
          <SuccessIcon />
        </SuccessDialogIconContainer>
        <h3>{title}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{message}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <DarkButton onClick={onClose}>{t('close')}</DarkButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
};
