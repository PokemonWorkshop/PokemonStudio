import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { InputContainer, InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { useUpdateItem } from './useUpdateItem';
import { DbSymbol } from '@root/src/models/entities/dbSymbol';

export const ItemParametersDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem: item } = useItemPage();
  const { t } = useTranslation();

  const setItems = useUpdateItem(item);

  const [params, setParams] = useState({
    isBattleUsable: item.isBattleUsable,
    isMapUsable: item.isMapUsable,
    isLimited: item.isLimited,
    isHoldable: item.isHoldable,
    isAllowingMega: item.isAllowingMega,
    isBerry: item.isBerry,
    berryData: item.berryData,
    cookingData: item.cookingData,
  });

  const handleClose = () => {
    if (!params.isBerry) {
      params.berryData = undefined;
      params.cookingData = undefined;
    }
    if (!item.isBerry && params.isBerry) {
      params.berryData = {
        size: 5.0,
        firmness: 'hard',
        minYield: 1,
        maxYield: 5,
        growth: 8,
        drainRate: 6,
        naturalGiftType: 'normal' as DbSymbol,
        naturalGiftPower: 80,
      };
      params.cookingData = {
        pokeblockColor: 'red',
        betterPokeblockChance: 10,
        smoothness: 10,
        spicyFlavor: 0,
        dryFlavor: 0,
        sweetFlavor: 0,
        bitterFlavor: 0,
        sourFlavor: 0,
      };
    }
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
        <InputWithLeftLabelContainer>
          <Label htmlFor="allow_mega_evolution">{t('allow_mega_evolution')}</Label>
          <Toggle
            name="allow_mega_evolution"
            checked={params.isAllowingMega}
            onChange={(event) => setParams((prevFormData) => ({ ...prevFormData, isAllowingMega: event.target.checked }))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="is_berry">{t('is_berry')}</Label>
          <Toggle
            name="is_berry"
            checked={params.isBerry}
            onChange={(event) => setParams((prevFormData) => ({ ...prevFormData, isBerry: event.target.checked }))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ItemParametersDataEditor.displayName = 'ItemParametersDataEditor';
