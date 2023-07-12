import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectPokemon } from '@utils/useProjectData';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldsetField } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';
import { CONTROL } from '@utils/useKeyPress';
import { usePokemonShortcutNavigation } from '@utils/useShortcutNavigation';
import { useKeyPress } from 'react-flow-renderer';

const BREEDING_GROUPS = [
  'undefined',
  'monster',
  'water_1',
  'bug',
  'flying',
  'field',
  'fairy',
  'grass',
  'human_like',
  'water_3',
  'mineral',
  'amorphous',
  'water_2',
  'ditto',
  'dragon',
  'unknown',
] as const;

export const ReproductionDataBlock = ({ pokemonWithForm, dialogsRef }: PokemonDataProps) => {
  const { projectDataValues: pokemons } = useProjectPokemon();
  const getCreatureName = useGetEntityNameText();
  const { form } = pokemonWithForm;
  const { t } = useTranslation('database_pokemon');
  const creatureBreedingGroups = useMemo(() => form.breedGroups.map((group) => BREEDING_GROUPS[group]), [form.breedGroups]);
  const isClickable: boolean = useKeyPress(CONTROL) && !!pokemons[form.babyDbSymbol];
  const shortcutNavigation = usePokemonShortcutNavigation();

  return (
    <DataBlockWithTitle size="fourth" title={t('breeding')} onClick={() => (isClickable ? null : dialogsRef.current?.openDialog('breeding'))}>
      <DataGrid columns="1fr" rows="1fr 1fr 1fr">
        <DataFieldsetField
          label={t('baby')}
          data={
            form.babyDbSymbol === '__undef__'
              ? '-'
              : pokemons[form.babyDbSymbol]
              ? getCreatureName(pokemons[form.babyDbSymbol])
              : t('pokemon_deleted')
          }
          error={!pokemons[form.babyDbSymbol]}
          clickable={{
            isClickable,
            callback: () => shortcutNavigation(form.babyDbSymbol, form.babyForm),
          }}
        />
        <DataFieldsetField
          label={t('egg_groups')}
          data={
            creatureBreedingGroups[0] === creatureBreedingGroups[1]
              ? t(`${creatureBreedingGroups[0]}`)
              : t('egg_data', { group1: t(`${creatureBreedingGroups[0]}`), group2: t(`${creatureBreedingGroups[1]}`) })
          }
        />
        <DataFieldsetField label={t('hatch_steps')} data={form.hatchSteps} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
