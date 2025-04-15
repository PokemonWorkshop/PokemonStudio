import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import { SelectItem2 } from '@components/selects/SelectItem';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalObtainItem = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const [hiddenByDefault, setHiddenByDefault] = useState(objective.hiddenByDefault);
  const { t } = useTranslation(['database_items', 'database_quests']);
  const defaultItem = objective.objectiveMethodArgs[0] === '__undef__' ? undefined : (objective.objectiveMethodArgs[0] as DbSymbol);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-item">{t('database_items:item')}</Label>
        <SelectItem2 name="select-item" optionRef={refs.entityRef} defaultValue={defaultItem} />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-item">{t('database_quests:amount')}</Label>
        <InputNumber2
          name="amount-item"
          ref={refs.valueRef}
          defaultValue={objective.objectiveMethodArgs[1] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="hidden-by-default">{t('hidden_default')}</Label>
        <Toggle
          ref={refs.valueRef}
          name="hidden-by-default"
          checked={hiddenByDefault}
          onChange={(event) => {
            objective.hiddenByDefault = event.target.checked;
            setHiddenByDefault(event.target.checked);
            checkIsValid?.();
          }}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
