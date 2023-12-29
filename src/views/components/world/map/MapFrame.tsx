import React from 'react';
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

type Props = {
  map: StudioMap;
  dialogsRef: MapDialogsRef;
  disabled: boolean;
};

/**
 * Frame showing the common information about the map (name & description)
 */
export const MapFrame = ({ map, dialogsRef, disabled }: Props) => {
  const getName = useGetEntityNameText();
  const getDescription = useGetEntityDescriptionText();
  return (
    <DataBlockContainer size="full" data-disabled={disabled} onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {getName(map)}
                <span className="data-id">#{padStr(map.id, 3)}</span>
              </h1>
              <CopyIdentifier dataToCopy={String(map.id)} noColon />
            </DataInfoContainerHeaderTitle>
            <p>{getDescription(map)}</p>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
