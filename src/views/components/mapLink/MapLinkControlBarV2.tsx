import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { ControlBar, ControlBarLabelContainer } from '@components/ControlBar';
import { SelectMapLink2 } from '@components/selects';
import { useProjectMapLinks } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { MapLinkDialogsRef } from './editors/MapLinkEditorOverlay';
import { DbSymbol } from '@modelEntities/dbSymbol';

type MapLinkControlBarProps = {
  dialogsRef?: MapLinkDialogsRef;
};

export const MapLinkControlBarV2 = ({ dialogsRef }: MapLinkControlBarProps) => {
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
  const onClickNewLink = dialogsRef ? () => dialogsRef.current?.openDialog('new_link') : undefined;

  return (
    <ControlBar>
      <ControlBarLabelContainer>
        {onClickNew ? <SecondaryButtonWithPlusIcon onClick={onClickNew}>{t('new_maplink')}</SecondaryButtonWithPlusIcon> : <div />}
        {onClickNewLink ? <SecondaryButtonWithPlusIcon onClick={onClickNewLink}>{t('add_a_map')}</SecondaryButtonWithPlusIcon> : <div />}
      </ControlBarLabelContainer>
      <ControlBarLabelContainer>
        <span>{t('maplinks')}</span>
        <SelectMapLink2
          name="maplink-controlbar"
          defaultValue={mapLinkDbSymbol as DbSymbol}
          onChange={(dbSymbol) => setSelectedDataIdentifier({ mapLink: dbSymbol })}
        />
      </ControlBarLabelContainer>
    </ControlBar>
  );
};
