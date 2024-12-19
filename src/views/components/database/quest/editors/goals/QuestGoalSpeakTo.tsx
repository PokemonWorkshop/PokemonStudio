import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { cloneEntity } from '@utils/cloneEntity';

type QuestGoalSpeakToProps = {
  setIsEmptyText?: (isEmptyText: boolean) => void;
} & QuestGoalProps;

export const QuestGoalSpeakTo = ({ objective, setObjective, setIsEmptyText }: QuestGoalSpeakToProps) => {
  const { t } = useTranslation('database_quests');
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
            const newObjective = cloneEntity(objective);
            newObjective.objectiveMethodArgs[1] = event.target.value;
            setObjective(newObjective);
            if (setIsEmptyText) setIsEmptyText(newObjective.objectiveMethodArgs[1] === '');
          }}
          placeholder={t('example_speak_to')}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
