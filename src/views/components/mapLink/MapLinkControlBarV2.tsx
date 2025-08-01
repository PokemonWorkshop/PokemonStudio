import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { ControlBar, ControlBarLabelContainer } from '@components/ControlBar';
import { SelectMapLink2 } from '@components/selects';
import { useProjectMapLinks } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { MapLinkDialogsRef } from './editors/MapLinkEditorOverlay';

type MapLinkControlBarProps = {
  dialogsRef?: MapLinkDialogsRef;
  isValidMaplink: boolean;
};

export const MapLinkControlBarV2 = ({ dialogsRef, isValidMaplink }: MapLinkControlBarProps) => {
  const { t } = useTranslation();
  const { selectedDataIdentifier: mapLinkDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectMapLinks();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ mapLink: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ mapLink: getNextDbSymbol('id') }),
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLinkDbSymbol]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;
  const onClickNewLink = dialogsRef ? () => dialogsRef.current?.openDialog('add_map') : undefined;

  return (
    <ControlBar>
      <ControlBarLabelContainer>
        {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new_maplink')}</SecondaryButtonWithPlusIcon> : <div />}
        {onClickNewLink ? (
          <SecondaryButtonWithPlusIcon onClick={onClickNewLink} disabled={!isValidMaplink}>
            {t('add_a_map')}
          </SecondaryButtonWithPlusIcon>
        ) : (
          <div />
        )}
      </ControlBarLabelContainer>
      <SelectMapLink2 dbSymbol={mapLinkDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ mapLink: dbSymbol })} />
    </ControlBar>
  );
};
