import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { InputNumber } from './InputNumber';
import { QuestUpdateGoalProps } from './QuestGoalProps';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import React from 'react';

export const QuestGoalBeatPokemon = ({ objective, updateObjective }: QuestUpdateGoalProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_quests', 'select']);
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('database_pokemon:pokemon')}</Label>
        <SelectPokemon
          dbSymbol={objective.objectiveMethodArgs[0] as string}
          onChange={(value) => updateObjective(0, value)}
          undefValueOption={t('select:none')}
          noLabel
        />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-beat-pokemon">{t('database_quests:amount')}</Label>
        <InputNumber name="amount-beat-pokemon" value={objective.objectiveMethodArgs[1] as number} setValue={(value) => updateObjective(1, value)} />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
