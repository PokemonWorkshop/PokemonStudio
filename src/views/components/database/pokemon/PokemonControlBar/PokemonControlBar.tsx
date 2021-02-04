import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '../../../../../GlobalStateProvider';
import { ControlBar } from '../../../BaseControlBar';
import { SecondaryButton } from '../../../buttons/SecondaryButton';
import { SelectCustom } from '../../../SelectCustom';
import { SelectOption } from '../../../SelectCustom/SelectCustomPropsInterface';
import { PokemonControlBarProps } from './PokemonControlBarPropsInterface';

export const PokemonControlBar: FunctionComponent<PokemonControlBarProps> = (
  props: PokemonControlBarProps
) => {
  const { onPokemonChange } = props;
  const [state] = useGlobalState();
  const { t } = useTranslation('database_pokemon');

  function pokemonList() {
    const options: SelectOption[] = [];
    Object.entries(state.projectData.pokemon)
      .map(([key, pokemon]) => {
        return {
          value: key,
          label: pokemon.dbSymbol || '',
          id: pokemon.id,
        };
      })
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .forEach((option) =>
        options.push({ value: option.value, label: option.label })
      );
    return options;
  }

  return (
    <ControlBar>
      <SecondaryButton>
        <span>Nouveau Pokémon</span>
      </SecondaryButton>
      <SelectCustom
        options={pokemonList()}
        label={t('pokemon')}
        onChange={onPokemonChange}
        noOptionsText={t('no_option')}
        defaultValue={{
          value: 'bulbasaur',
          label: 'bulbasaur',
        }}
      />
    </ControlBar>
  );
};
