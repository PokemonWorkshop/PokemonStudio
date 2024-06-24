import React, { useMemo, useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import theme from '@src/AppTheme';
import { EditorOverlayContainer } from '@components/editor';
import { PrimaryButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import { useProjectSave } from '@hooks/useProjectSave';
import { useLoaderRef } from '@utils/loaderContext';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';

const OverlayContainer = styled(EditorOverlayContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8001;
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
      <MessageBoxContainer>
        <MessageBoxTitleIconContainer>
          <MessageBoxIconContainer>
            <BaseIcon icon="save" size="s" color={theme.colors.primaryBase} />
          </MessageBoxIconContainer>
          <h3>{t('unsaved_modal:title')}</h3>
        </MessageBoxTitleIconContainer>
        <MessageBoxTextContainer>
          <p>{t('unsaved_modal:description')}</p>
        </MessageBoxTextContainer>
        <MessageBoxActionContainer>
          <MessageBoxCancelLink onClick={() => setShow(false)}>{t('unsaved_modal:cancel')}</MessageBoxCancelLink>
          <MessageBoxCancelLink onClick={onQuit}>{t('unsaved_modal:quit')}</MessageBoxCancelLink>
          <PrimaryButton onClick={onSave}>{t('unsaved_modal:save')}</PrimaryButton>
        </MessageBoxActionContainer>
      </MessageBoxContainer>
    </OverlayContainer>
  ) : null;
};
