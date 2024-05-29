import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageBoxActionContainer,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import { PrimaryButton } from '@components/buttons';
import { Checkbox } from '@components/Checkbox';
import { BaseIcon } from '@components/icons/BaseIcon';
import styled from 'styled-components';
import theme from '@src/AppTheme';
const MapModificationWarningDialogContainer = styled(MessageBoxIconContainer)`
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.successBase};
`;

type SuccessDialogProps = {
  title: string;
  message: string;
  onClose: () => void;
};

export const MapModificationWarningDialog = ({ title, message, onClose }: SuccessDialogProps) => {
  const [, setChecked] = useState(false);
  const { t } = useTranslation('loader');

  const neverRemindMe = (checked: boolean) => {
    setChecked(checked);
  };

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MapModificationWarningDialogContainer>
          <BaseIcon icon="save" size="s" color={theme.colors.primaryBase} />
        </MapModificationWarningDialogContainer>
        <h3>{title}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{message}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <Checkbox onChange={(event) => neverRemindMe(event.target.checked)} />
        <span>Ne plus me le rappeler</span>
        <PrimaryButton onClick={onClose}>{t('close')}</PrimaryButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
};
