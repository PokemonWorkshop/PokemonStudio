import { ItemCategory } from '@components/categories';
import { CopyIdentifier } from '@components/Copy';
import { ResourceImage } from '@components/ResourceImage';
import { ITEM_CATEGORY } from '@modelEntities/item';
import { itemIconPath } from '@utils/path';
import { useGetEntityDescriptionText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderBadges,
  DataInfoContainerHeaderTitle,
  DataSpriteContainer,
} from '../dataBlocks';
import { useItemPage } from '@hooks/usePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';

type ItemFrameProps = { dialogsRef: ItemDialogsRef };

export const ItemFrame = ({ dialogsRef }: ItemFrameProps) => {
  const { currentItem: item, currentItemName } = useItemPage();
  const { t } = useTranslation(['database_types']);
  const getItemDescription = useGetEntityDescriptionText();
  const category = ITEM_CATEGORY[item.klass];

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef?.current?.openDialog('frame')}>
      <DataGrid columns="118px minmax(min-content, 692px) auto">
        <DataSpriteContainer type="icon">
          <ResourceImage imagePathInProject={itemIconPath(item.icon)} />
        </DataSpriteContainer>
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{currentItemName}</h1>
              <CopyIdentifier dataToCopy={item.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <ItemCategory category={category}>{t(`database_types:${category}`)}</ItemCategory>
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{getItemDescription(item)}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
