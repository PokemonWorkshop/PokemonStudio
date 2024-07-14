import React, { useMemo, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useProjectData } from '@hooks/useProjectData';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { getMoveKlass } from './MovepoolTable';
import { cloneEntity } from '@utils/cloneEntity';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';

type MovepoolImportProps = {
  type: 'level' | 'tutor' | 'tech' | 'breed' | 'evolution';
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

export const MovepoolImport = ({ type, onClose }: MovepoolImportProps) => {
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: currentPokemon,
    setProjectDataValues: setPokemon,
  } = useProjectData('pokemon', 'pokemon');
  const [selectedPokemon, setSelectedPokemon] = useState('__undef__');
  const [selectedForm, setSelectedForm] = useState(0);
  const { t } = useTranslation(['database_pokemon', 'select']);
  const currentEditedPokemon = useMemo(() => cloneEntity(pokemon[currentPokemon.specie]), [pokemon, currentPokemon.specie]);

  const onClickValidate = () => {
    const klass = type === 'level' ? 'LevelLearnableMove' : getMoveKlass(type);
    const form = currentEditedPokemon.forms.find((f) => f.form === currentPokemon.form);
    if (!form) return;

    const currentSelectedForm = pokemon[selectedPokemon].forms.find((f) => f.form === selectedForm);
    if (!currentSelectedForm) return;

    form.moveSet = [...form.moveSet.filter((m) => m.klass !== klass), ...currentSelectedForm.moveSet.filter((m) => m.klass === klass)];
    setPokemon({ [currentPokemon.specie]: currentEditedPokemon });
    onClose();
  };

  return (
    <Editor type="movepool" title={t('database_pokemon:importation')}>
      <InputContainer size="s">
        <MovepoolImportInfo>{t(`database_pokemon:${type}_learnable_info` as never)}</MovepoolImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="pokemon">{t('database_pokemon:import_moves_from')}</Label>
          <SelectPokemon
            dbSymbol={selectedPokemon}
            onChange={(event) => {
              setSelectedPokemon(event);
              setSelectedForm(0);
            }}
            noLabel
            undefValueOption={t('select:none')}
          />
          {selectedPokemon !== '__undef__' && pokemon[selectedPokemon].forms.length > 1 && (
            <SelectPokemonForm dbSymbol={selectedPokemon} form={selectedForm} onChange={(event) => setSelectedForm(Number(event))} noLabel />
          )}
          <ButtonContainer>
            <PrimaryButton onClick={onClickValidate} disabled={selectedPokemon === '__undef__'}>
              {t('database_pokemon:validate')}
            </PrimaryButton>
            <DarkButton onClick={onClose}>{t('database_pokemon:cancel')}</DarkButton>
          </ButtonContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
