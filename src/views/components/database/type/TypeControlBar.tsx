import { SecondaryButtonWithPlusIcon, SecondaryButton } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar, ControlBarLabelContainer } from '@components/ControlBar';
import { SelectType } from '@components/selects';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { useProjectTypes } from '@hooks/useProjectData';
import { useNavigate } from 'react-router-dom';
import { TypeDialogsRef } from './editors/TypeEditorOverlay';
import { useTypePage } from '@hooks/usePage';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';

type TypeControlBarProps = {
  dialogsRef?: TypeDialogsRef;
  onRedirect?: 'pokemon' | 'table' | 'moves';
};

export const TypeControlBar = ({ dialogsRef, onRedirect }: TypeControlBarProps) => {
  const { typeDbSymbol } = useTypePage();
  const { t } = useTranslation('database_types');
  const navigate = useNavigate();
  const { setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectTypes();
  useSetCurrentDatabasePath();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;

    return {
      db_previous: () => {
        const previousDbSymbol = getPreviousDbSymbol('name');
        if (!isShortcutEnabled()) return;
        setSelectedDataIdentifier({ type: previousDbSymbol });
      },
      db_next: () => {
        const nextDbSymbol = getNextDbSymbol('name');
        if (!isShortcutEnabled()) return;
        setSelectedDataIdentifier({ type: nextDbSymbol });
      },
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog(onRedirect === 'table' ? 'newTable' : 'newType'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPreviousDbSymbol, setSelectedDataIdentifier, getNextDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew =
    dialogsRef && (onRedirect === 'table' || !onRedirect)
      ? () => dialogsRef.current?.openDialog(onRedirect === 'table' ? 'newTable' : 'newType')
      : undefined;

  return (
    <ControlBar>
      <ControlBarLabelContainer>
        {onClickNew && <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new')}</SecondaryButtonWithPlusIcon>}
        {onRedirect !== 'table' && <SecondaryButton onClick={() => navigate(`/database/types/table`)}>{t('type_table')}</SecondaryButton>}
      </ControlBarLabelContainer>
      <SelectType
        dbSymbol={typeDbSymbol}
        onChange={(value) => {
          setSelectedDataIdentifier({ type: value });
        }}
      />
    </ControlBar>
  );
};
