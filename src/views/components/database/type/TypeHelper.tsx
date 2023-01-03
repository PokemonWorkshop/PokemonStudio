import React from 'react';
import styled from 'styled-components';
import { TFunction, useTranslation } from 'react-i18next';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { getEfficiency, StudioType } from '@modelEntities/type';

export type HelperSelectedType = {
  offensiveType: StudioType | undefined;
  defensiveType: StudioType | undefined;
};

const TypeHelperContainer = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${(props) => props.theme.colors.text400};
  text-align: center;
  user-select: none;
`;

const getHelperText = (
  typeHelperSelected: HelperSelectedType,
  allTypes: StudioType[],
  t: TFunction<'database_types'>,
  getTypeName: ReturnType<typeof useGetEntityNameTextUsingTextId>
) => {
  if (!typeHelperSelected.offensiveType || !typeHelperSelected.defensiveType) return '';

  const efficiency = getEfficiency(typeHelperSelected.offensiveType, typeHelperSelected.defensiveType, allTypes);
  switch (efficiency) {
    case 'high_efficience':
    case 'low_efficience':
    case 'neutral':
    case 'zero_efficience':
      return t(`${efficiency}_helper`, {
        offensiveType: getTypeName(typeHelperSelected.offensiveType),
        defensiveType: getTypeName(typeHelperSelected.defensiveType),
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
    <TypeHelperContainer>{getHelperText(typeHelperSelected, allTypes, t, getTypeName)}</TypeHelperContainer>
  );
};
