import { useRefreshUI } from '@components/editor';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';
import { SelectPokemon } from '@components/selects/SelectPokemon';

export const QuestGoalBeatPokemon = ({ objective }: QuestGoalProps) => {
  const { t } = useTranslation();
  const refreshUI = useRefreshUI();
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('creature')}</Label>
        <SelectPokemon
          dbSymbol={objective.objectiveMethodArgs[0] as string}
          onChange={(value) => refreshUI((objective.objectiveMethodArgs[0] = value))}
          undefValueOption={t('none')}
          noLabel
        />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-beat-pokemon">{t('amount')}</Label>
        <InputNumber
          name="amount-beat-pokemon"
          value={objective.objectiveMethodArgs[1] as number}
          setValue={(value: number) => refreshUI((objective.objectiveMethodArgs[1] = value))}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
