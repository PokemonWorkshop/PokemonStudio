import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useCreaturePage } from '@utils/usePage';
import { TFunction } from 'i18next';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';

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

const getBreedingGroupOptions = (t: TFunction, breedingGroups: string[]) =>
  breedingGroups
    .map((breedingGroup, index) => ({ value: index.toString(), label: t(`${breedingGroup}`) }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const BreedingEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const breedingGroupOptions = useMemo(() => getBreedingGroupOptions(t, breedingGroupEntries), [t]);
  const [breedGroup1, setBreedGroup1] = useState(form.breedGroups[0] || 0);
  const [breedGroup2, setBreedGroup2] = useState(form.breedGroups[1] || 0);
  const [baby, setBaby] = useState(form.babyDbSymbol);
  const [babyForm, setBabyForm] = useState(form.babyForm);
  const hatchStepsRef = useRef<HTMLInputElement>(null);

  const canClose = () => {
    if (!hatchStepsRef.current || !hatchStepsRef.current.validity.valid) return false;

    return true;
  };

  const onClose = () => {
    if (!hatchStepsRef.current || !canClose()) return;

    const hatchSteps = isNaN(hatchStepsRef.current.valueAsNumber) ? form.hatchSteps : hatchStepsRef.current.valueAsNumber;

    updateForm({ breedGroups: [breedGroup1, breedGroup2], babyDbSymbol: baby, babyForm, hatchSteps });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('breeding')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="baby">{t('baby')}</Label>
          <SelectPokemon dbSymbol={baby} onChange={(value) => setBaby(value as DbSymbol)} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="form">{t('form')}</Label>
          <SelectPokemonForm dbSymbol={baby} form={babyForm} onChange={(value) => setBabyForm(Number(value))} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="breed_group_1">{t('egg_group_1')}</Label>
          <SelectCustomSimple
            id="select-breed-group-1"
            options={breedingGroupOptions}
            onChange={(value) => setBreedGroup1(parseInt(value))}
            value={breedGroup1.toString()}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="breed_group_2">{t('egg_group_2')}</Label>
          <SelectCustomSimple
            id="select-breed-group-2"
            options={breedingGroupOptions}
            onChange={(value) => setBreedGroup2(parseInt(value))}
            value={breedGroup2.toString()}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="hatch_steps">{t('hatch_steps')}</Label>
          <Input name="hatch_steps" type="number" defaultValue={form.hatchSteps} min={0} max={99999} ref={hatchStepsRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
BreedingEditor.displayName = 'BreedingEditor';
