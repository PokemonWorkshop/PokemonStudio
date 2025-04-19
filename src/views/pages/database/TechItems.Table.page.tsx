import React from 'react';
import { ItemControlBar } from '@components/database/item/ItemControlBar';
import { useNavigate } from 'react-router-dom';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useTranslation } from 'react-i18next';
import { SubPageTitle } from '@components/pages';
import { TechItemsTable } from '@components/database/item/TechItemsTable';
import { DataBlockWrapperWithNoBreakpoint } from '@components/database/dataBlocks/DataBlockWrapper';
import { ItemEditorAndDeletionKeys, ItemEditorOverlay } from '@components/database/item/editors/ItemEditorOverlay';
import { useDialogsRef } from '@hooks/useDialogsRef';

export const TechItemsTablePage = () => {
  const dialogsRef = useDialogsRef<ItemEditorAndDeletionKeys>();
  const navigate = useNavigate();
  const { t } = useTranslation('database_items');

  const onClickedBack = () => navigate(`/database/items`);

  return (
    <DatabasePageStyle>
      <ItemControlBar dialogsRef={dialogsRef} onRedirect="table" />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapperWithNoBreakpoint>
            <SubPageTitle title={t('tech_list')} onClickedBack={onClickedBack} />
            <TechItemsTable />
          </DataBlockWrapperWithNoBreakpoint>
          <ItemEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
