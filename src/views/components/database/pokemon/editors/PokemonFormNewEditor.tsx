import React, { forwardRef, useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { useProjectPokemon } from '@hooks/useProjectData';
import { cloneEntity } from '@utils/cloneEntity';
import { CREATURE_FORM_VALIDATOR, StudioCreature } from '@modelEntities/creature';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useCreaturePage } from '@hooks/usePage';
import { useZodForm } from '@hooks/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { TypeFields } from './InformationEditor/TypeFields';
import { Select } from '@ds/Select';

export const FormCategories = ['classic', 'mega-evolution'] as const;
export type FormCategory = (typeof FormCategories)[number];

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

const formCategoryEntries = (t: TFunction<'database_pokemon'>) =>
  FormCategories.map((category) => ({ value: category, label: t(`${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

const CREATURE_FORM_NEW_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ type1: true, type2: true });

export const PokemonFormNewEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog, setEvolutionIndex }, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { t: tMove } = useTranslation('database_moves');
  const { creature, form } = useCreaturePage();
  const { projectDataValues: creatures, setProjectDataValues: setCreature } = useProjectPokemon();
  const formCategoryOptions = useMemo(() => formCategoryEntries(t), []);
  const [formCategory, setFormCategory] = useState<FormCategory>('classic');
  const { getFormData, defaults, formRef } = useZodForm(CREATURE_FORM_NEW_EDITOR_SCHEMA, form);
  const newFormId = findFirstFormNotUsed(creature, formCategory);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const data = getFormData();
    if (data.success == false) return;

    const newForm = cloneEntity({ ...form, ...data.data, form: newFormId });
    if (newFormId <= 29 && creatures[form.babyDbSymbol]?.forms.find((f) => f.form === newFormId)) newForm.babyForm = newFormId;

    const updatedCreature = cloneEntity(creature);
    updatedCreature.forms = [...updatedCreature.forms, newForm];
    updatedCreature.forms.sort((a, b) => a.form - b.form);
    setEvolutionIndex(0);
    setCreature({ [updatedCreature.dbSymbol]: updatedCreature }, { pokemon: { specie: updatedCreature.dbSymbol, form: newFormId } });
    closeDialog();
  };

  return (
    <Editor type="creation" title={t('new_form')}>
      <InputFormContainer ref={formRef}>
        <InputWithTopLabelContainer>
          <Label>{t('form_type')}</Label>
          <Select value={formCategory} options={formCategoryOptions} onChange={setFormCategory} />
          {newFormId === -1 ? (
            <TextInputError>{t(formCategory === 'classic' ? 'error_classic_form' : 'error_mega_evolution_form')}</TextInputError>
          ) : null}
        </InputWithTopLabelContainer>
        <TypeFields form={form} defaults={defaults} />
        <ButtonContainer>
          <PrimaryButton onClick={onClickNew} disabled={newFormId === -1}>
            {t('create_form')}
          </PrimaryButton>
          <DarkButton onClick={closeDialog}>{tMove('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
PokemonFormNewEditor.displayName = 'PokemonFormNewEditor';
