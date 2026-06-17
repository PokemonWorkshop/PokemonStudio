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
import { DeleteButton } from '@components/buttons';
import { Checkbox } from '@components/Checkbox';
import ErrorIcon from '@assets/icons/global/error.svg';

import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

/**
 * localStorage key for the "don't show this again" dismissal. Read by
 * `Online.MysteryGift.page.tsx` to skip the dialog and go straight to the
 * server call once the user has opted out.
 */
export const DISABLE_GIFT_DONT_REMIND_KEY = 'neverRemindMeDisableGiftWarning';

export const isDisableGiftWarningDismissed = (): boolean =>
  localStorage.getItem(DISABLE_GIFT_DONT_REMIND_KEY) === 'true';

const ActionRow = styled(MessageBoxActionContainerSpaceBetween)`
  .dont-remind {
    display: flex;
    align-items: center;
    gap: 8px;
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.text400};
    cursor: pointer;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

type Props = {
  closeDialog: () => void;
  onConfirm: () => void;
  title: string;
};

/**
 * Centered confirmation dialog for disabling a Mystery Gift. Visual + interaction
 * patterns mirror `MapModificationWarningDialog` — error-tone icon container,
 * title + descriptive paragraph + action row — so it feels native to Studio
 * rather than a browser-native `confirm()`. Includes a "don't show this again"
 * checkbox that persists to localStorage so power users can disable gifts
 * one-click thereafter.
 */
export const DeleteGiftConfirmation = forwardRef<EditorHandlingClose, Props>(({ closeDialog, onConfirm, title }, ref) => {
  const { t } = useTranslation();
  const dontRemindRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (dontRemindRef.current?.checked) {
      localStorage.setItem(DISABLE_GIFT_DONT_REMIND_KEY, 'true');
    }
    closeDialog();
    onConfirm();
  };

  useEditorHandlingClose(ref);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconErrorContainer>
          <ErrorIcon width="24" height="24" />
        </MessageBoxIconErrorContainer>
        <h3>{t('online_gift_delete_dialog_title', { title })}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('online_gift_delete_dialog_body')}</p>
      </MessageBoxTextContainer>
      <ActionRow>
        <label className="dont-remind">
          <Checkbox ref={dontRemindRef} />
          <span>{t('online_gift_disable_dont_show_again')}</span>
        </label>
        <div className="actions">
          <DeleteButton onClick={handleConfirm}>{t('online_gift_delete')}</DeleteButton>
        </div>
      </ActionRow>
    </MessageBoxContainer>
  );
});

DeleteGiftConfirmation.displayName = 'DeleteGiftConfirmation';
