import React from 'react';
import styled from 'styled-components';
import { TFunction, useTranslation } from 'react-i18next';
import TypeModel from '@modelEntities/type/Type.model';
import { assertUnreachable } from '@utils/assertUnreachable';

export type HelperSelectedType = {
  offensiveType: TypeModel | undefined;
  defensiveType: TypeModel | undefined;
};

const TypeHelperContainer = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${(props) => props.theme.colors.text400};
  text-align: center;
  user-select: none;
`;

const getHelperText = (typeHelperSelected: HelperSelectedType, allTypes: TypeModel[], t: TFunction<'database_types'>) => {
  if (!typeHelperSelected.offensiveType || !typeHelperSelected.defensiveType) return '';

  const efficiency = TypeModel.getEfficiency(typeHelperSelected.offensiveType, typeHelperSelected.defensiveType, allTypes);
  switch (efficiency) {
    case 'high_efficience':
    case 'low_efficience':
    case 'neutral':
    case 'zero_efficience':
      return t(`${efficiency}_helper`, {
        offensiveType: typeHelperSelected.offensiveType.name(),
        defensiveType: typeHelperSelected.defensiveType.name(),
      });
    default:
      assertUnreachable(efficiency);
      return '';
  }
};

type TypeHelperProps = {
  typeHelperSelected: HelperSelectedType;
  allTypes: TypeModel[];
};

export const TypeHelper = ({ typeHelperSelected, allTypes }: TypeHelperProps) => {
  const { t } = useTranslation('database_types');

  return !typeHelperSelected.offensiveType || !typeHelperSelected.defensiveType ? (
    <></>
  ) : (
    <TypeHelperContainer>{getHelperText(typeHelperSelected, allTypes, t)}</TypeHelperContainer>
  );
};
