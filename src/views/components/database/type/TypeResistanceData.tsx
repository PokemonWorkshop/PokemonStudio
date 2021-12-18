import React from 'react';
import TypeModel from '@modelEntities/type/Type.model';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitleNoActive, DataGrid } from '../dataBlocks';
import { DataFieldsetField, DataFieldsetFieldWithChild } from '../dataBlocks/DataFieldsetField';
import { TypeCategory } from '@components/categories';
import { TypeList } from './TypeList';

type TypeResistanceDataProps = {
  type: TypeModel;
  types: TypeModel[];
};

type RenderResistanceProps = {
  t: TFunction<'database_types'>;
  resistance: 'weak_resistance' | 'high_resistance' | 'immunity';
  types: TypeModel[];
};

const RenderResistance = ({ t, resistance, types }: RenderResistanceProps) => {
  if (types.length === 0) {
    return <DataFieldsetField label={t(resistance)} data={t('none')} disabled />;
  }

  return (
    <DataFieldsetFieldWithChild label={t(resistance)}>
      <TypeList>
        {types.map((type) => (
          <TypeCategory type={type.dbSymbol} key={`${resistance}-${type.dbSymbol}`}>
            {type.name()}
          </TypeCategory>
        ))}
      </TypeList>
    </DataFieldsetFieldWithChild>
  );
};

export const TypeResistanceData = ({ type, types }: TypeResistanceDataProps) => {
  const { t } = useTranslation('database_types');
  const efficiencyData = type.getResistances(types);

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
