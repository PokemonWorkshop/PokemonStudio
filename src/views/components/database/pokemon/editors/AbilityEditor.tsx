import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useCreaturePage } from '@utils/usePage';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';
import { CREATURE_FORM_VALIDATOR } from '@modelEntities/creature';
import { useSelectOptions } from '@utils/useSelectOptions';
import { useZodForm } from '@utils/useZodForm';
import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';

const ABILITY_TEXT_KEYS = ['ability_1', 'ability_2', 'hidden_ability'] as const;
const ABILITY_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ abilities: true });

export const AbilityEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const options = useSelectOptions('abilities');
  const { canClose, getFormData, defaults, formRef } = useZodForm(ABILITY_EDITOR_SCHEMA, form);
  const { Select } = useInputAttrsWithLabel(ABILITY_EDITOR_SCHEMA, defaults);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateForm(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('abilities')}>
      <InputFormContainer ref={formRef}>
        {ABILITY_TEXT_KEYS.map((label, index) => (
          <Select name={`abilities.${index}`} label={t(label)} options={options} key={label} />
        ))}
      </InputFormContainer>
    </Editor>
  );
});
AbilityEditor.displayName = 'AbilityEditor';
