import { StudioCreatureForm } from '@modelEntities/creature';
import { useSelectOptions } from '@utils/useSelectOptions';
import React, { useState } from 'react';
import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { INFORMATION_EDITOR_SCHEMA } from './InformationEditorSchema';
import { useTranslation } from 'react-i18next';

type TypeFieldsProps = {
  defaults: Record<string, string | undefined>;
  form: Pick<StudioCreatureForm, 'type1' | 'type2'>;
};

export const TypeFields = ({ defaults, form }: TypeFieldsProps) => {
  const { t } = useTranslation('database_pokemon');
  const { t: tSelect } = useTranslation('select');
  const [type1, setType1] = useState<string>(form.type1);
  const [type2, setType2] = useState<string>(form.type2);
  const typeOptions = useSelectOptions('types');
  const { Select } = useInputAttrsWithLabel(INFORMATION_EDITOR_SCHEMA, defaults);

  const type1Options = typeOptions.filter(({ value }) => value !== type2);
  const type2Options = [{ value: '__undef__', label: tSelect('none') }, ...typeOptions.filter(({ value }) => value !== type1)];

  return (
    <>
      <Select name="type1" label={t('type1')} onChange={setType1} options={type1Options} />
      <Select name="type2" label={t('type2')} onChange={setType2} options={type2Options} />
    </>
  );
};
