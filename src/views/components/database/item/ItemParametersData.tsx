import { Tag } from '@components/Tag';
import ItemModel from '@modelEntities/item/Item.model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataBlockWithTitle } from '../dataBlocks';

const ParemeterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

type ItemParemetersDataProps = {
  item: ItemModel;
  onClick: () => void;
};

export const ItemParametersData = ({ item, onClick }: ItemParemetersDataProps) => {
  const { t } = useTranslation('database_items');
  const isDisabled = item.lockedEditors.includes('parameters');
  return (
    <DataBlockWithTitle size="fourth" title={t('params')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <ParemeterContainer>
          {item.isBattleUsable && <Tag>{t('battle')}</Tag>}
          {item.isMapUsable && <Tag>{t('map')}</Tag>}
          {item.isLimited && <Tag>{t('limited')}</Tag>}
          {item.isHoldable && <Tag>{t('holdable')}</Tag>}
        </ParemeterContainer>
      )}
    </DataBlockWithTitle>
  );
};
