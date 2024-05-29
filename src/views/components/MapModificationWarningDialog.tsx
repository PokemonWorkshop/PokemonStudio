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

type MapModificationWarningDialogProps = {
  onClose: () => void;
};

export const MapModificationWarningDialog = ({ onClose }: MapModificationWarningDialogProps) => {
  const [, setChecked] = useState(false);
  const { t } = useTranslation('unsaved_modal');

  const neverRemindMe = (checked: boolean) => {
    setChecked(checked);
  };

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MapModificationWarningDialogContainer>
          <BaseIcon icon="save" size="s" color={theme.colors.primaryBase} />
        </MapModificationWarningDialogContainer>
        <h3>{t('map_modal_warning_modal_title')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('map_modal_warning_modal_text1')}</p>
        &nbsp;
        <p>{t('map_modal_warning_modal_text2')}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Checkbox onChange={(event) => neverRemindMe(event.target.checked)} />
          <span>{t('never_remember_again')}</span>
        </div>
        <PrimaryButton onClick={onClose}>{t('save')}</PrimaryButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
};
