import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalBeatNpc = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation();

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
      <InputWithLeftLabelContainer>
        <Label htmlFor="hidden-by-default">{t('hidden_default')}</Label>
        <Toggle
          ref={refs.hiddenByDefaultRef}
          name="hidden-by-default"
          defaultChecked={objective.hiddenByDefault}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
