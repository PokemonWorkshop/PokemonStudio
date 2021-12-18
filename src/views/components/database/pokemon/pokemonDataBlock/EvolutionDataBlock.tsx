import { useProjectPokemon } from '@utils/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitlePagination, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

type EvolutionDataBlockProps = {
  evolutionIndex: number;
  setEvolutionIndex: (index: number) => void;
} & PokemonDataProps;

export const EvolutionDataBlock = ({ pokemonWithForm, evolutionIndex, setEvolutionIndex, onClick }: EvolutionDataBlockProps) => {
  const { projectDataValues: pokemon } = useProjectPokemon();
  const { t } = useTranslation('database_pokemon');
  const { species, form } = pokemonWithForm;

  const evolutionCount = form.evolutions.length;
  const evolution = form.evolutions[evolutionIndex];
  const megaPrefix = evolution && evolution.conditions.some((condition) => condition.type === 'gemme') ? 'Mega-' : '';
  const minLevel = evolution?.conditions.find((condition) => condition.type === 'minLevel')?.value || '-';
  const conditionType = evolution?.conditions.find((condition) => condition.type !== 'minLevel')?.type;

  const onChangeIndex = (arrow: 'left' | 'right') => {
    if (arrow === 'left') {
      if (evolutionIndex <= 0) return;
      setEvolutionIndex(evolutionIndex - 1);
    } else {
      if (evolutionIndex >= evolutionCount - 1) return;
      setEvolutionIndex(evolutionIndex + 1);
    }
  };

  return (
    <DataBlockWithTitlePagination
      size="fourth"
      title={t('evolution')}
      index={evolutionIndex}
      max={evolutionCount}
      onChangeIndex={onChangeIndex}
      onClick={onClick}
    >
      {evolutionCount === 0 || !evolution ? (
        <DataGrid columns="1fr" rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('evolves_into')} disabled data={t('none')} />
          <DataFieldsetField label={t('at_level')} disabled data="-" />
          <DataFieldsetField label={t('evolves_if')} disabled data={t('no_condition')} />
        </DataGrid>
      ) : (
        <DataGrid columns="1fr" rows="1fr 1fr 1fr">
          <DataFieldsetField
            label={t('evolves_into')}
            data={`${megaPrefix}${pokemon[evolution.dbSymbol || species.dbSymbol]?.name() || '__undef__'}`}
          />
          <DataFieldsetField label={t('at_level')} disabled={minLevel === '-'} data={minLevel.toString()} />
          <DataFieldsetField
            label={t('evolves_if')}
            disabled={conditionType === undefined}
            data={conditionType ? t(`evolutionCondition_${conditionType}`) : t('no_condition')}
          />
        </DataGrid>
      )}
    </DataBlockWithTitlePagination>
  );
};
