import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectPokemon } from '@components/selects';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import { TFunction } from 'i18next';
import React, { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type BreedingEditorProps = {
  currentPokemon: PokemonModel;
  currentFormIndex: number;
};

const breedingGroupEntries = [
  'undefined',
  'monster',
  'water_1',
  'bug',
  'flying',
  'field',
  'fairy',
  'grass',
  'human_like',
  'water_3',
  'mineral',
  'amorphous',
  'water_2',
  'ditto',
  'dragon',
  'unknown',
];

const getBreedingGroupOptions = (t: TFunction, breedingGroups: string[]): SelectOption[] =>
  breedingGroups
    .map((breedingGroup, index) => ({ value: index.toString(), label: t(`database_pokemon:${breedingGroup}`) }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const BreedingEditor: FunctionComponent<BreedingEditorProps> = ({ currentPokemon, currentFormIndex }: BreedingEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_types']);
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];
  const breedingGroupOptions = useMemo(() => getBreedingGroupOptions(t, breedingGroupEntries), [t]);

  return (
    <Editor type="edit" title={t('database_pokemon:breeding')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="baby">{t('database_pokemon:baby')}</Label>
          <SelectPokemon dbSymbol={form.babyDbSymbol} onChange={(event) => refreshUI((form.babyDbSymbol = event.value))} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="breed_group_1">{t('database_pokemon:egg_group_1')}</Label>
          <SelectCustomSimple
            id="select-breed-group-1"
            options={breedingGroupOptions}
            onChange={(value) => refreshUI((form.breedGroups[0] = parseInt(value)))}
            value={form.breedGroups[0].toString()}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="breed_group_2">{t('database_pokemon:egg_group_2')}</Label>
          <SelectCustomSimple
            id="select-breed-group-2"
            options={breedingGroupOptions}
            onChange={(value) => refreshUI((form.breedGroups[1] = parseInt(value)))}
            value={form.breedGroups[1].toString()}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="hatch_steps">{t('database_pokemon:hatch_steps')}</Label>
          <Input
            name="hatch_steps"
            type="number"
            value={isNaN(form.hatchSteps) ? '' : form.hatchSteps}
            onChange={(event) => refreshUI((form.hatchSteps = parseInt(event.target.value)))}
            onBlur={() => refreshUI((form.hatchSteps = isNaN(form.hatchSteps) ? 0 : form.hatchSteps))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
