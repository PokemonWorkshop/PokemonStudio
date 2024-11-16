import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { ControlBar } from '@components/ControlBar';
import { SelectNature } from '@components/selects';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { useProjectNatures } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { NatureDialogsRef } from './editors/NatureEditorOverlay';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { SelectContainerWithLabel } from '@components/selects/SelectContainerWithLabel';

type NatureControlBarProps = {
  dialogsRef?: NatureDialogsRef;
};

export const NatureControlBar = ({ dialogsRef }: NatureControlBarProps) => {
  const { t } = useTranslation('database_natures');
  const { selectedDataIdentifier: natureDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectNatures();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ nature: getPreviousDbSymbol('name') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ nature: getNextDbSymbol('name') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natureDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;

  return (
    <ControlBar>
      {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectContainerWithLabel>
        <span>{t('nature')}</span>
        <SelectNature
          dbSymbol={natureDbSymbol as DbSymbol}
          onChange={(option) => setSelectedDataIdentifier({ nature: option.value })}
          hideStats={true}
        />
      </SelectContainerWithLabel>
    </ControlBar>
  );
};
