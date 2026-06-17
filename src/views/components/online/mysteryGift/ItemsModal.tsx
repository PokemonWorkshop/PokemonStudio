import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { DarkButton, DeleteButtonOnlyIcon, PrimaryButton } from '@components/buttons';
import { SelectItem } from '@components/selects/SelectItem';
import type { GiftItem } from '@utils/onlineApi';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
  background-color: rgba(10, 9, 11, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background-color: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 12px;
  padding: 24px;
  width: 480px;
  height: 80vh;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
`;

const ModalTitle = styled.h3`
  ${({ theme }) => theme.fonts.titlesHeadline6};
  color: ${({ theme }) => theme.colors.text100};
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 8px;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 96px 32px;
  gap: 8px;
  align-items: center;
`;

const ButtonBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};
`;

type Props = {
  initialItems: GiftItem[];
  onSave: (items: GiftItem[]) => void;
  onCancel: () => void;
};

export const ItemsModal = ({ initialItems, onSave, onCancel }: Props) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<GiftItem[]>(initialItems.length > 0 ? initialItems : [{ id: '', count: 1 }]);

  const addItem = () => setItems((prev) => [...prev, { id: '', count: 1 }]);
  const updateItem = (idx: number, patch: Partial<GiftItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const cleaned = items.filter((it) => it.id.trim().length > 0).map((it) => ({ id: it.id.trim(), count: it.count }));
    onSave(cleaned);
  };

  return createPortal(
    <Overlay onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <ModalBox>
        <ModalTitle>{t('online_gift_items')}</ModalTitle>
        <ScrollArea>
          {items.map((it, idx) => (
            <ItemRow key={idx}>
              <InputWithTopLabelContainer>
                {idx === 0 && <Label>{t('online_gift_item_id_label')}</Label>}
                <SelectItem
                  noLabel
                  dbSymbol={it.id || '__undef__'}
                  onChange={(val) => updateItem(idx, { id: val === '__undef__' ? '' : val })}
                  undefValueOption={t('none_option')}
                />
              </InputWithTopLabelContainer>
              <InputWithTopLabelContainer>
                {idx === 0 && <Label>{t('online_gift_item_count_label')}</Label>}
                <Input
                  type="number"
                  min="1"
                  value={it.count}
                  onChange={(e) => updateItem(idx, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </InputWithTopLabelContainer>
              <DeleteButtonOnlyIcon size="s" onClick={() => removeItem(idx)} />
            </ItemRow>
          ))}
          <DarkButton onClick={addItem}>{t('online_gift_add_item')}</DarkButton>
        </ScrollArea>
        <ButtonBar>
          <DarkButton onClick={onCancel}>{t('cancel')}</DarkButton>
          <PrimaryButton onClick={handleSave}>{t('online_gift_modal_save')}</PrimaryButton>
        </ButtonBar>
      </ModalBox>
    </Overlay>,
    document.querySelector('#dialogs') || document.body,
  );
};
