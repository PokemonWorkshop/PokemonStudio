import React, { useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import PokemonModel, { FormCategories, FormCategory } from '@modelEntities/pokemon/Pokemon.model';
import { Editor, useRefreshUI } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { SelectType } from '@components/selects';
import { useProjectPokemon } from '@utils/useProjectData';
import { SelectCustomSimple } from '@components/SelectCustom';

const InputWithError = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type PokemonFormNewEditorProps = {
  currentPokemon: PokemonModel;
  onClose: () => void;
};

const findFirstFormNotUsed = (pokemon: PokemonModel, start: number, end: number) => {
  const formIds = pokemon.forms.map((form) => form.form).sort((a, b) => a - b);
  for (let i = start; i <= end; i++) if (!formIds.includes(i)) return i;
  return -1;
};
const formCategoryEntries = (t: TFunction<('database_pokemon' | 'database_moves')[]>) =>
  FormCategories.map((category) => ({ value: category, label: t(`database_pokemon:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

export const PokemonFormNewEditor = ({ currentPokemon, onClose }: PokemonFormNewEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const { setProjectDataValues: setPokemon } = useProjectPokemon();
  const formCategoryOptions = useMemo(() => formCategoryEntries(t), [t]);
  const [newFormId, setNewFormId] = useState(findFirstFormNotUsed(currentPokemon, 0, 29));
  const [formCategory, setFormCategory] = useState<FormCategory>('classic');
  const [types] = useState({ type1: currentPokemon.forms[0].type1, type2: currentPokemon.forms[0].type2 });
  const refreshUI = useRefreshUI();

  const onClickNew = () => {
    const form = currentPokemon.clone().forms[0];
    form.form = newFormId;
    form.type1 = types.type1;
    form.type2 = types.type2;
    currentPokemon.forms.push(form);
    currentPokemon.forms.sort((a, b) => a.form - b.form);
    const formIndex = currentPokemon.forms.findIndex((f) => f.form === newFormId);
    setPokemon({ [currentPokemon.dbSymbol]: currentPokemon }, { pokemon: { specie: currentPokemon.dbSymbol, form: formIndex } });
    onClose();
  };

  const onChangeForm = (value: FormCategory) => {
    setFormCategory(value);
    if (value === 'classic') setNewFormId(findFirstFormNotUsed(currentPokemon, 0, 29));
    if (value === 'mega-evolution') setNewFormId(findFirstFormNotUsed(currentPokemon, 30, 39));
  };

  return (
    <Editor type="creation" title={t('database_pokemon:new_form')}>
      <InputContainer>
        <InputWithError>
          <InputWithTopLabelContainer>
            <Label htmlFor="form">{t('database_pokemon:form_type')}</Label>
            <SelectCustomSimple
              id="select-form"
              value={formCategory}
              options={formCategoryOptions}
              onChange={(value) => onChangeForm(value as FormCategory)}
              noTooltip
            />
            {newFormId === -1 && formCategory === 'classic' && <TextInputError>{t('database_pokemon:error_classic_form')}</TextInputError>}
            {newFormId === -1 && formCategory === 'mega-evolution' && (
              <TextInputError>{t('database_pokemon:error_mega_evolution_form')}</TextInputError>
            )}
          </InputWithTopLabelContainer>
        </InputWithError>
        <InputWithTopLabelContainer>
          <Label htmlFor="type1">{t('database_pokemon:type1')}</Label>
          <SelectType dbSymbol={types.type1} onChange={(event) => refreshUI((types.type1 = event.value))} rejected={[types.type2]} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type2">{t('database_pokemon:type2')}</Label>
          <SelectType
            dbSymbol={types.type2}
            onChange={(event) => refreshUI((types.type2 = event.value))}
            rejected={[types.type1]}
            noneValue
            noLabel
          />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickNew} disabled={newFormId === -1}>
            {t('database_pokemon:create_form')}
          </PrimaryButton>
          <DarkButton onClick={onClose}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
