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

type StudioText = {
  filename: string;
  name: string;
  description: string;
  data: never[];
};

type Props = {
  texts: StudioText;
  dialogsRef: TextDialogsRef;
};

/**
 * Frame showing the common information about the texts file
 */
export const TextFrame = ({ texts, dialogsRef }: Props) => {
  const { t } = useTranslation('text_management');

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <TextInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{texts.name}</h1>
              <span className="data-id">{`#${texts.filename}`}</span>
              <CopyIdentifier dataToCopy={texts.filename} />
            </DataInfoContainerHeaderTitle>
          </DataInfoContainerHeader>
          <p>{texts.description}</p>
          <TextSubInfoContainer>
            <DataFieldsetField label={t('contains')} data={t('contains_texts', { count: 3 })} disabled={false} />
            <DataFieldsetField label={t('translated_into')} data={t('translated_into_language', { count: 7 })} disabled={false} />
          </TextSubInfoContainer>
        </TextInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
