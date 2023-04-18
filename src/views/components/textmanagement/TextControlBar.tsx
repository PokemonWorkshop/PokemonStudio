import { DarkButton, SecondaryButtonWithPlusIcon } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar } from '@components/ControlBar';
import { SelectText } from '@components/selects';
import { TextDialogsRef } from './editors/TextEditorOverlay';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

type TextControlBarProps = {
  dialogsRef?: TextDialogsRef;
};

/**
 * Control bar responsive of handling navigation through texts & opening the texts creation dialog.
 */
export const TextControlBar = ({ dialogsRef }: TextControlBarProps) => {
  const { t } = useTranslation('text_management');

  // Definition of the control bar shortcuts
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    // No shortcut if an editor is opened
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && console.log('previous'), // TODO: code it!
      db_next: () => isShortcutEnabled() && console.log('next'), // TODO: code it!
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // TODO: update deps
  useShortcut(shortcutMap);

  /** Function opening the ability creation dialog if use clicks on New (not shown if there's no dialogsRef) */
  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      <ButtonContainer>
        {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon> : <></>}
        {<DarkButton>{t('manage_languages')}</DarkButton>}
      </ButtonContainer>
      <SelectText dbSymbol={'100047'} onChange={(filename) => console.log(filename)} />
    </ControlBar>
  );
};
