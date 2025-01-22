import React from 'react';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestEarningProps } from './QuestEarningProps';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';

export const QuestEarningMoney = ({ earning, refs, checkIsValid }: QuestEarningProps) => {
  const { t } = useTranslation('database_quests');

  return (
    <InputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="amount-money">{t('amount')}</Label>
        <EmbeddedUnitInput
          ref={refs.inputRef}
          unit="P$"
          step="1"
          name="amount-money"
          type="number"
          min="1"
          max="999_999_999"
          defaultValue={earning.earningArgs[0]}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithTopLabelContainer>
    </InputContainer>
  );
};
