import { useRefreshUI } from '@components/editor';
import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import log from 'electron-log';
import { InputNumber } from './InputNumber';

type QuestGoalCustomProps = {
  setIsEmptyText?: React.Dispatch<React.SetStateAction<boolean>>;
} & QuestGoalProps;

export const QuestGoalCustom = ({ objective, setIsEmptyText }: QuestGoalCustomProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom" required>
          {t('event_name')}
        </Label>
        <InputNumber
          name="amount-custom-file"
          value={objective.objectiveMethodArgs[0] as number}
          setValue={(value: number) => refreshUI((objective.objectiveMethodArgs[0] = value))}
        />
        <InputNumber
          name="amount-custom-text"
          value={objective.objectiveMethodArgs[1] as number}
          setValue={(value: number) => refreshUI((objective.objectiveMethodArgs[1] = value))}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
