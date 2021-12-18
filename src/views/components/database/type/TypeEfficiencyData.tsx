import React from 'react';
import TypeModel from '@modelEntities/type/Type.model';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitleNoActive, DataGrid } from '../dataBlocks';
import { DataFieldsetField, DataFieldsetFieldWithChild } from '../dataBlocks/DataFieldsetField';
import { TypeCategory } from '@components/categories';
import { TypeList } from './TypeList';

type TypeEfficiencyDataProps = {
  type: TypeModel;
  types: TypeModel[];
};

type RenderEfficienceProps = {
  t: TFunction<'database_types'>;
  efficience: 'high_efficience' | 'low_efficience' | 'zero_efficience';
  types: TypeModel[];
};

const RenderEfficience = ({ t, efficience, types }: RenderEfficienceProps) => {
  if (types.length === 0) {
    return <DataFieldsetField label={t(efficience)} data={t('none')} disabled />;
  }

  return (
    <DataFieldsetFieldWithChild label={t(efficience)}>
      <TypeList>
        {types.map((type) => (
          <TypeCategory type={type.dbSymbol} key={`${efficience}-${type.dbSymbol}`}>
            {type.name()}
          </TypeCategory>
        ))}
      </TypeList>
    </DataFieldsetFieldWithChild>
  );
};

export const TypeEfficiencyData = ({ type, types }: TypeEfficiencyDataProps) => {
  const { t } = useTranslation('database_types');
  const efficiencyData = type.getEfficiencies(types);

  return (
    <DataBlockWithTitleNoActive size="half" title={t('efficiencies')}>
      <DataGrid rows="min-content min-content auto">
        <RenderEfficience t={t} types={efficiencyData.high} efficience="high_efficience" />
        <RenderEfficience t={t} types={efficiencyData.low} efficience="low_efficience" />
        <RenderEfficience t={t} types={efficiencyData.zero} efficience="zero_efficience" />
      </DataGrid>
    </DataBlockWithTitleNoActive>
  );
};
