import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { DataBlockWithTitleNoActive, DataGrid } from '../dataBlocks';
import { DataFieldsetField, DataFieldsetFieldWithChild } from '../dataBlocks/DataFieldsetField';
import { TypeCategory } from '@components/categories';
import { TypeList } from './TypeList';
import { getEfficiencies, StudioType } from '@modelEntities/type';
import { useTypePage } from '@hooks/usePage';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';

type RenderEfficienceProps = {
  t: TFunction<'database_types'>;
  efficience: 'high_efficience' | 'low_efficience' | 'zero_efficience';
  types: StudioType[];
};

const RenderEfficience = ({ t, efficience, types }: RenderEfficienceProps) => {
  const getTypeName = useGetEntityNameTextUsingTextId();
  if (types.length === 0) {
    return <DataFieldsetField label={t(efficience)} data={t('none')} disabled />;
  }

  return (
    <DataFieldsetFieldWithChild label={t(efficience)}>
      <TypeList>
        {types.map((type) => (
          <TypeCategory type={type.dbSymbol} key={`${efficience}-${type.dbSymbol}`}>
            {getTypeName(type)}
          </TypeCategory>
        ))}
      </TypeList>
    </DataFieldsetFieldWithChild>
  );
};

export const TypeEfficiencyData = () => {
  const { types: allTypes, currentType: type } = useTypePage();
  const types: StudioType[] = Object.values(allTypes);
  const { t } = useTranslation('database_types');
  const efficiencyData = getEfficiencies(types, type);

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
