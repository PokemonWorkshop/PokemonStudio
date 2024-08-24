import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { StudioCreatureForm } from '@modelEntities/creature';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { BreakableSpan } from './SelectPokemon';
import { Select } from '@ds/Select';
import { useGetCreatureFormNameText } from '@utils/ReadingProjectText';

const getFormOptions = (getCreatureFormName: (form: StudioCreatureForm) => string, forms: StudioCreatureForm[]) =>
  forms.map((formData) => ({ value: formData.form.toString(), label: `${getCreatureFormName(formData)} (n°${formData.form})` }));

type SelectPokemonFormProps = {
  dbSymbol: string;
  form: number | string;
  onChange: (form: string) => void;
  undefValueOption?: string;
  breakpoint?: string;
  noLabel?: boolean;
};

export const SelectPokemonForm = ({ dbSymbol, form, onChange, noLabel, breakpoint, undefValueOption }: SelectPokemonFormProps) => {
  const { t } = useTranslation('database_pokemon');
  const [state] = useGlobalState();
  const getCreatureFormName = useGetCreatureFormNameText();
  const options = useMemo(() => {
    const formOptions = getFormOptions(getCreatureFormName, state.projectData.pokemon[dbSymbol]?.forms || []);
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...formOptions];
    return formOptions;
  }, [dbSymbol, undefValueOption, getCreatureFormName, state]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('form_deleted') }), []);

  if (noLabel) return <StudioDropDown value={form.toString()} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <BreakableSpan breakpoint={breakpoint}>{t('form')}</BreakableSpan>
      <StudioDropDown value={form.toString()} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};

type SelectCreatureFormProps = {
  name: string;
  dbSymbol: string;
  defaultValue?: string;
  onChange?: (v: string, isValid: boolean) => void;
};

export const SelectCreatureForm = ({ dbSymbol, onChange, ...props }: SelectCreatureFormProps) => {
  const { t } = useTranslation('database_pokemon');
  const [state] = useGlobalState();
  const getCreatureFormName = useGetCreatureFormNameText();
  const options = useMemo(() => getFormOptions(getCreatureFormName, state.projectData.pokemon[dbSymbol]?.forms || []), [dbSymbol, state]);
  const onValidatedChange = useCallback(
    (v: string) => {
      if (!onChange) return;

      const isValid = options.some(({ value }) => v === value);
      onChange(v, isValid);
    },
    [options, onChange]
  );

  return (
    <Select
      options={options}
      notFoundLabel={t('form_deleted')}
      chooseValue="__undef__"
      data-input-type="number"
      onChange={onValidatedChange}
      {...props}
    />
  );
};
