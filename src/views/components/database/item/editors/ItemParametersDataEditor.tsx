import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { InputContainer, InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { useUpdateItem } from './useUpdateItem';

export const ItemParametersDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation('database_items');

  const setItems = useUpdateItem(item);

  const [params, setParams] = useState({
    isBattleUsable: item.isBattleUsable,
    isMapUsable: item.isMapUsable,
    isLimited: item.isLimited,
    isHoldable: item.isHoldable,
  });

  const handleClose = () => {
    setItems(params);
  };

  useEditorHandlingClose(ref, handleClose);

  return LOCKED_ITEM_EDITOR[item.klass].includes('parameters') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('params')}>
      <InputContainer size="s">
        <InputWithLeftLabelContainer>
          <Label htmlFor="battle_usable">{t('battle_usable')}</Label>
          <Toggle
            name="battle_usable"
            checked={params.isBattleUsable}
            onChange={(event) => setParams((prevFormData) => ({ ...prevFormData, isBattleUsable: event.target.checked }))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="map_usable">{t('map_usable')}</Label>
          <Toggle
            name="map_usable"
            checked={params.isMapUsable}
            onChange={(event) => setParams((prevFormData) => ({ ...prevFormData, isMapUsable: event.target.checked }))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="limited_use">{t('limited_use')}</Label>
          <Toggle
            name="limited_use"
            checked={params.isLimited}
            onChange={(event) => setParams((prevFormData) => ({ ...prevFormData, isLimited: event.target.checked }))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="can_be_held">{t('can_be_held')}</Label>
          <Toggle
            name="can_be_held"
            checked={params.isHoldable}
            onChange={(event) => setParams((prevFormData) => ({ ...prevFormData, isHoldable: event.target.checked }))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ItemParametersDataEditor.displayName = 'ItemParametersDataEditor';
