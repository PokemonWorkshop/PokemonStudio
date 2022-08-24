import { Tag } from '@components/Tag';
import ItemModel from '@modelEntities/item/Item.model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataBlockWithTitle } from '../dataBlocks';

const ParameterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const NoParameterContainer = styled.div`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text500};
`;

const atLeastOneParameter = (item: ItemModel) => item.isBattleUsable || item.isMapUsable || item.isLimited || item.isHoldable;

type ItemParemetersDataProps = {
  item: ItemModel;
  onClick: () => void;
};

export const ItemParametersData = ({ item, onClick }: ItemParemetersDataProps) => {
  const { t } = useTranslation('database_items');
  const isDisabled = item.lockedEditors.includes('parameters');
  return (
    <DataBlockWithTitle size="fourth" title={t('params')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled &&
        (atLeastOneParameter(item) ? (
          <ParameterContainer>
            {item.isBattleUsable && <Tag>{t('battle')}</Tag>}
            {item.isMapUsable && <Tag>{t('map')}</Tag>}
            {item.isLimited && <Tag>{t('limited')}</Tag>}
            {item.isHoldable && <Tag>{t('holdable')}</Tag>}
          </ParameterContainer>
        ) : (
          <NoParameterContainer>{t('no_parameter')}</NoParameterContainer>
        ))}
    </DataBlockWithTitle>
  );
};
