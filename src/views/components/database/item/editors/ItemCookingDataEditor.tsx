import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItemBerryColor } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useUpdateItem } from './useUpdateItem';
import styled from 'styled-components';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';

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

  const [color, setColor] = useState<string>(item.cookingData ? item.cookingData.pokeblockColor : 'red');
  const [flavorsPartOpen, setFlavorsPartOpen] = useState<boolean>(false);

  const betterPokeblockChanceRef = useRef<HTMLInputElement>(null);
  const smoothnessRef = useRef<HTMLInputElement>(null);
  const spicyRef = useRef<HTMLInputElement>(null);
  const dryRef = useRef<HTMLInputElement>(null);
  const sweetRef = useRef<HTMLInputElement>(null);
  const bitterRef = useRef<HTMLInputElement>(null);
  const sourRef = useRef<HTMLInputElement>(null);

  const colorsOptions = useMemo(() => Colors.map((color) => ({ value: color, label: t(`${color}`) })), [t]);

  const handleClose = () => {
    const betterPokeblockChance = betterPokeblockChanceRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.betterPokeblockChance : 10);
    const smoothness = smoothnessRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.smoothness : 10);
    const spicy = spicyRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.spicyFlavor : 0);
    const dry = dryRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.dryFlavor : 0);
    const sweet = sweetRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.sweetFlavor : 0);
    const bitter = bitterRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.bitterFlavor : 0);
    const sour = sourRef.current?.valueAsNumber ?? (item.cookingData ? item.cookingData.sourFlavor : 0);

    const updatedItem = {
      ...item,
      cookingData: {
        pokeblockColor: color as StudioItemBerryColor,
        betterPokeblockChance: cleanNaNValue(betterPokeblockChance),
        smoothness: cleanNaNValue(smoothness),
        spicyFlavor: cleanNaNValue(spicy),
        dryFlavor: cleanNaNValue(dry),
        sweetFlavor: cleanNaNValue(sweet),
        bitterFlavor: cleanNaNValue(bitter),
        sourFlavor: cleanNaNValue(sour),
      },
    };

    window.api.log.error(updatedItem);

    setItems({ ...updatedItem });
  };

  const canClose = () => {
    const betterPokeblockChanceOk = !!betterPokeblockChanceRef.current && betterPokeblockChanceRef.current.validity.valid;
    const smoothnessOk = !!smoothnessRef.current && smoothnessRef.current.validity.valid;
    const spicyOk = !!spicyRef.current && spicyRef.current.validity.valid;
    const dryOk = !!dryRef.current && dryRef.current.validity.valid;
    const sweetOk = !!sweetRef.current && sweetRef.current.validity.valid;
    const bitterOk = !!bitterRef.current && bitterRef.current.validity.valid;
    const sourOk = !!sourRef.current && sourRef.current.validity.valid;

    return betterPokeblockChanceOk && smoothnessOk && ((spicyOk && dryOk && sweetOk && bitterOk && sourOk) || !flavorsPartOpen);
  };

  const handleFlavorsPartOpen = () => {
    setFlavorsPartOpen(!flavorsPartOpen);
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
            <Input
              name="better-pokeblock-chance"
              type="number"
              min="0"
              max="100"
              defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.betterPokeblockChance) : 10}
              ref={betterPokeblockChanceRef}
            />
          </InputWithLeftLabelContainer>
          <BetterPokeblockInfo>{t('better_pokeblock_info')}</BetterPokeblockInfo>
        </BetterPokeblockInfoContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="smoothness">{t('smoothness')}</Label>
          <Input
            name="smoothness"
            type="number"
            min="0"
            max="100"
            defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.smoothness) : 10}
            ref={smoothnessRef}
          />
        </InputWithLeftLabelContainer>
        <InputGroupCollapse
          title={t('flavors')}
          gap="12px"
          onClick={() => {
            handleFlavorsPartOpen();
          }}
        >
          <InputWithLeftLabelContainer>
            <Label htmlFor="spicy">{t('spicy')}</Label>
            <Input
              name="spicy"
              type="number"
              min="0"
              max="100"
              defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.spicyFlavor) : 0}
              ref={spicyRef}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="dry">{t('dry')}</Label>
            <Input
              name="dry"
              type="number"
              min="0"
              max="100"
              defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.dryFlavor) : 0}
              ref={dryRef}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="sweet">{t('sweet')}</Label>
            <Input
              name="sweet"
              type="number"
              min="0"
              max="100"
              defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.sweetFlavor) : 0}
              ref={sweetRef}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="bitter">{t('bitter')}</Label>
            <Input
              name="bitter"
              type="number"
              min="0"
              max="100"
              defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.bitterFlavor) : 0}
              ref={bitterRef}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="sour">{t('sour')}</Label>
            <Input
              name="sour"
              type="number"
              min="0"
              max="100"
              defaultValue={item.cookingData ? cleanNaNValue(item.cookingData.sourFlavor) : 0}
              ref={sourRef}
            />
          </InputWithLeftLabelContainer>
        </InputGroupCollapse>
      </InputContainer>
    </Editor>
  );
});
ItemCookingDataEditor.displayName = 'ItemCookingDataEditor';
