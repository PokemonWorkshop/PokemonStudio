import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { StudioCreature } from '@modelEntities/creature';
import React, { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ExperienceEditorProps = {
  currentPokemon: StudioCreature;
  currentFormIndex: number;
};

const xpCurveEntries = (curves: string[]) =>
  curves.map((curveType, index) => ({ value: index.toString(), label: curveType })).sort((a, b) => a.label.localeCompare(b.label));

export const ExperienceEditor: FunctionComponent<ExperienceEditorProps> = ({ currentPokemon, currentFormIndex }: ExperienceEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_types']);
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];

  const xpCurveTypes = [
    t('database_pokemon:fast'),
    t('database_pokemon:normal'),
    t('database_pokemon:slow'),
    t('database_pokemon:parabolic'),
    t('database_pokemon:erratic'),
    t('database_pokemon:fluctuating'),
  ];
  const xpCurveOptions = useMemo(() => xpCurveEntries(xpCurveTypes), []);

  return (
    <Editor type="edit" title={t('database_pokemon:experience')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="curve-type">{t('database_pokemon:curveType')}</Label>
          <SelectCustomSimple
            id="select-curve-type"
            options={xpCurveOptions}
            onChange={(value) => refreshUI((form.experienceType = parseInt(value) as typeof form.experienceType))}
            value={form.experienceType.toString()}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="baseExperience">{t('database_pokemon:base_experience')}</Label>
          <Input
            name="baseExperience"
            type="number"
            value={isNaN(form.baseExperience) ? '' : form.baseExperience}
            onChange={(event) => refreshUI((form.baseExperience = parseInt(event.target.value)))}
            onBlur={() => refreshUI((form.baseExperience = isNaN(form.baseExperience) ? 1 : form.baseExperience))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="baseLoyalty">{t('database_pokemon:base_friendship')}</Label>
          <Input
            name="baseLoyalty"
            type="number"
            value={isNaN(form.baseLoyalty) ? '' : form.baseLoyalty < 0 ? 0 : form.baseLoyalty}
            onChange={(event) => refreshUI((form.baseLoyalty = parseInt(event.target.value) > 255 ? 255 : parseInt(event.target.value)))}
            onBlur={() => refreshUI((form.baseLoyalty = isNaN(form.baseLoyalty) || form.baseLoyalty < 0 ? 0 : form.baseLoyalty))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
