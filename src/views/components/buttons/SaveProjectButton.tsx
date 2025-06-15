import styled from 'styled-components';
import React, { useMemo } from 'react';
import theme from '@src/AppTheme';
import { BaseIcon } from '@components/icons/BaseIcon';
import SvgContainer from '@components/icons/BaseIcon/SvgContainer';

import { BaseButtonStyle } from './GenericButtons';
import { useShortcut, StudioShortcutActions } from '@hooks/useShortcuts';
import { SaveEditorOverlay } from '@components/save/SaveEditorOverlay';
import { useSaveProjectAction } from '@src/hooks/useProjectSave/useSaveProjectAction';

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

const Badge = styled.div<{ visible: boolean }>`
  ${({ visible }) => !visible && 'display: none;'}
  border-radius: 100%;
  background-color: ${theme.colors.dangerBase};
  width: 8px;
  height: 8px;
`;

export const SaveProjectButton = () => {
  const { handleSave, isDataToSave, dialogsRef } = useSaveProjectAction();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => !document.querySelector('#dialogs')?.textContent && isDataToSave;
    return {
      save: () => isShortcutEnabled() && handleSave(),
    };
  }, [handleSave, isDataToSave]);

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
