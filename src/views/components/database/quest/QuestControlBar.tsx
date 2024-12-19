import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar } from '@components/ControlBar';
import { SelectQuest } from '@components/selects';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { QuestDialogsRef } from './editors/QuestEditorOverlay';
import { useProjectQuests } from '@src/hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@src/hooks/useShortcuts';

type QuestControlBarProps = {
  dialogsRef?: QuestDialogsRef;
};

export const QuestControlBar = ({ dialogsRef }: QuestControlBarProps) => {
  const { t } = useTranslation('database_quests');
  const { selectedDataIdentifier: questDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectQuests();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ quest: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ quest: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectQuest dbSymbol={questDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ quest: dbSymbol })} />
    </ControlBar>
  );
};
