import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectItem } from '@components/selects';
import { useTranslation } from 'react-i18next';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useProjectTrainers } from '@utils/useProjectData';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { reduceBagEntries, StudioTrainer } from '@modelEntities/trainer';

type BagEntryListEditorProps = {
  type: 'creation' | 'edit';
  trainer: StudioTrainer;
  index?: number;
  onClose?: () => void;
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

export const BagEntryListEditor = ({ type, trainer, index, onClose }: BagEntryListEditorProps) => {
  if (type === 'edit' && index === undefined) console.warn('index should be define when edit mode is used.');
  if (type === 'creation' && onClose === undefined) console.warn('onClose() should be define when creation mode is used.');

  const { setProjectDataValues: setTrainer } = useProjectTrainers();
  const { t } = useTranslation('bag_entry_list');
  const newBagEntry = useMemo(() => ({ dbSymbol: '__undef__' as DbSymbol, amount: 1 }), []);
  const bagEntry = type === 'edit' && index !== undefined ? trainer.bagEntries[index] : newBagEntry;
  const refreshUI = useRefreshUI();

  const checkDisabled = () => bagEntry.dbSymbol === '__undef__';
  const onClickNew = () => {
    trainer.bagEntries.push(bagEntry);
    reduceBagEntries(trainer);
    setTrainer({ [trainer.dbSymbol]: trainer });
    if (onClose) onClose();
  };

  return (
    <Editor type={type} title={t('item')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-item" required>
            {t('item')}
          </Label>
          <SelectItem
            dbSymbol={bagEntry.dbSymbol}
            onChange={(selected) => refreshUI((bagEntry.dbSymbol = selected.value as DbSymbol))}
            noLabel
            noneValue
            noneValueIsError
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="amount-item">{t('amount')}</Label>
          <Input
            type="number"
            name="amount-item"
            value={isNaN(bagEntry.amount) ? '' : bagEntry.amount}
            min="1"
            max="999"
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 1 || newValue > 999) return event.preventDefault();
              refreshUI((bagEntry.amount = newValue));
            }}
            onBlur={() => refreshUI((bagEntry.amount = cleanNaNValue(bagEntry.amount, 1)))}
          />
        </InputWithLeftLabelContainer>
        {type === 'creation' && (
          <ButtonContainer>
            <ToolTipContainer>
              {checkDisabled() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
              <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
                {t('add_the_item')}
              </PrimaryButton>
            </ToolTipContainer>
            <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
          </ButtonContainer>
        )}
      </InputContainer>
    </Editor>
  );
};
