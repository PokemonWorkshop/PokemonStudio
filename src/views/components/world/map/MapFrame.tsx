import React from 'react';
import styled from 'styled-components';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderTitle,
} from '@components/database/dataBlocks';
import { CopyIdentifier } from '@components/Copy';
import { useGetEntityDescriptionText, useGetEntityNameText } from '@utils/ReadingProjectText';
import { StudioMap } from '@modelEntities/map';
import { MapDialogsRef } from './editors/MapEditorOverlay';
import { padStr } from '@utils/PadStr';
import { WarningButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { useTranslation } from 'react-i18next';

type Props = {
  map: StudioMap;
  dialogsRef: MapDialogsRef;
  disabled: boolean;
  /** Map has uncommitted .tmx changes in Tiled → show the yellow refresh button. */
  isModified?: boolean;
  /** Click handler for the inline "update map changes" button. */
  onUpdateMap?: () => void;
  /** True when Studio's `tiledPath` setting is unset — button greys out. */
  updateDisabled?: boolean;
};

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  // Stop the wrapping DataBlockContainer's click-to-open-frame-editor
  // from firing when the user clicks the inline update button.
  & > .header-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
`;

const InlineUpdateButton = styled(WarningButton)`
  // Compact icon-only square on the right of the header.
  width: 36px;
  height: 36px;
  padding: 0;
  // BaseButtonStyle already centers via flex; this just keeps the SVG from
  // inheriting any odd gap/margins from the parent layout.
  & > * { display: flex; align-items: center; justify-content: center; }
`;

/**
 * Frame showing the common information about the map (name & description).
 * When the map is in the "modified" set, surfaces a yellow inline button
 * next to the title so the user can update just this map's tile metadata
 * without leaving the data tab.
 */
export const MapFrame = ({ map, dialogsRef, disabled, isModified, onUpdateMap, updateDisabled }: Props) => {
  const getName = useGetEntityNameText();
  const getDescription = useGetEntityDescriptionText();
  const { t } = useTranslation();
  return (
    <DataBlockContainer size="full" data-disabled={disabled} onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <HeaderRow>
              <DataInfoContainerHeaderTitle>
                <h1>
                  {getName(map)}
                  <span className="data-id">#{padStr(map.id, 3)}</span>
                </h1>
                <CopyIdentifier dataToCopy={String(map.id)} noColon />
              </DataInfoContainerHeaderTitle>
              {isModified && onUpdateMap && (
                <div
                  className="header-actions"
                  // The DataBlockContainer above is clickable — stop the
                  // bubble so clicking the button doesn't also open the edit
                  // overlay.
                  onClick={(e) => e.stopPropagation()}
                >
                  <InlineUpdateButton
                    onClick={onUpdateMap}
                    disabled={!!updateDisabled}
                    title={updateDisabled ? t('map_process_disabled') : t('update_maps_button')}
                  >
                    <BaseIcon icon="updateMap" size="s" color={theme.colors.dark8} />
                  </InlineUpdateButton>
                </div>
              )}
            </HeaderRow>
            <p>{getDescription(map)}</p>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
