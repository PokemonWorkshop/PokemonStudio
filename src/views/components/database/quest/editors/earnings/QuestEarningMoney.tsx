import React from 'react';
import { useRefreshUI } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestEarningProps } from './QuestEarningProps';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { cleanNaNValue } from '@utils/cleanNaNValue';

export const QuestEarningMoney = ({ earning }: QuestEarningProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  return (
    <InputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="amount-money">{t('amount')}</Label>
        <EmbeddedUnitInput
          unit="P$"
          step="1"
          name="amount-money"
          type="number"
          min="1"
          max="999_999_999"
          value={isNaN(earning.earningArgs[0] as number) ? '' : earning.earningArgs[0]}
          onChange={(event) => {
            const newValue = event.target.value == '' ? Number.NaN : parseInt(event.target.value);
            if (newValue < 1 || newValue > 999_999_999) return event.preventDefault();
            refreshUI((earning.earningArgs[0] = newValue));
          }}
          onBlur={() => refreshUI((earning.earningArgs[0] = cleanNaNValue(earning.earningArgs[0] as number, 100)))}
        />
      </InputWithTopLabelContainer>
    </InputContainer>
  );
};
