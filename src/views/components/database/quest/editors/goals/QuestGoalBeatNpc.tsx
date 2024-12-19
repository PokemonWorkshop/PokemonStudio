import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';
import { cloneEntity } from '@utils/cloneEntity';

type QuestGoalBeatNpcProps = {
  setIsEmptyText?: React.Dispatch<React.SetStateAction<boolean>>;
} & QuestGoalProps;

export const QuestGoalBeatNpc = ({ objective, setObjective, setIsEmptyText }: QuestGoalBeatNpcProps) => {
  const { t } = useTranslation('database_quests');
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="text-beat-npc" required>
          {t('trainer_name')}
        </Label>
        <Input
          type="text"
          name="text-beat-npc"
          value={objective.objectiveMethodArgs[1] as string}
          onChange={(event) => {
            const newObjective = cloneEntity(objective);
            newObjective.objectiveMethodArgs[1] = event.target.value;
            setObjective(newObjective);
            if (setIsEmptyText) setIsEmptyText(newObjective.objectiveMethodArgs[1] === '');
          }}
          placeholder={t('example_beat_npc')}
        />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-beat-npc">{t('amount')}</Label>
        <InputNumber
          name="amount-beat-npc"
          value={objective.objectiveMethodArgs[2] as number}
          setValue={(value: number) => {
            const newObjective = cloneEntity(objective);
            newObjective.objectiveMethodArgs[2] = value;
            setObjective(newObjective);
          }}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
