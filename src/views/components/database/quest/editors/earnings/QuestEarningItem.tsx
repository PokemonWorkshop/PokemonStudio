import React from 'react';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from '../goals/InputNumber';
import { QuestEarningProps } from './QuestEarningProps';
import { SelectItem2 } from '@components/selects/SelectItem';
import { DbSymbol } from '@modelEntities/dbSymbol';

export const QuestEarningItem = ({ earning, refs, checkIsValid }: QuestEarningProps) => {
  const { t } = useTranslation(['database_items', 'database_quests']);
  const defaultItem = earning.earningArgs[0] === '__undef__' ? undefined : (earning.earningArgs[0] as DbSymbol);

  return (
    <InputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-item">{t('database_items:item')}</Label>
        <SelectItem2 name="select-item" optionRef={refs.entityRef} defaultValue={defaultItem} />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-item">{t('database_quests:amount')}</Label>
        <InputNumber2
          name="amount-item"
          ref={refs.inputRef}
          defaultValue={earning.earningArgs[1] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </InputContainer>
  );
};
