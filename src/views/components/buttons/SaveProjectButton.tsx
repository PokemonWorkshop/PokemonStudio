import styled from 'styled-components';
import React, { useMemo } from 'react';
import theme from '@src/AppTheme';
import { BaseIcon } from '@components/icons/BaseIcon';
import SvgContainer from '@components/icons/BaseIcon/SvgContainer';

import { BaseButtonStyle } from './GenericButtons';
import { useProjectSave } from '@hooks/useProjectSave';
import { useLoaderRef } from '@utils/loaderContext';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { SaveEditorAndDeletionKeys, SaveEditorOverlay } from '@components/save/SaveEditorOverlay';

const SaveProjectButtonContainer = styled(BaseButtonStyle)`
  display: inline-block;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  padding: 14px 6px 6px 14px;

  &[data-disabled] {
    background-color: ${theme.colors.dark16};
  }

  &:hover {
    background-color: ${theme.colors.dark18};
  }

  &:active > ${SvgContainer} {
    background-color: ${theme.colors.primarySoft};

    svg {
      color: ${theme.colors.primaryBase};
    }
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

type BadgeProps = {
  visible: boolean;
};

const Badge = styled.div<BadgeProps>`
  ${({ visible }) => !visible && 'display: none;'}
  border-radius: 100%;
  background-color: ${theme.colors.dangerBase};
  width: 8px;
  height: 8px;
`;

export const SaveProjectButton = () => {
  const { isDataToSave, isMapsToSave, save } = useProjectSave();
  const loaderRef = useLoaderRef();
  const dialogsRef = useDialogsRef<SaveEditorAndDeletionKeys>();

  const handleSave = async () => {
    const skipMapWarning = localStorage.getItem('neverRemindMeMapModification') === 'true';
    if (skipMapWarning || !isMapsToSave) {
      save(
        () => loaderRef.current.close(),
        ({ errorMessage }) => loaderRef.current.setError('saving_project_error', errorMessage)
      );
      return;
    }
    dialogsRef.current?.openDialog('map_warning', true);
  };

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    // No shortcut if an editor is opened and no data to save
    const isShortcutEnabled = () => !document.querySelector('#dialogs')?.textContent && isDataToSave;
    return {
      save: () => isShortcutEnabled() && handleSave(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save, isDataToSave]);
  useShortcut(shortcutMap);

  return (
    <>
      <SaveProjectButtonContainer onClick={handleSave} disabled={!isDataToSave}>
        <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="save" disabled={!isDataToSave} />
        <BadgeContainer>
          <Badge visible={isDataToSave} />
        </BadgeContainer>
      </SaveProjectButtonContainer>
      <SaveEditorOverlay ref={dialogsRef} />
    </>
  );
};
