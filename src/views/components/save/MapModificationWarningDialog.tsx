import React, { forwardRef, useRef } from 'react';
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
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useProjectSave } from '@hooks/useProjectSave';
import { useLoaderRef } from '@utils/loaderContext';

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
  closeDialog: () => void;
};

export const MapModificationWarningDialog = forwardRef<EditorHandlingClose, MapModificationWarningDialogProps>(
  ({ closeDialog }: MapModificationWarningDialogProps, ref) => {
    const checkedRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation('unsaved_modal');
    const { save } = useProjectSave();
    const loaderRef = useLoaderRef();
    const messageBoxRef = useRef<HTMLDivElement>(null);

    const onSave = async () => {
      localStorage.setItem('neverRemindMeMapModification', checkedRef.current?.checked.toString() || 'false');
      // Hide the message box so that it is not visible when the loader is closed
      if (messageBoxRef.current) messageBoxRef.current.style.display = 'none';
      save(
        () => {
          loaderRef.current.close();
          closeDialog();
        },
        ({ errorMessage }) => {
          loaderRef.current.setError('saving_project_error', errorMessage);
          closeDialog();
        }
      );
    };

    useEditorHandlingClose(ref, undefined, () => {
      return false;
    });

    return (
      <MessageBoxContainer ref={messageBoxRef}>
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
            <Checkbox ref={checkedRef} />
            <span>{t('never_remember_again')}</span>
          </div>
          <PrimaryButton onClick={onSave}>{t('save')}</PrimaryButton>
        </MapModificationActionContainer>
      </MessageBoxContainer>
    );
  }
);

MapModificationWarningDialog.displayName = 'MapModificationWarningDialog';
