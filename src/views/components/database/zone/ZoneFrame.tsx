import React from 'react';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeaderTitle } from '../dataBlocks';
import styled from 'styled-components';
import { padStr } from '@utils/PadStr';
import { CopyIdentifier } from '@components/Copy';
import { useGetEntityDescriptionText, useGetEntityNameText } from '@utils/ReadingProjectText';
import { StudioZone } from '@modelEntities/zone';
import { ZoneDialogsRef } from './editors/ZoneEditorOverlay';

const DataZoneContainer = styled(DataInfoContainer)`
  gap: 8px;
`;

type ZoneFrameProps = {
  zone: StudioZone;
  dialogsRef: ZoneDialogsRef;
};

export const ZoneFrame = ({ zone, dialogsRef }: ZoneFrameProps) => {
  const getZoneName = useGetEntityNameText();
  const getZoneDescription = useGetEntityDescriptionText();

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataZoneContainer>
          <DataInfoContainerHeaderTitle>
            <h1>
              {getZoneName(zone)}
              <span className="data-id">#{padStr(zone.id, 3)}</span>
            </h1>
            <CopyIdentifier dataToCopy={zone.dbSymbol} />
          </DataInfoContainerHeaderTitle>
          <p>{getZoneDescription(zone)}</p>
        </DataZoneContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
