import React from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { TextControlBar, TextFrame, TextList } from '@components/textmanagement';
import { useDialogsRef } from '@utils/useDialogsRef';
import { TextEditorAndDeletionKeys, TextEditorOverlay } from '@components/textmanagement/editors/TextEditorOverlay';
import { useTextPage } from '@utils/usePage';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import styled from 'styled-components';

const TextsPageContainerStyle = styled(PageContainerStyle)`
  @media ${(props) => props.theme.breakpoints.smallScreen} {
    display: flex;
    margin: 0 4px;
    overflow-x: hidden;
  }
`;

export const TextsPage = () => {
  const dialogsRef = useDialogsRef<TextEditorAndDeletionKeys>();
  const { textInfo, cannotDelete } = useTextPage();
  const { t } = useTranslation('text_management');

  return (
    <DatabasePageStyle>
      <TextControlBar dialogsRef={dialogsRef} />
      <TextsPageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={0}
              tabs={[
                { label: t('texts'), path: '/texts' },
                { label: t('translation'), path: '/texts/translation' },
              ]}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <TextFrame textInfo={textInfo} dialogsRef={dialogsRef} />
            <TextList dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <TextEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </TextsPageContainerStyle>
    </DatabasePageStyle>
  );
};
