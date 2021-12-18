import React from 'react';
import TypeModel from '@modelEntities/type/Type.model';
import { TFunction } from 'react-i18next';

import { TypeTableHeadContainer, TypeIconListContainer, TypeTableHeadTitleContainer } from './TypeTableContainers';
import { DataFieldsetFieldCenteredWithChild } from '../../dataBlocks/DataFieldsetField';
import { TypeCategoryIcon } from '@components/categories';

type TypeTableHeadProps = {
  allTypes: TypeModel[];
  t: TFunction<'database_types'>;
};

export const TypeTableHead = ({ allTypes, t }: TypeTableHeadProps) => {
  return (
    <TypeTableHeadContainer>
      <TypeTableHeadTitleContainer>{t('offensive')}</TypeTableHeadTitleContainer>
      <DataFieldsetFieldCenteredWithChild label={t('defensive')} size="m">
        <TypeIconListContainer>
          {allTypes.map((type) => (
            <TypeCategoryIcon type={type.dbSymbol} key={`${type.name()}-icon`} />
          ))}
        </TypeIconListContainer>
      </DataFieldsetFieldCenteredWithChild>
    </TypeTableHeadContainer>
  );
};
