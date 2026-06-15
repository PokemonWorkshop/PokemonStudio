import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
  MessageBoxActionContainerSpaceBetween,
  MessageBoxContainer,
  MessageBoxIconErrorContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import { Checkbox } from '@components/Checkbox';
import { DarkButton, PrimaryButton } from '@components/buttons';
import ErrorIcon from '@assets/icons/global/error.svg';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

export const TRAINER_PARTY_OVERFLOW_DISMISS_KEY = 'neverRemindMeTrainerPartyOverflow';

export const isTrainerPartyOverflowWarningDismissed = (): boolean =>
  localStorage.getItem(TRAINER_PARTY_OVERFLOW_DISMISS_KEY) === 'true';

const ActionContainer = styled(MessageBoxActionContainerSpaceBetween)`
  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.text400};

    :hover {
      cursor: pointer;
    }
  }

  .buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const IconImage = styled(ErrorIcon)`
  width: 24px;
  height: 24px;
`;

type Props = {
  closeDialog: () => void;
  onConfirm: () => void;
  threshold: number;
};

export const TrainerPartyOverflowWarning = forwardRef<EditorHandlingClose, Props>(({ closeDialog, onConfirm, threshold }, ref) => {
  const { t } = useTranslation();
  const checkedRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (checkedRef.current?.checked) {
      localStorage.setItem(TRAINER_PARTY_OVERFLOW_DISMISS_KEY, 'true');
    }
    closeDialog();
    onConfirm();
  };

  useEditorHandlingClose(ref);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconErrorContainer>
          <IconImage />
        </MessageBoxIconErrorContainer>
        <h3>{t('trainer_party_overflow_title', { threshold })}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('trainer_party_overflow_text', { threshold })}</p>
      </MessageBoxTextContainer>
      <ActionContainer>
        <label className="checkbox">
          <Checkbox ref={checkedRef} />
          <span>{t('never_remember_again')}</span>
        </label>
        <div className="buttons">
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
          <PrimaryButton onClick={handleConfirm}>{t('trainer_party_overflow_add_anyway')}</PrimaryButton>
        </div>
      </ActionContainer>
    </MessageBoxContainer>
  );
});

TrainerPartyOverflowWarning.displayName = 'TrainerPartyOverflowWarning';
