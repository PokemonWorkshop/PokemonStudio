import React from 'react';
import { useRefreshUI } from '@components/editor';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectItem } from '@components/selects';
import { useTranslation } from 'react-i18next';
import { InputNumber } from '../goals/InputNumber';
import { QuestEarningProps } from './QuestEarningProps';

export const QuestEarningItem = ({ earning }: QuestEarningProps) => {
  const { t } = useTranslation(['database_items', 'database_quests']);
  const refreshUI = useRefreshUI();
  return (
    <InputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-item">{t('database_items:item')}</Label>
        <SelectItem
          dbSymbol={earning.earningArgs[0] as string}
          onChange={(selected) => refreshUI((earning.earningArgs[0] = selected))}
          noLabel
          noneValue
        />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-item">{t('database_quests:amount')}</Label>
        <InputNumber
          name="amount-item"
          value={earning.earningArgs[1] as number}
          setValue={(value: number) => refreshUI((earning.earningArgs[1] = value))}
        />
      </InputWithLeftLabelContainer>
    </InputContainer>
  );
};
