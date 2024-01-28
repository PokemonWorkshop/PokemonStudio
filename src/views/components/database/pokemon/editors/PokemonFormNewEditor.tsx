import React, { forwardRef, useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { SelectType } from '@components/selects';
import { useProjectPokemon } from '@utils/useProjectData';
import { SelectCustomSimple } from '@components/SelectCustom';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioCreature } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useCreaturePage } from '@utils/usePage';

export const FormCategories = ['classic', 'mega-evolution'] as const;
export type FormCategory = (typeof FormCategories)[number];

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

type Props = {
  closeDialog: () => void;
  setEvolutionIndex: (index: number) => void;
};

const findFirstFormNotUsed = (pokemon: StudioCreature, category: FormCategory) => {
  const [start, end] = category === 'classic' ? [0, 29] : [30, 39];
  const formIds = pokemon.forms.map((form) => form.form).sort((a, b) => a - b);
  for (let i = start; i <= end; i++) if (!formIds.includes(i)) return i;
  return -1;
};

const formCategoryEntries = (t: TFunction<('database_pokemon' | 'database_moves')[]>) =>
  FormCategories.map((category) => ({ value: category, label: t(`database_pokemon:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

export const PokemonFormNewEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog, setEvolutionIndex }, ref) => {
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const { creature, form } = useCreaturePage();
  const { projectDataValues: creatures, setProjectDataValues: setCreature } = useProjectPokemon();
  const formCategoryOptions = useMemo(() => formCategoryEntries(t), []);
  const [formCategory, setFormCategory] = useState<FormCategory>('classic');
  const [type1, setType1] = useState(form.type1);
  const [type2, setType2] = useState(form.type2);
  const newFormId = findFirstFormNotUsed(creature, formCategory);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const newForm = cloneEntity(form);
    newForm.form = newFormId;
    newForm.type1 = type1;
    newForm.type2 = type2;
    // TODO: Make a better implementation of that, it's overwriting the original value!
    if (newFormId <= 29 && creatures[form.babyDbSymbol]?.forms.find((f) => f.form === newFormId)) form.babyForm = newFormId;
    const updatedCreature = cloneEntity(creature);
    updatedCreature.forms = [...updatedCreature.forms, newForm].sort((a, b) => a.form - b.form) as typeof updatedCreature.forms; // The non-empty thing is confused by sort
    setEvolutionIndex(0);
    setCreature({ [updatedCreature.dbSymbol]: updatedCreature }, { pokemon: { specie: updatedCreature.dbSymbol, form: newFormId } });
    closeDialog();
  };
  const checkDisabled = () => type1 === '__undef__' || newFormId === -1;

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
              onChange={(value) => setFormCategory(value as FormCategory)}
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
          <SelectType dbSymbol={type1} onChange={(value) => setType1(value as DbSymbol)} filter={(value) => value !== type2} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type2">{t('database_pokemon:type2')}</Label>
          <SelectType dbSymbol={type2} onChange={(value) => setType2(value as DbSymbol)} filter={(value) => value !== type1} noneValue noLabel />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
            {t('database_pokemon:create_form')}
          </PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
PokemonFormNewEditor.displayName = 'PokemonFormNewEditor';
