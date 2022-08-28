import { ItemCategory } from '@components/categories';
import { CopyIdentifier } from '@components/Copy';
import ItemModel from '@modelEntities/item/Item.model';
import { useGlobalState } from '@src/GlobalStateProvider';
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

type ItemFrameProps = { item: ItemModel; onClick: () => void };

export const ItemFrame = ({ item, onClick }: ItemFrameProps) => {
  const { t } = useTranslation(['database_types']);
  const [state] = useGlobalState();

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="118px minmax(min-content, 692px) auto">
        <DataSpriteContainer type="icon">
          <img src={state.projectPath ? item.iconUrl(state.projectPath) : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'} />
        </DataSpriteContainer>
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{item.name()}</h1>
              <CopyIdentifier dataToCopy={item.dbSymbol} />
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <ItemCategory category={item.category}>{t(`database_types:${item.category}`)}</ItemCategory>
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{item.descr()}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
