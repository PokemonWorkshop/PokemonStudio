import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { SelectDataGeneric } from './SelectDataGeneric';
import { SelectDataProps } from './SelectDataProps';
import { StudioCreatureForm } from '@modelEntities/creature';

type SelectPokemonFormProps = {
  form: number;
} & SelectDataProps;

const getFormOptions = (t: TFunction<'database_pokemon'>, forms: StudioCreatureForm[]) =>
  Object.entries(forms).map(([, formData]) => ({ value: formData.form.toString(), label: t('form#') + formData.form }));

/**
 * Component to show a select Pokémon form.
 * @param dbSymbol The dbSymbol of the Pokémon
 * @param form The current form of the Pokémon. Can be obtained by example: pokemon.forms[0].form
 * @param onChange Set this function to get the value selected in the select
 * @param noLabel If true, the label is not shown
 * @param rejected List of dbSymbol who no must be show in the select
 * @param breakpoint Set the breakpoint for hide the label if necessary
 * @param noneValue Add on the top of the select 'None' value
 * @param noneValueIsError The noneValue is considered as error
 * @param overwriteNoneValue Overwrite the label of the 'None'
 */
export const SelectPokemonForm = ({
  dbSymbol,
  form,
  onChange,
  noLabel,
  rejected,
  breakpoint,
  noneValue,
  noneValueIsError,
  overwriteNoneValue,
}: SelectPokemonFormProps) => {
  const { t } = useTranslation('database_pokemon');
  const [state] = useGlobalState();
  const currentPokemon = state.projectData.pokemon[dbSymbol];
  const currentForm = currentPokemon?.forms.find((_form) => _form.form === form);
  const options = currentPokemon ? getFormOptions(t, currentPokemon.forms) : [];

  const getData = () => {
    if (!currentPokemon) return { value: dbSymbol, label: t('pokemon_deleted') };
    if (!currentForm) {
      if (form === -1) return { value: form.toString(), label: overwriteNoneValue || t('none') };
      else return { value: form.toString(), label: t('form_deleted') };
    }
    return { value: form.toString(), label: t('form#') + form };
  };

  return (
    <SelectDataGeneric
      data={getData()}
      options={options}
      label={noLabel ? undefined : t('form')}
      noOptionsText={t('no_option_form')}
      error={(!currentPokemon || (!currentForm && form !== -1)) && (noneValueIsError ? true : dbSymbol !== '__undef__' || form !== -1)}
      onChange={onChange}
      rejected={rejected}
      breakpoint={breakpoint}
      noneValue={noneValue}
      overwriteNoneValue={overwriteNoneValue}
    />
  );
};
