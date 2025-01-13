import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';
import React from 'react';

export const QuestGoalBeatNpc = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="text-beat-npc" required>
          {t('trainer_name')}
        </Label>
        <Input
          ref={refs.nameRef}
          type="text"
          name="text-beat-npc"
          defaultValue={objective.objectiveMethodArgs[1] as string}
          onChange={() => checkIsValid && checkIsValid()}
          placeholder={t('example_beat_npc')}
        />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-beat-npc">{t('amount')}</Label>
        <InputNumber2
          ref={refs.valueRef}
          name="amount-beat-npc"
          defaultValue={objective.objectiveMethodArgs[2] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
