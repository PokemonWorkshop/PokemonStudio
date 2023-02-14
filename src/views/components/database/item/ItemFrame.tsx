import { ItemCategory } from '@components/categories';
import { CopyIdentifier } from '@components/Copy';
import { ResourceImage } from '@components/ResourceImage';
import { ITEM_CATEGORY, StudioItem } from '@modelEntities/item';
import { itemIconPath } from '@utils/path';
import { useGetEntityDescriptionText, useGetEntityNameText } from '@utils/ReadingProjectText';
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

type ItemFrameProps = { item: StudioItem; onClick: () => void };

export const ItemFrame = ({ item, onClick }: ItemFrameProps) => {
  const { t } = useTranslation(['database_types']);
  const getItemName = useGetEntityNameText();
  const getItemDescription = useGetEntityDescriptionText();
  const category = ITEM_CATEGORY[item.klass];

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="118px minmax(min-content, 692px) auto">
        <DataSpriteContainer type="icon">
          <ResourceImage imagePathInProject={itemIconPath(item.icon)} />
        </DataSpriteContainer>
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{getItemName(item)}</h1>
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
