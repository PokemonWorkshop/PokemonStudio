import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { SelectItem } from '@components/selects';
import { useTranslation } from 'react-i18next';
import { InputNumber } from './InputNumber';
import { QuestUpdateGoalProps } from './QuestGoalProps';
import React from 'react';

export const QuestGoalObtainItem = ({ objective, updateObjective }: QuestUpdateGoalProps) => {
  const { t } = useTranslation(['database_items', 'database_quests']);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-item">{t('database_items:item')}</Label>
        <SelectItem dbSymbol={objective.objectiveMethodArgs[0] as string} onChange={(selected) => updateObjective(0, selected)} noLabel noneValue />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-item">{t('database_quests:amount')}</Label>
        <InputNumber name="amount-item" value={objective.objectiveMethodArgs[1] as number} setValue={(value: number) => updateObjective(1, value)} />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
