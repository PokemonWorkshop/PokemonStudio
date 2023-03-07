import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar } from '@components/ControlBar';
import { SelectAbility } from '@components/selects';
import type { AbilityDialogsRef } from './editors/AbilityEditorOverlay';
import { useProjectAbilities } from '@utils/useProjectData';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';

type AbilityControlBarProps = {
  dialogsRef?: AbilityDialogsRef;
};

/**
 * Control bar responsive of handling navigation through abilities & opening the ability creation dialog.
 */
export const AbilityControlBar = ({ dialogsRef }: AbilityControlBarProps) => {
  useSetCurrentDatabasePath();
  const { t } = useTranslation('database_abilities');
  const { selectedDataIdentifier: abilityDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectAbilities();

  // Definition of the control bar shortcuts
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    // No shortcut if an editor is opened
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ ability: getPreviousDbSymbol('name') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ ability: getNextDbSymbol('name') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abilityDbSymbol]);
  useShortcut(shortcutMap);

  /** Function opening the ability creation dialog if use clicks on New (not shown if there's no dialogsRef) */
  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectAbility dbSymbol={abilityDbSymbol} onChange={(ability) => setSelectedDataIdentifier({ ability })} />
    </ControlBar>
  );
};
