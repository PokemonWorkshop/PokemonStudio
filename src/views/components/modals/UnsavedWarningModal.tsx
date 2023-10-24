import React, { useMemo, useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import theme from '@src/AppTheme';
import { EditorOverlayContainer } from '@components/editor';
import { DeletionContainer } from '@components/deletion/DeletionContainer';
import { PrimaryButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import { useProjectSave } from '@utils/useProjectSave';
import { useLoaderRef } from '@utils/loaderContext';

const OverlayContainer = styled(EditorOverlayContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8001;
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
  const { isDataToSave, save } = useProjectSave();
  const loaderRef = useLoaderRef();
  const [show, setShow] = useState<boolean>(false);
  const shouldForceQuit = useRef<boolean>(false);
  const isDataToSaveRef = useRef<boolean>(isDataToSave);
  const [state, setState] = useState<'init' | 'update'>('init');

  const onQuit = async () => {
    await window.api.safeClose(shouldForceQuit.current);
  };

  const onSave = useMemo(
    () => async () => {
      setShow(false);
      save(
        async () => {
          loaderRef.current.close();
          await onQuit();
        },
        ({ errorMessage }) => loaderRef.current.setError('saving_project_error', errorMessage)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDataToSave]
  );

  const listener: Parameters<typeof window.api.requestClose.on>[0] = async (_event, forceQuit = false) => {
    shouldForceQuit.current = forceQuit;
    if (isDataToSaveRef.current) {
      setShow(true);
    } else {
      await onQuit();
    }
  };

  useEffect(() => {
    if (state === 'init') {
      window.api.requestClose.on(listener);
      setState('update');
    } else if (state === 'update') isDataToSaveRef.current = isDataToSave;

    return () => {
      window.api.requestClose.removeListener(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataToSave, state]);

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
