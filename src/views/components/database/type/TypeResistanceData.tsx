import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitleNoActive, DataGrid } from '../dataBlocks';
import { DataFieldsetField, DataFieldsetFieldWithChild } from '../dataBlocks/DataFieldsetField';
import { TypeCategory } from '@components/categories';
import { TypeList } from './TypeList';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { StudioType } from '@modelEntities/type';
import { useTypePage } from '@hooks/usePage';

type RenderResistanceProps = {
  t: TFunction<'database_types'>;
  resistance: 'weak_resistance' | 'high_resistance' | 'immunity';
  types: StudioType[];
};

const RenderResistance = ({ t, resistance, types }: RenderResistanceProps) => {
  const getTypeName = useGetEntityNameTextUsingTextId();
  if (types.length === 0) {
    return <DataFieldsetField label={t(resistance)} data={t('none')} disabled />;
  }

  return (
    <DataFieldsetFieldWithChild label={t(resistance)}>
      <TypeList>
        {types.map((type) => (
          <TypeCategory type={type.dbSymbol} key={`${resistance}-${type.dbSymbol}`}>
            {getTypeName(type)}
          </TypeCategory>
        ))}
      </TypeList>
    </DataFieldsetFieldWithChild>
  );
};

const getTypesFromFactorInOtherTypes = (allTypes: StudioType[], typeDbSymbol: string, factor: number) =>
  allTypes.filter((type) => type.damageTo.find((dmg) => dmg.defensiveType === typeDbSymbol && dmg.factor === factor));

const getResistances = (allTypes: StudioType[], type: StudioType) => {
  return {
    high: getTypesFromFactorInOtherTypes(allTypes, type.dbSymbol, 0.5),
    low: getTypesFromFactorInOtherTypes(allTypes, type.dbSymbol, 2),
    zero: getTypesFromFactorInOtherTypes(allTypes, type.dbSymbol, 0),
  };
};

export const TypeResistanceData = () => {
  const { types: allTypes, currentType: type } = useTypePage();
  const types: StudioType[] = Object.values(allTypes);
  const { t } = useTranslation('database_types');
  const efficiencyData = getResistances(types, type);

  return (
    <DataBlockWithTitleNoActive size="half" title={t('resistances')}>
      <DataGrid rows="min-content min-content auto">
        <RenderResistance t={t} types={efficiencyData.low} resistance="weak_resistance" />
        <RenderResistance t={t} types={efficiencyData.high} resistance="high_resistance" />
        <RenderResistance t={t} types={efficiencyData.zero} resistance="immunity" />
      </DataGrid>
    </DataBlockWithTitleNoActive>
  );
};
