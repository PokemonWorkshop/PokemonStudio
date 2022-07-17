import React from 'react';
import TypeModel from '@modelEntities/type/Type.model';
import { TFunction } from 'react-i18next';

import { TypeTableHeadContainer, TypeIconListContainer, TypeTableHeadTitleContainer } from './TypeTableContainers';
import { DataFieldsetFieldCenteredWithChild } from '../../dataBlocks/DataFieldsetField';
import { TypeCategoryIcon } from '@components/categories';
import styled from 'styled-components';

type TypeTableHeadProps = {
  allTypes: TypeModel[];
  t: TFunction<'database_types'>;
  hoveredDefensiveType: string;
};

// We need that because the flex container compute its background by what was actually visible on the screen
// TODO: Improve DataField component so their style can be extended
const Background = styled.div`
  background-color: ${({ theme }) => theme.colors.dark16};
  padding-right: 2px;
`;

export const TypeTableHead = ({ allTypes, t, hoveredDefensiveType }: TypeTableHeadProps) => {
  return (
    <TypeTableHeadContainer>
      <TypeTableHeadTitleContainer>{t('offensive')}</TypeTableHeadTitleContainer>
      <Background>
        <DataFieldsetFieldCenteredWithChild label={t('defensive')} size="m">
          <TypeIconListContainer>
            {allTypes.map((type) => (
              <TypeCategoryIcon
                type={type.dbSymbol}
                key={`${type.name()}-icon`}
                className={hoveredDefensiveType === type.dbSymbol ? 'hovered-defensive-type' : undefined}
              />
            ))}
          </TypeIconListContainer>
        </DataFieldsetFieldCenteredWithChild>
      </Background>
    </TypeTableHeadContainer>
  );
};
