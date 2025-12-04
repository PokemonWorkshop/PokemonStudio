import React from 'react';
import { useTranslation } from 'react-i18next';
import { ItemCategoryTextProps, ITEM_CATEGORY_DESCRIPTIONS } from './ItemCategoryTextProps';

export const ItemCategoryText: React.FC<ItemCategoryTextProps> = ({ itemCategory }) => {
  const { t } = useTranslation();

  if (!itemCategory) return null;

  return <span className="helper">{t(ITEM_CATEGORY_DESCRIPTIONS[itemCategory])}</span>;
};
