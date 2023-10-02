import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DeleteButtonWithIcon } from '@components/buttons';
import {
  ItemControlBar,
  ItemFrame,
  ItemGenericData,
  ItemParametersData,
  ItemTechData,
  ItemExplorationData,
  ItemBattleData,
  ItemProgressData,
  ItemHealData,
  ItemCatchData,
} from '@components/database/item';
import { ItemEditorAndDeletionKeys, ItemEditorOverlay } from '@components/database/item/editors/ItemEditorOverlay';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useItemPage } from '@utils/usePage';

export const ItemPage = () => {
  const dialogsRef = useDialogsRef<ItemEditorAndDeletionKeys>();
  const { items } = useItemPage();

  const { t } = useTranslation('database_items');

  return (
    <DatabasePageStyle>
      <ItemControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <ItemFrame dialogsRef={dialogsRef} />
            <ItemGenericData dialogsRef={dialogsRef} />
            <ItemParametersData dialogsRef={dialogsRef} />
            <ItemTechData dialogsRef={dialogsRef} />
            <ItemExplorationData dialogsRef={dialogsRef} />
            <ItemBattleData dialogsRef={dialogsRef} />
            <ItemProgressData dialogsRef={dialogsRef} />
            <ItemHealData dialogsRef={dialogsRef} />
            <ItemCatchData dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={Object.entries(items).length === 1}>
                {t('delete_this_item')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <ItemEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
