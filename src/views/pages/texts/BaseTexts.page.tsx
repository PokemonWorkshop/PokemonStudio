import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

import { DataBlockWrapper } from '@components/database/dataBlocks';

import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { TextControlBar } from '@components/textmanagement';
import { useDialogsRef } from '@utils/useDialogsRef';
import { TextEditorAndDeletionKeys, TextEditorOverlay } from '@components/textmanagement/editors/TextEditorOverlay';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import styled from 'styled-components';
import { useTextPage } from '@utils/usePage';

const TextsPageContainerStyle = styled(PageContainerStyle)`
  @media ${(props) => props.theme.breakpoints.smallScreen} {
    display: flex;
    margin: 0 4px;
    overflow-x: hidden;
  }
`;
export const BaseTextsPage = () => {
  const dialogsRef = useDialogsRef<TextEditorAndDeletionKeys>();
  const { t } = useTranslation('text_management');
  const { disabledTranslation } = useTextPage();
  const location = useLocation();

  return (
    <DatabasePageStyle>
      <TextControlBar dialogsRef={dialogsRef} />
      <TextsPageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={location.pathname === '/texts' ? 0 : 1}
              tabs={[
                { label: t('texts'), path: '/texts' },
                { label: t('translation'), path: '/texts/translation', disabled: disabledTranslation },
              ]}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <Outlet context={dialogsRef} />
          </DataBlockWrapper>
          <TextEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </TextsPageContainerStyle>
    </DatabasePageStyle>
  );
};
