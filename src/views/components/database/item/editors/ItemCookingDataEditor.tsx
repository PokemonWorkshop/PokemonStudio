import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItemBerryColor } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useUpdateItem } from './useUpdateItem';
import { InputNumber } from '@components/pokemonBattler/editors/InputNumber';
import styled from 'styled-components';

const BetterPokeblockInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const BetterPokeblockInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Colors = ['red', 'blue', 'pink', 'green', 'yellow'] as const;

export const ItemCookingDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem } = useItemPage();
  const { t } = useTranslation();
  const item = cloneEntity(currentItem);
  const setItems = useUpdateItem(item);

  const [color, setColor] = useState<string>(item.cookingData ? item.cookingData.color : 'red');

  const betterPokeblockChanceRef = useRef<HTMLInputElement>(null);
  const smoothnessRef = useRef<HTMLInputElement>(null);
  const spicyFlavorRef = useRef<HTMLInputElement>(null);
  const dryFlavorRef = useRef<HTMLInputElement>(null);
  const sweetFlavorRef = useRef<HTMLInputElement>(null);
  const bitterFlavorRef = useRef<HTMLInputElement>(null);
  const sourFlavorRef = useRef<HTMLInputElement>(null);

  const colorsOptions = useMemo(() => Colors.map((color) => ({ value: color, label: t(`${color}`) })), [t]);

  const handleClose = () => {
    const betterPokeblockChance = betterPokeblockChanceRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.betterPokeblockChance : 10);
    const smoothness = smoothnessRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.smoothness : 10);
    const spicy = spicyFlavorRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.flavors[0] : 0);
    const dry = dryFlavorRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.flavors[1] : 0);
    const sweet = sweetFlavorRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.flavors[2] : 0);
    const bitter = bitterFlavorRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.flavors[3] : 0);
    const sour = sourFlavorRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.flavors[4] : 0);

    const flavors = [cleanNaNValue(spicy), cleanNaNValue(dry), cleanNaNValue(sweet), cleanNaNValue(bitter), cleanNaNValue(sour)];

    const updatedItem = {
      ...item,
      cookingData: {
        color: color as StudioItemBerryColor,
        betterPokeblockChance: cleanNaNValue(betterPokeblockChance),
        smoothness: cleanNaNValue(smoothness),
        flavors: flavors,
      },
    };

    window.api.log.error(updatedItem);

    setItems({ ...updatedItem });
  };

  const canClose = () => {
    const betterPokeblockChanceOk = !!betterPokeblockChanceRef.current && betterPokeblockChanceRef.current.validity.valid;
    const smoothnessOk = !!smoothnessRef.current && smoothnessRef.current.validity.valid;
    const spicyOk = !!spicyFlavorRef.current && spicyFlavorRef.current.validity.valid;
    const dryOk = !!dryFlavorRef.current && dryFlavorRef.current.validity.valid;
    const sweetOk = !!sweetFlavorRef.current && sweetFlavorRef.current.validity.valid;
    const bitterOk = !!bitterFlavorRef.current && bitterFlavorRef.current.validity.valid;
    const sourOk = !!sourFlavorRef.current && sourFlavorRef.current.validity.valid;

    return betterPokeblockChanceOk && smoothnessOk; // && spicyOk && dryOk && sweetOk && bitterOk && sourOk;
  };

  useEditorHandlingClose(ref, handleClose, canClose);

  return LOCKED_ITEM_EDITOR[item.klass].includes('cooking') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('cooking_title')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="color">{t('pokeblock_color')}</Label>
          <SelectCustomSimple id="select-color" options={colorsOptions} value={color} onChange={(value) => setColor(value)} />
        </InputWithTopLabelContainer>
        <BetterPokeblockInfoContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="better-pokeblock-chance">{t('berries_better_pokeblock')}</Label>
            <InputNumber
              name="better-pokeblock-chance"
              min="0"
              max="100"
              defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.betterPokeblockChance) : 10}
              ref={betterPokeblockChanceRef}
              onChange={() => {}}
            />
          </InputWithLeftLabelContainer>
          <BetterPokeblockInfo>{t('better_pokeblock_info')}</BetterPokeblockInfo>
        </BetterPokeblockInfoContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="smoothness">{t('smoothness')}</Label>
          <InputNumber
            name="smoothness"
            min="0"
            max="100"
            defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.smoothness) : 10}
            ref={smoothnessRef}
            onChange={() => {}}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ItemCookingDataEditor.displayName = 'ItemCookingDataEditor';
