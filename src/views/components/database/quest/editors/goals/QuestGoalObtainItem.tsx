import { useRefreshUI } from '@components/editor';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { SelectItem } from '@components/selects';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalObtainItem = ({ objective }: QuestGoalProps) => {
  const { t } = useTranslation(['database_items', 'database_quests']);
  const refreshUI = useRefreshUI();
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-item">{t('database_items:item')}</Label>
        <SelectItem
          dbSymbol={objective.objectiveMethodArgs[0] as string}
          onChange={(selected) => refreshUI((objective.objectiveMethodArgs[0] = selected))}
          noLabel
          noneValue
        />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-item">{t('database_quests:amount')}</Label>
        <InputNumber
          name="amount-item"
          value={objective.objectiveMethodArgs[1] as number}
          setValue={(value: number) => refreshUI((objective.objectiveMethodArgs[1] = value))}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
