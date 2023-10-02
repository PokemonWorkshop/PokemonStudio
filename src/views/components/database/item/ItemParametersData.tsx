import { Tag } from '@components/Tag';
import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataBlockWithTitle } from '../dataBlocks';
import { useItemPage } from '@utils/usePage';
import { ItemDialogsRef } from './editors/ItemEditorOverlay';

const ParameterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const NoParameterContainer = styled.div`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text500};
`;

const atLeastOneParameter = (item: StudioItem) => item.isBattleUsable || item.isMapUsable || item.isLimited || item.isHoldable;

type ItemParemetersDataProps = {
  dialogsRef: ItemDialogsRef;
};

export const ItemParametersData = ({ dialogsRef }: ItemParemetersDataProps) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');
  const isDisabled = LOCKED_ITEM_EDITOR[item.klass].includes('parameters');

  return (
    <DataBlockWithTitle
      size="fourth"
      title={t('params')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef?.current?.openDialog('parameters')}
    >
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
