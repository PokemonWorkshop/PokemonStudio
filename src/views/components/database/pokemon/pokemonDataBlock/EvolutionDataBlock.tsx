import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectPokemon } from '@hooks/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitlePagination, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';
import { CONTROL } from '@hooks/useKeyPress';
import { useKeyPress } from 'react-flow-renderer';
import { usePokemonShortcutNavigation } from '@hooks/useShortcutNavigation';

type EvolutionDataBlockProps = {
  evolutionIndex: number;
  setEvolutionIndex: (index: number) => void;
} & PokemonDataProps;

export const EvolutionDataBlock = ({ pokemonWithForm, evolutionIndex, setEvolutionIndex, dialogsRef }: EvolutionDataBlockProps) => {
  const { projectDataValues: pokemon } = useProjectPokemon();
  const { t } = useTranslation('database_pokemon');
  const getEntityName = useGetEntityNameText();
  const { species, form } = pokemonWithForm;

  const evolutionCount = form.evolutions.length;
  const evolution = form.evolutions[evolutionIndex];
  const megaPrefix = evolution && evolution.conditions.some((condition) => condition.type === 'gemme') ? 'Mega-' : '';
  const minLevel = evolution?.conditions.find((condition) => condition.type === 'minLevel')?.value;
  const conditionType = evolution?.conditions.find((condition) => condition.type !== 'minLevel')?.type;

  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutNavigation = usePokemonShortcutNavigation();

  const onChangeIndex = (arrow: 'left' | 'right') => {
    if (arrow === 'left') {
      if (evolutionIndex <= 0) return;
      setEvolutionIndex(evolutionIndex - 1);
    } else {
      if (evolutionIndex >= evolutionCount - 1) return;
      setEvolutionIndex(evolutionIndex + 1);
    }
  };

  const currentCreature = pokemon[megaPrefix ? species.dbSymbol : evolution?.dbSymbol || species.dbSymbol];

  return (
    <DataBlockWithTitlePagination
      size="fourth"
      title={t('evolution')}
      index={evolutionIndex}
      max={evolutionCount}
      onChangeIndex={onChangeIndex}
      onClick={() => (isClickable ? null : dialogsRef.current?.openDialog('evolution'))}
    >
      {evolutionCount === 0 || !evolution ? (
        <DataGrid columns="1fr" rows="1fr 1fr 1fr">
          <DataFieldsetField label={t('evolves_into')} disabled data={t('none')} />
        </DataGrid>
      ) : (
        <DataGrid columns="1fr" rows="1fr 1fr 1fr">
          <DataFieldsetField
            label={t('evolves_into')}
            data={`${megaPrefix}${
              currentCreature ? getEntityName(currentCreature) : evolution?.dbSymbol === '__undef__' ? t('none') : t('pokemon_deleted')
            }`}
            error={evolution?.dbSymbol !== '__undef__' && currentCreature === undefined}
            disabled={evolution?.dbSymbol === '__undef__'}
            clickable={{
              isClickable,
              callback: () => shortcutNavigation(evolution?.dbSymbol || currentCreature.dbSymbol, evolution?.form),
            }}
          />
          {minLevel !== undefined && <DataFieldsetField label={t('at_level')} data={minLevel.toString()} />}
          {conditionType !== undefined && <DataFieldsetField label={t('evolves_if')} data={t(`evolutionCondition_${conditionType}`)} />}
        </DataGrid>
      )}
    </DataBlockWithTitlePagination>
  );
};
