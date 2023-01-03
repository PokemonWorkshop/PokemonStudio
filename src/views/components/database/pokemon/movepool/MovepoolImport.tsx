import React, { useMemo, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustom } from '@components/SelectCustom';
import { useProjectData } from '@utils/useProjectData';
import styled from 'styled-components';
import { PokemonWithForm } from '../PokemonDataPropsInterface';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { getSelectDataOptionsOrderedById } from '@components/selects/SelectDataGeneric';
import { StudioCreatureForm } from '@modelEntities/creature';
import { getMoveKlass } from './MovepoolTable';

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

const getFormOptions = (t: TFunction<'database_pokemon'[]>, allForms: StudioCreatureForm[]) =>
  Object.entries(allForms).map(([value, formData]) => ({ value, label: t('database_pokemon:form#') + formData.form }));

export const MovepoolImport = ({ type, pokemonWithForm, onClose }: MovepoolImportProps) => {
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: currentPokemon,
    setProjectDataValues: setPokemon,
    state,
  } = useProjectData('pokemon', 'pokemon');
  const getCreatureName = useGetEntityNameText();
  const [selectedPokemon, setSelectedPokemon] = useState('bulbasaur');
  const [selectedForm, setSelectedForm] = useState(0);
  const { t } = useTranslation(['database_pokemon']);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pokemonOptions = useMemo(() => getSelectDataOptionsOrderedById(state.projectData, 'pokemon', getCreatureName), [state.projectData]);
  const formOptions = useMemo(() => getFormOptions(t, pokemon[selectedPokemon].forms), [pokemon, selectedPokemon, t]);

  const onClickValidate = () => {
    const klass = type === 'level' ? 'LevelLearnableMove' : getMoveKlass(type);
    pokemonWithForm.form.moveSet = [
      ...pokemonWithForm.form.moveSet.filter((m) => m.klass !== klass),
      ...pokemon[selectedPokemon].forms[selectedForm].moveSet.filter((m) => m.klass === klass),
    ];
    setPokemon({ [currentPokemon.specie]: pokemonWithForm.species });
    onClose();
  };

  return (
    <Editor type="movepool" title={t('database_pokemon:importation')}>
      <InputContainer size="s">
        <MovepoolImportInfo>{t(`database_pokemon:${type}_learnable_info` as never)}</MovepoolImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="pokemon">{t('database_pokemon:import_moves_from')}</Label>
          <SelectCustom // TODO: Change to SelectPokemon
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
