import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ItemCategoryTextProps, ITEM_CATEGORY_DESCRIPTIONS } from './ItemCategoryTextProps';

const CategoryDescription = styled.p`
  margin: 8px 0 0 0;
  color: ${({ theme }) => theme.colors.text400};
  font-size: 14px;
`;

export const ItemCategoryText: React.FC<ItemCategoryTextProps> = ({ itemCategory }) => {
  const { t } = useTranslation();

  if (!itemCategory) return null;

  return (
    <CategoryDescription>
      {t(ITEM_CATEGORY_DESCRIPTIONS[itemCategory])}
    </CategoryDescription>
  );
};