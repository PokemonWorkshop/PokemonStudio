import { ipcRenderer } from 'electron';
import React, { useMemo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import theme from '@src/AppTheme';
import { useProjectSaving } from '@utils/useProjectSaving';
import { EditorOverlayContainer } from '@components/editor';
import { DeletionContainer } from '@components/deletion/DeletionContainer';
import { PrimaryButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';

const OverlayContainer = styled(EditorOverlayContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleWithIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding-top: 8px;

  & > h3 {
    ${theme.fonts.titlesHeadline6};
    margin: 0;
    line-height: 22px;
    text-align: center;
  }
`;

const SavingIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 100%;
  background-color: ${theme.colors.primarySoft};
  color: ${theme.colors.primaryBase};
`;

const TextWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${theme.fonts.normalMedium};
  color: ${theme.colors.text400};

  & > p {
    margin: 0;
    text-align: center;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  align-items: center;
  gap: 16px;
  padding-top: 8px;

  ${PrimaryButton} {
    width: min-content;
  }
`;

const Button = styled.span`
  ${theme.fonts.normalMedium};
  color: ${theme.colors.text400};

  :hover {
    cursor: pointer;
  }
`;

export const UnsavedWarningModal = () => {
  const { t } = useTranslation(['unsaved_modal']);
  const { saveProject, isDataToSave, isProjectTextSave, state } = useProjectSaving();
  const [show, setShow] = useState<boolean>(false);

  const onQuit = async () => {
    await ipcRenderer.send('window-safe-close');
  };

  const onSave = useMemo(
    () => async () => {
      setShow(false);
      await saveProject();
      await onQuit();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDataToSave, isProjectTextSave, state.savingData.map.size, state.savingConfig.map.size, state.savingProjectStudio, state]
  );

  useEffect(() => {
    ipcRenderer.on('request-window-close', async () => {
      if (isDataToSave) {
        setShow(true);
      } else {
        await onQuit();
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('request-window-close');
    };
  }, [isDataToSave]);

  return show ? (
    <OverlayContainer className="active">
      <DeletionContainer>
        <TitleWithIconContainer>
          <SavingIcon>
            <BaseIcon icon="save" size="s" color={theme.colors.primaryBase} />
          </SavingIcon>
          <h3>{t('unsaved_modal:title')}</h3>
        </TitleWithIconContainer>
        <TextWarningContainer>
          <p>{t('unsaved_modal:description')}</p>
        </TextWarningContainer>
        <ActionContainer>
          <Button onClick={() => setShow(false)}>{t('unsaved_modal:cancel')}</Button>
          <Button onClick={onQuit}>{t('unsaved_modal:quit')}</Button>
          <PrimaryButton onClick={onSave}>{t('unsaved_modal:save')}</PrimaryButton>
        </ActionContainer>
      </DeletionContainer>
    </OverlayContainer>
  ) : null;
};
