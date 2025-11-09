import React, { useMemo } from 'react';
import { ControlBar } from '@components/ControlBar';
import { SelectMapLink2 } from '@components/selects';
import { useProjectMapLinks } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { MapLinkDialogsRef } from './editors/MapLinkEditorOverlay';

type MapLinkControlBarProps = {
  dialogsRef?: MapLinkDialogsRef;
};

export const MapLinkControlBarV2 = ({ dialogsRef }: MapLinkControlBarProps) => {
  const { selectedDataIdentifier: mapLinkDbSymbol, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectMapLinks();

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;
    return {
      db_previous: () => isShortcutEnabled() && setSelectedDataIdentifier({ mapLink: getPreviousDbSymbol('id') }),
      db_next: () => isShortcutEnabled() && setSelectedDataIdentifier({ mapLink: getNextDbSymbol('id') }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLinkDbSymbol]);
  useShortcut(shortcutMap);

  return (
    <ControlBar>
      <div />
      <SelectMapLink2 dbSymbol={mapLinkDbSymbol} onChange={(dbSymbol) => setSelectedDataIdentifier({ mapLink: dbSymbol })} />
    </ControlBar>
  );
};
