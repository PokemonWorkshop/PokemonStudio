import React, { useMemo, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { ProjectData } from '@src/GlobalStateProvider';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustom } from '@components/SelectCustom';
import { useProjectData } from '@utils/useProjectData';
import styled from 'styled-components';
import { PokemonWithForm } from '../PokemonDataPropsInterface';
import { DarkButton, PrimaryButton } from '@components/buttons';
import PokemonForm from '@modelEntities/pokemon/PokemonForm';

type MovepoolImportProps = {
  type: 'level' | 'tutor' | 'tech' | 'breed' | 'evolution';
  pokemonWithForm: PokemonWithForm;
  onClose: () => void;
};

const MovepoolImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const getPokemonOptions = (allPokemon: ProjectData['pokemon']): SelectOption[] =>
  Object.entries(allPokemon)
    .map(([value, pokemonData]) => ({ value, label: pokemonData.name(), index: pokemonData.id }))
    .sort((a, b) => a.index - b.index);

const getFormOptions = (t: TFunction<'database_pokemon'[]>, allForms: PokemonForm[]): SelectOption[] =>
  Object.entries(allForms).map(([value, formData]) => ({ value, label: t('database_pokemon:form#') + formData.form }));

export const MovepoolImport = ({ type, pokemonWithForm, onClose }: MovepoolImportProps) => {
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: currentPokemon,
    setProjectDataValues: setPokemon,
  } = useProjectData('pokemon', 'pokemon');
  const [selectedPokemon, setSelectedPokemon] = useState('bulbasaur');
  const [selectedForm, setSelectedForm] = useState(0);
  const { t } = useTranslation(['database_pokemon']);
  const pokemonOptions = useMemo(() => getPokemonOptions(pokemon), [pokemon]);
  const formOptions = useMemo(() => getFormOptions(t, pokemon[selectedPokemon].forms), [pokemon, selectedPokemon, t]);

  const onClickValidate = () => {
    if (type === 'level') pokemonWithForm.form.levelLearnableMove = pokemon[selectedPokemon].clone().forms[selectedForm].levelLearnableMove;
    if (type === 'tutor') pokemonWithForm.form.tutorLearnableMove = pokemon[selectedPokemon].clone().forms[selectedForm].tutorLearnableMove;
    if (type === 'tech') pokemonWithForm.form.techLearnableMove = pokemon[selectedPokemon].clone().forms[selectedForm].techLearnableMove;
    if (type === 'breed') pokemonWithForm.form.breedLearnableMove = pokemon[selectedPokemon].clone().forms[selectedForm].breedLearnableMove;
    if (type === 'evolution')
      pokemonWithForm.form.evolutionLearnableMove = pokemon[selectedPokemon].clone().forms[selectedForm].evolutionLearnableMove;
    setPokemon({ [currentPokemon.specie]: pokemonWithForm.species });
    onClose();
  };

  return (
    <Editor type="movepool" title={t('database_pokemon:importation')}>
      <InputContainer size="s">
        <MovepoolImportInfo>{t(`database_pokemon:${type}_learnable_info` as never)}</MovepoolImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="pokemon">{t('database_pokemon:import_moves_from')}</Label>
          <SelectCustom
            options={pokemonOptions}
            onChange={(event) => {
              setSelectedPokemon(event.value);
              setSelectedForm(0);
            }}
            noOptionsText={t('database_pokemon:no_option')}
          />
          {pokemon[selectedPokemon].forms.length > 1 && (
            <SelectCustom options={formOptions} onChange={(event) => setSelectedForm(Number(event.value))} />
          )}
          <ButtonContainer>
            <PrimaryButton onClick={onClickValidate}>{t('database_pokemon:validate')}</PrimaryButton>
            <DarkButton onClick={onClose}>{t('database_pokemon:cancel')}</DarkButton>
          </ButtonContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
