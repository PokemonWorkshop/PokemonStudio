import React from 'react';
import styled from 'styled-components';
import { TFunction, useTranslation } from 'react-i18next';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { getEfficiency, StudioType } from '@modelEntities/type';
import { DbSymbol } from '@modelEntities/dbSymbol';

export type HelperSelectedType = {
  offensiveType: DbSymbol | undefined;
  defensiveType: DbSymbol | undefined;
};

const TypeHelperContainer = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${(props) => props.theme.colors.text400};
  text-align: center;
  user-select: none;
`;

const getHelperText = (
  offensive: DbSymbol,
  defensive: DbSymbol,
  allTypes: StudioType[],
  t: TFunction<'database_types'>,
  getTypeName: ReturnType<typeof useGetEntityNameTextUsingTextId>
) => {
  const offensiveType = allTypes.find(({ dbSymbol }) => dbSymbol === offensive) || allTypes[0];
  const defensiveType = allTypes.find(({ dbSymbol }) => dbSymbol === defensive) || allTypes[0];
  const efficiency = getEfficiency(offensiveType, defensiveType, allTypes);
  switch (efficiency) {
    case 'high_efficience':
    case 'low_efficience':
    case 'neutral':
    case 'zero_efficience':
      return t(`${efficiency}_helper`, {
        offensiveType: getTypeName(offensiveType),
        defensiveType: getTypeName(defensiveType),
      });
    default:
      assertUnreachable(efficiency);
      return '';
  }
};

type TypeHelperProps = {
  typeHelperSelected: HelperSelectedType;
  allTypes: StudioType[];
};

export const TypeHelper = ({ typeHelperSelected, allTypes }: TypeHelperProps) => {
  const { t } = useTranslation('database_types');
  const getTypeName = useGetEntityNameTextUsingTextId();

  return !typeHelperSelected.offensiveType || !typeHelperSelected.defensiveType ? (
    <></>
  ) : (
    <TypeHelperContainer>
      {getHelperText(typeHelperSelected.offensiveType, typeHelperSelected.defensiveType, allTypes, t, getTypeName)}
    </TypeHelperContainer>
  );
};
