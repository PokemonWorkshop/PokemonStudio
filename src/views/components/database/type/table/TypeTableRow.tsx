import React from 'react';
import TypeModel from '@modelEntities/type/Type.model';

import { TypeTableRowContainer, TypeIconListContainer } from './TypeTableContainers';
import { TypeTableCategory, RatioCategoryIcon } from '@components/categories';

type TypeTableRowProps = {
  currentType: TypeModel;
  allTypes: TypeModel[];
  editType: (type: TypeModel) => void;
};

const getRatio = (currentType: TypeModel, type: TypeModel, allTypes: TypeModel[]) => {
  const { high, low, zero } = currentType.getEfficiencies(allTypes);
  if (high.includes(type)) return 'high_efficience';
  if (low.includes(type)) return 'low_efficience';
  if (zero.includes(type)) return 'zero_efficience';
  return 'neutral';
};

export const TypeTableRow = ({ currentType, allTypes, editType }: TypeTableRowProps) => {
  return (
    <TypeTableRowContainer>
      <TypeTableCategory type={currentType.dbSymbol}>{currentType.name()}</TypeTableCategory>
      <TypeIconListContainer>
        {allTypes.map((type) => (
          <RatioCategoryIcon
            ratio={getRatio(currentType, type, allTypes)}
            offensiveType={currentType}
            defensiveType={type}
            allTypes={allTypes}
            editType={editType}
            key={`${currentType.name()}-${type.name()}`}
          />
        ))}
      </TypeIconListContainer>
    </TypeTableRowContainer>
  );
};
