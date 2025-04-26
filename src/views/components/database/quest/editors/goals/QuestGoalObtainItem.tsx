import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { SelectItem2 } from '@components/selects/SelectItem';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';

export const QuestGoalObtainItem = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation();
  const defaultItem = objective.objectiveMethodArgs[0] === '__undef__' ? undefined : (objective.objectiveMethodArgs[0] as DbSymbol);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-item">{t('item')}</Label>
        <SelectItem2 name="select-item" optionRef={refs.entityRef} defaultValue={defaultItem} />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-item">{t('amount')}</Label>
        <InputNumber2
          name="amount-item"
          ref={refs.valueRef}
          defaultValue={objective.objectiveMethodArgs[1] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
