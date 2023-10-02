import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectItem } from '@components/selects';
import { useTranslation } from 'react-i18next';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioTrainer, StudioTrainerBagEntry, reduceBagEntries } from '@modelEntities/trainer';
import type { BagEntryAction, BagEntryFrom } from './BagEntryEditorOverlay';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { useTrainerPage } from '@utils/usePage';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cloneEntity } from '@utils/cloneEntity';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const getDefaultBagEntry = (action: BagEntryAction, from: BagEntryFrom, index: number, trainer: StudioTrainer): StudioTrainerBagEntry => {
  const undef: DbSymbol = '__undef__' as DbSymbol;
  if (action === 'creation') return { dbSymbol: undef, amount: 1 };

  switch (from) {
    case 'trainer':
      return trainer.bagEntries[index];
    default:
      assertUnreachable(from);
  }
  return { dbSymbol: undef, amount: 1 };
};

type BagEntryEditorProps = {
  action: BagEntryAction;
  index: number;
  from: BagEntryFrom;
  closeDialog: () => void;
};

export const BagEntryEditor = forwardRef<EditorHandlingClose, BagEntryEditorProps>(({ action, index, from, closeDialog }, ref) => {
  const { t } = useTranslation('bag_entry_list');
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const [bagEntry, setBagEntry] = useState<StudioTrainerBagEntry>(getDefaultBagEntry(action, from, index, trainer));

  const canNew = () => {
    if (bagEntry.dbSymbol === '__undef__') return false;

    const amount = bagEntry.amount;
    if (isNaN(amount) || amount < 1 || amount > 999) return false;

    return true;
  };

  const canClose = () => {
    if (action === 'creation') return true;

    const amount = bagEntry.amount;
    if (isNaN(amount)) return true;
    if (amount < 1 || amount > 999) return false;

    return true;
  };

  const handleNew = () => {
    if (!canNew()) return;

    switch (from) {
      case 'trainer': {
        const newBagEntries = cloneEntity(trainer.bagEntries);
        newBagEntries.push(cloneEntity(bagEntry));
        updateTrainer({ bagEntries: reduceBagEntries(newBagEntries) });
        break;
      }
      default:
        assertUnreachable(from);
    }

    closeDialog();
  };

  const onClose = () => {
    if (action === 'creation' || !canClose()) return;

    switch (from) {
      case 'trainer': {
        const newBagEdited = cloneEntity(trainer.bagEntries);
        newBagEdited[index] = { ...bagEntry, amount: cleanNaNValue(bagEntry.amount, trainer.bagEntries[index].amount) };
        return updateTrainer({ bagEntries: reduceBagEntries(newBagEdited) });
      }
      default:
        assertUnreachable(from);
    }
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type={action} title={t('item')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-item" required={action === 'creation' ? true : undefined}>
            {t('item')}
          </Label>
          <SelectItem
            dbSymbol={bagEntry.dbSymbol}
            onChange={(selected) => setBagEntry((bagEntry) => ({ ...bagEntry, dbSymbol: selected as DbSymbol }))}
            noLabel
            noneValue={action === 'creation' ? true : undefined}
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="amount-item">{t('amount')}</Label>
          <Input
            type="number"
            name="amount-item"
            min="1"
            max="999"
            value={isNaN(bagEntry.amount) ? '' : bagEntry.amount}
            onChange={(event) => setBagEntry((bagEntry) => ({ ...bagEntry, amount: event.target.valueAsNumber }))}
          />
        </InputWithLeftLabelContainer>
        {action === 'creation' && (
          <ButtonContainer>
            <ToolTipContainer>
              {!canNew() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
              <PrimaryButton onClick={handleNew} disabled={!canNew()}>
                {t('add_the_item')}
              </PrimaryButton>
            </ToolTipContainer>
            <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
          </ButtonContainer>
        )}
      </InputContainer>
    </Editor>
  );
});
BagEntryEditor.displayName = 'BagEntryEditor';
