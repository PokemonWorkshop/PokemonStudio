import React from 'react';
import TypeModel from '@modelEntities/type/Type.model';

import { TypeTableRowContainer, TypeIconListContainer } from './TypeTableContainers';
import { TypeTableCategory, RatioCategoryIcon } from '@components/categories';
import styled from 'styled-components';
import { HelperSelectedType } from '../TypeHelper';

type TypeTableRowProps = {
  currentType: TypeModel;
  allTypes: TypeModel[];
  editType: (type: TypeModel) => void;
  setHoveredDefensiveType: (value: string) => void;
  setTypeHelperSelected: (typeHelperSelected: HelperSelectedType) => void;
};

const TypeCategoryContainer = styled.span`
  background-color: ${({ theme }) => theme.colors.dark16};
  position: sticky;
  left: 0;
  display: flex;
`;

export const TypeTableRow = ({ currentType, allTypes, editType, setHoveredDefensiveType, setTypeHelperSelected }: TypeTableRowProps) => {
  const onMouseEnter = () => {
    setHoveredDefensiveType('__undef__');
    setTypeHelperSelected({ offensiveType: undefined, defensiveType: undefined });
  };

  return (
    <TypeTableRowContainer>
      <TypeCategoryContainer className="type-indicator" onMouseEnter={onMouseEnter}>
        <TypeTableCategory type={currentType.dbSymbol}>{currentType.name()}</TypeTableCategory>
      </TypeCategoryContainer>
      <TypeIconListContainer>
        {allTypes.map((type) => (
          <RatioCategoryIcon
            ratio={TypeModel.getEfficiency(currentType, type, allTypes)}
            offensiveType={currentType}
            defensiveType={type}
            allTypes={allTypes}
            editType={editType}
            setHoveredDefensiveType={setHoveredDefensiveType}
            setTypeHelperSelected={setTypeHelperSelected}
            key={`${currentType.name()}-${type.name()}`}
          />
        ))}
      </TypeIconListContainer>
    </TypeTableRowContainer>
  );
};
