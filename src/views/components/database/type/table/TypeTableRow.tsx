import React from 'react';
import TypeModel from '@modelEntities/type/Type.model';

import { TypeTableRowContainer, TypeIconListContainer } from './TypeTableContainers';
import { TypeTableCategory, RatioCategoryIcon } from '@components/categories';
import styled from 'styled-components';

type TypeTableRowProps = {
  currentType: TypeModel;
  allTypes: TypeModel[];
  editType: (type: TypeModel) => void;
  setHoveredDefensiveType: (value: string) => void;
};

const getRatio = (currentType: TypeModel, type: TypeModel, allTypes: TypeModel[]) => {
  const { high, low, zero } = currentType.getEfficiencies(allTypes);
  if (high.includes(type)) return 'high_efficience';
  if (low.includes(type)) return 'low_efficience';
  if (zero.includes(type)) return 'zero_efficience';
  return 'neutral';
};

const TypeCategoryContainer = styled.span`
  background-color: ${({ theme }) => theme.colors.dark16};
  position: sticky;
  left: 0;
  display: flex;
`;

export const TypeTableRow = ({ currentType, allTypes, editType, setHoveredDefensiveType }: TypeTableRowProps) => {
  return (
    <TypeTableRowContainer>
      <TypeCategoryContainer className="type-indicator" onMouseEnter={() => setHoveredDefensiveType('__undef__')}>
        <TypeTableCategory type={currentType.dbSymbol}>{currentType.name()}</TypeTableCategory>
      </TypeCategoryContainer>
      <TypeIconListContainer>
        {allTypes.map((type) => (
          <RatioCategoryIcon
            ratio={getRatio(currentType, type, allTypes)}
            offensiveType={currentType}
            defensiveType={type}
            allTypes={allTypes}
            editType={editType}
            setHoveredDefensiveType={setHoveredDefensiveType}
            key={`${currentType.name()}-${type.name()}`}
          />
        ))}
      </TypeIconListContainer>
    </TypeTableRowContainer>
  );
};
