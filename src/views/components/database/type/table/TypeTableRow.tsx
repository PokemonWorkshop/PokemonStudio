import React from 'react';

import { TypeTableRowContainer, TypeIconListContainer } from './TypeTableContainers';
import { TypeTableCategory, RatioCategoryIcon } from '@components/categories';
import styled from 'styled-components';
import { HelperSelectedType } from '../TypeHelper';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { StudioType } from '@modelEntities/type';

type TypeTableRowProps = {
  currentType: StudioType;
  allTypes: StudioType[];
  editType: (type: StudioType) => void;
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
  const getTypeName = useGetEntityNameTextUsingTextId();
  const onMouseEnter = () => {
    setHoveredDefensiveType('__undef__');
    setTypeHelperSelected({ offensiveType: undefined, defensiveType: undefined });
  };

  return (
    <TypeTableRowContainer>
      <TypeCategoryContainer className="type-indicator" onMouseEnter={onMouseEnter}>
        <TypeTableCategory type={currentType.dbSymbol}>{getTypeName(currentType)}</TypeTableCategory>
      </TypeCategoryContainer>
      <TypeIconListContainer>
        {allTypes.map((type) => (
          <RatioCategoryIcon
            offensiveType={currentType}
            defensiveType={type}
            allTypes={allTypes}
            editType={editType}
            setHoveredDefensiveType={setHoveredDefensiveType}
            setTypeHelperSelected={setTypeHelperSelected}
            key={`${currentType.dbSymbol}-${type.dbSymbol}`}
          />
        ))}
      </TypeIconListContainer>
    </TypeTableRowContainer>
  );
};
