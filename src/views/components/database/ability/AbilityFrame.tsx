import React from 'react';
import { DataBlockContainer, DataGrid, DataInfoContainer, DataInfoContainerHeader, DataInfoContainerHeaderTitle } from '../dataBlocks';
import { CopyIdentifier } from '@components/Copy';
import { useGetEntityDescriptionTextUsingTextId, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import type { StudioAbility } from '@modelEntities/ability';
import type { AbilityDialogsRef } from './editors/AbilityEditorOverlay';

type Props = {
  ability: StudioAbility;
  dialogsRef: AbilityDialogsRef;
};

/**
 * Frame showing the common information about the ability (name & description)
 */
export const AbilityFrame = ({ ability, dialogsRef }: Props) => {
  const getName = useGetEntityNameTextUsingTextId();
  const getDescription = useGetEntityDescriptionTextUsingTextId();
  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{getName(ability)}</h1>
              <CopyIdentifier dataToCopy={ability.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <p>{getDescription(ability)}</p>
          </DataInfoContainerHeader>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
