import { DarkButton, PrimaryButton } from '@components/buttons';
import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { Input, MultiLineInput, TextInputError } from '@components/inputs/Input';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { Select } from '@ds/Select';
import { useCreaturePage } from '@hooks/usePage';
import { useProjectPokemon } from '@hooks/useProjectData';
import { useZodForm } from '@hooks/useZodForm';
import { CREATURE_FORM_DESCRIPTION_TEXT_ID, CREATURE_FORM_NAME_TEXT_ID, CREATURE_FORM_VALIDATOR, StudioCreature } from '@modelEntities/creature';
import { useGetEntityDescriptionText, useSetProjectText } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';
import { createCreatureForm } from '@utils/entityCreation';
import { TFunction } from 'i18next';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TypeFields } from './InformationEditor/TypeFields';

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

const formCategoryEntries = (t: TFunction) =>
  FormCategories.map((category) => ({ value: category, label: t(`${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

const CREATURE_FORM_NEW_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ type1: true, type2: true });

export const PokemonFormNewEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog, setEvolutionIndex }, ref) => {
  const { t } = useTranslation();
  const { creature, form, creatureName } = useCreaturePage();
  const { projectDataValues: creatures, setProjectDataValues: setCreature } = useProjectPokemon();
  const setText = useSetProjectText();
  const getCreatureDescription = useGetEntityDescriptionText();
  const formCategoryOptions = useMemo(() => formCategoryEntries(t), []);
  const [formCategory, setFormCategory] = useState<FormCategory>('classic');
  const { getFormData, defaults, formRef } = useZodForm(CREATURE_FORM_NEW_EDITOR_SCHEMA, form);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const newFormId = findFirstFormNotUsed(creature, formCategory);
  const [formName, setFormName] = useState(creatureName);
  const [inheritMoveSet, setInheritMoveSet] = useState(true);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const data = getFormData();
    if (data.success == false || !descriptionRef.current) return;

    const newForm = createCreatureForm(creatures, form, data.data, newFormId, inheritMoveSet);
    if (newFormId <= 29 && creatures[form.babyDbSymbol]?.forms.find((f) => f.form === newFormId)) newForm.babyForm = newFormId;

    const updatedCreature = cloneEntity(creature);
    updatedCreature.forms = [...updatedCreature.forms, newForm];
    updatedCreature.forms.sort((a, b) => a.form - b.form);

    setText(CREATURE_FORM_NAME_TEXT_ID, newForm.formTextId.name, formName);
    setText(CREATURE_FORM_DESCRIPTION_TEXT_ID, newForm.formTextId.description, descriptionRef.current.value);

    setEvolutionIndex(0);
    setCreature({ [updatedCreature.dbSymbol]: updatedCreature }, { pokemon: { specie: updatedCreature.dbSymbol, form: newFormId } });
    closeDialog();
  };

  const isDisabled = newFormId === -1 || !formName;

  return (
    <Editor type="creation" title={t('new_form')}>
      <InputFormContainer ref={formRef}>
        <InputWithTopLabelContainer>
          <Label required>{t('form_name')}</Label>
          <Input value={formName} onChange={(event) => setFormName(event.currentTarget.value)} placeholder={t('example_form_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('form_description')}</Label>
          <MultiLineInput ref={descriptionRef} defaultValue={getCreatureDescription(creature)} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('form_type')}</Label>
          <Select value={formCategory} options={formCategoryOptions} onChange={setFormCategory} />
          {newFormId === -1 ? (
            <TextInputError>{t(formCategory === 'classic' ? 'error_classic_form' : 'error_mega_evolution_form')}</TextInputError>
          ) : null}
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label>{t('inherit_movepool')}</Label>
          <Toggle checked={inheritMoveSet} onChange={(event) => setInheritMoveSet(event.currentTarget.checked)} />
        </InputWithLeftLabelContainer>
        <TypeFields form={form} defaults={defaults} />
        <ButtonContainer>
          <PrimaryButton onClick={onClickNew} disabled={isDisabled}>
            {t('create_form')}
          </PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
PokemonFormNewEditor.displayName = 'PokemonFormNewEditor';
