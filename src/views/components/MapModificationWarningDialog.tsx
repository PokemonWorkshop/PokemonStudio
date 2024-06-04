import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageBoxActionContainerSpaceBetween,
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

const MapModificationActionContainer = styled(MessageBoxActionContainerSpaceBetween)`
  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text400};
  }
`;

type MapModificationWarningDialogProps = {
  onClose: () => void;
};
export const MapModificationWarningDialog = ({ onClose }: MapModificationWarningDialogProps) => {
  const checkedRef = useRef(false);
  const { t } = useTranslation('unsaved_modal');

  const neverRemindMe = (checked: boolean) => {
    checkedRef.current = checked;
  };

  const onClickClose = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    sessionStorage.setItem('neverRemindMeMapModification', checkedRef.current.toString());
    onClose();
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
      <MapModificationActionContainer>
        <div className="checkbox">
          <Checkbox onChange={(event) => neverRemindMe(event.target.checked)} />
          <span>{t('never_remember_again')}</span>
        </div>
        <PrimaryButton onClick={(e) => onClickClose(e)}>{t('save')}</PrimaryButton>
      </MapModificationActionContainer>
    </MessageBoxContainer>
  );
};
