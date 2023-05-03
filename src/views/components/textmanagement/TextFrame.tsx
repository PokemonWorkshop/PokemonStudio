import React from 'react';
import {
  DataBlockContainer,
  DataFieldsetField,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderTitle,
} from '@components/database/dataBlocks';
import { CopyIdentifier } from '@components/Copy';
import type { TextDialogsRef } from './editors/TextEditorOverlay';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { StudioTextInfo } from '@modelEntities/textInfo';
import { useGetEntityDescriptionTextUsingTextId, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useGlobalState } from '@src/GlobalStateProvider';

const TextInfoContainer = styled(DataInfoContainer)`
  gap: 20px;

  & span.data-id {
    margin: 0;
  }
`;

const TextSubInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
`;

type Props = {
  textInfo: StudioTextInfo;
  dialogsRef: TextDialogsRef;
};

/**
 * Frame showing the common information about the texts file
 */
export const TextFrame = ({ textInfo, dialogsRef }: Props) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('text_management');
  const getName = useGetEntityNameTextUsingTextId();
  const getDescription = useGetEntityDescriptionTextUsingTextId();
  const projectTextFromFileId: string[][] | undefined = state.projectText[textInfo.fileId];
  const languageCount = projectTextFromFileId ? projectTextFromFileId[0]?.filter((col) => col.toLocaleLowerCase() !== 'index').length || 0 : 0;

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <TextInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{getName(textInfo)}</h1>
              <span className="data-id">{`#${textInfo.fileId}`}</span>
              <CopyIdentifier dataToCopy={textInfo.fileId.toString()} />
            </DataInfoContainerHeaderTitle>
          </DataInfoContainerHeader>
          <p>{getDescription(textInfo)}</p>
          <TextSubInfoContainer>
            <DataFieldsetField
              label={t('contains')}
              data={t('contains_texts', { count: projectTextFromFileId?.length - 1 || 0 })}
              disabled={false}
              error={projectTextFromFileId === undefined}
            />
            <DataFieldsetField
              label={t('translated_into')}
              data={t('translated_into_language', { count: languageCount })}
              disabled={false}
              error={projectTextFromFileId === undefined || projectTextFromFileId[0] === undefined}
            />
          </TextSubInfoContainer>
        </TextInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
