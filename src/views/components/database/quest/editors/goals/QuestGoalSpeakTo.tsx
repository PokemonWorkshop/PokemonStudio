import { useRefreshUI } from '@components/editor';
import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';

type QuestGoalSpeakToProps = {
  setIsEmptyText?: React.Dispatch<React.SetStateAction<boolean>>;
} & QuestGoalProps;

export const QuestGoalSpeakTo = ({ objective, setIsEmptyText }: QuestGoalSpeakToProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="speak-to" required>
          {t('event_name')}
        </Label>
        <Input
          type="text"
          name="speak-to"
          value={objective.objectiveMethodArgs[1] as string}
          onChange={(event) => {
            refreshUI((objective.objectiveMethodArgs[1] = event.target.value));
            if (setIsEmptyText) setIsEmptyText(objective.objectiveMethodArgs[1] === '');
          }}
          placeholder={t('example_speak_to')}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
