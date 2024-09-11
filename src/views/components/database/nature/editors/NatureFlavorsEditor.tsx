import React, { forwardRef, useMemo } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { NATURE_VALIDATOR, FLAVOR_LIST } from '@modelEntities/nature';
import { useNaturePage } from '@hooks/usePage';
import { useUpdateNature } from './useUpdateNature';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';

const flavorEntries = (t: TFunction<'database_natures'>) => FLAVOR_LIST.map((flavor) => ({ value: flavor, label: t(flavor) }));

const FLAVORS_EDITOR_SCHEMA = NATURE_VALIDATOR.pick({
  flavors: true,
});

export const NatureFlavorsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_natures');
  const { nature } = useNaturePage();
  const updateNature = useUpdateNature(nature);
  const { canClose, getFormData, defaults, formRef } = useZodForm(FLAVORS_EDITOR_SCHEMA, nature);
  const { Select } = useInputAttrsWithLabel(FLAVORS_EDITOR_SCHEMA, defaults);
  const flavorOptions = useMemo(() => flavorEntries(t), [t]);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateNature(result.data);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('flavors')}>
      <InputFormContainer ref={formRef}>
        <Select name="flavors.liked" label={t('liked_flavor')} options={flavorOptions} data-input-type="string" />
        <Select name="flavors.disliked" label={t('disliked_flavor')} options={flavorOptions} data-input-type="string" />
      </InputFormContainer>
    </Editor>
  );
});
NatureFlavorsEditor.displayName = 'NatureFlavorsEditor';
