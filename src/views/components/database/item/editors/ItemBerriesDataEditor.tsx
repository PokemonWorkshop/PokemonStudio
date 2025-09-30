import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import {
  Input,
  InputContainer,
  InputWithLeftLabelContainer,
  InputWithSeparatorContainer,
  InputWithTopLabelContainer,
  Label,
} from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItemBerryFirmness } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useUpdateItem } from './useUpdateItem';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { InputNumber } from '@components/pokemonBattler/editors/InputNumber';
import { SelectType } from '@components/selects';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import styled from 'styled-components';

const NaturalGiftInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const NaturalGiftInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Firmnesses = ['very_soft', 'soft', 'hard', 'very_hard', 'super_hard'] as const;

export const ItemBerriesDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem } = useItemPage();
  const { t } = useTranslation();
  const item = cloneEntity(currentItem);
  const setItems = useUpdateItem(item);

  const [naturalGiftType, setNaturalGiftType] = useState<string>(item.berryData ? item.berryData.naturalGiftType : 'normal');
  const [minMaxBerriesError, setMinMaxBerriesError] = useState<boolean>(false);
  const [firmness, setFirmness] = useState<string>(item.berryData ? item.berryData.firmness : 'very_soft');
  const firmnessesOptions = useMemo(() => Firmnesses.map((firmness) => ({ value: firmness, label: t(`firmness_${firmness}`) })), [t]);

  const sizeRef = useRef<HTMLInputElement>(null);
  const minYieldRef = useRef<HTMLInputElement>(null);
  const maxYieldRef = useRef<HTMLInputElement>(null);
  const growthRef = useRef<HTMLInputElement>(null);
  const drainRateRef = useRef<HTMLInputElement>(null);
  const naturalGiftPowerRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    const size = sizeRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.size : 5.0);
    const minYield = minYieldRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.minYield : 1);
    const maxYield = maxYieldRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.maxYield : 5);
    const growth = growthRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.growth : 8);
    const drainRate = drainRateRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.drainRate : 6);
    const naturalGiftPower = naturalGiftPowerRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.naturalGiftPower : 80);

    const updatedItem = {
      ...item,
      berryData: {
        ...item.berryData,
        size: cleanNaNValue(size, 0.1),
        firmness: firmness as StudioItemBerryFirmness,
        minYield: cleanNaNValue(minYield, 1),
        maxYield: cleanNaNValue(maxYield, cleanNaNValue(minYield) + 1),
        growth: cleanNaNValue(growth, 1),
        drainRate: cleanNaNValue(drainRate, 1),
        naturalGiftType: naturalGiftType as DbSymbol,
        naturalGiftPower: cleanNaNValue(naturalGiftPower),
      },
    };

    setItems({ ...updatedItem });
  };

  const canClose = () => {
    const sizeOk = !!sizeRef.current && sizeRef.current.validity.valid;
    const minYieldOk = !!minYieldRef.current && minYieldRef.current.validity.valid;
    const maxYieldOk = !!maxYieldRef.current && maxYieldRef.current.validity.valid;
    const growthOk = !!growthRef.current && growthRef.current.validity.valid;
    const drainRateOk = !!drainRateRef.current && drainRateRef.current.validity.valid;
    const naturalGiftPowerOk = !!naturalGiftPowerRef.current && naturalGiftPowerRef.current.validity.valid;

    return sizeOk && minYieldOk && maxYieldOk && !minMaxBerriesError && growthOk && drainRateOk && naturalGiftPowerOk;
  };

  useEditorHandlingClose(ref, handleClose, canClose);

  return LOCKED_ITEM_EDITOR[item.klass].includes('berries') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('berries_title')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="berries_size">{t('berries_size')}</Label>
          <EmbeddedUnitInput
            name="size"
            type="number"
            unit="cm"
            ref={sizeRef}
            defaultValue={item.berryData ? cleanNaNValue(item.berryData.size) : 5.0}
            min="0.1"
            max="999.9"
            step="0.1"
          />
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="firmness">{t('berries_firmness')}</Label>
          <SelectCustomSimple id="select-firmness" options={firmnessesOptions} value={firmness} onChange={(value) => setFirmness(value)} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="minmax-berries">{t('berries_title')}</Label>
            <InputWithSeparatorContainer>
              <InputNumber
                name="min-berries"
                min="1"
                max="99"
                defaultValue={item.berryData ? cleanNaNValue(item.berryData.minYield) : 1}
                ref={minYieldRef}
                onChange={(value) => {
                  const maxYield = maxYieldRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.maxYield : 5);
                  setMinMaxBerriesError(value > maxYield);
                }}
                error={minMaxBerriesError}
              />
              <span className="separator">{t('level_separator')}</span>
              <InputNumber
                name="max-berries"
                min="1"
                max="99"
                defaultValue={item.berryData ? cleanNaNValue(item.berryData.maxYield) : 5}
                ref={maxYieldRef}
                onChange={(value) => {
                  const minYield = minYieldRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.minYield : 1);
                  setMinMaxBerriesError(value < minYield);
                }}
                error={minMaxBerriesError}
              />
            </InputWithSeparatorContainer>
          </InputWithLeftLabelContainer>
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="berries-growth">{t('berries_growth')}</Label>
          <EmbeddedUnitInput
            name="growth"
            type="number"
            unit="h"
            ref={growthRef}
            defaultValue={item.berryData ? cleanNaNValue(item.berryData.growth) : 8}
            min="1"
            max="999"
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="berries-drain-rate">{t('berries_drain_rate')}</Label>
          <EmbeddedUnitInput
            name="drainRate"
            type="number"
            unit="h"
            ref={drainRateRef}
            defaultValue={item.berryData ? cleanNaNValue(item.berryData.drainRate) : 6}
            min="1"
            max="999"
          />
        </InputWithLeftLabelContainer>
        <InputGroupCollapse title={t('natural_gift_data')} gap="16px">
          <NaturalGiftInfoContainer>
            <NaturalGiftInfo>{t('natural_gift_info')}</NaturalGiftInfo>
          </NaturalGiftInfoContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="natural-gift-type">{t('type')}</Label>
            <SelectType
              noLabel
              dbSymbol={naturalGiftType}
              onChange={(value) => {
                setNaturalGiftType(value);
              }}
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="natural-gift-power">{t('power')}</Label>
            <Input
              name="natural-gift-power"
              type="number"
              min="1"
              max="999"
              defaultValue={item.berryData ? cleanNaNValue(item.berryData.naturalGiftPower) : 80}
              ref={naturalGiftPowerRef}
            />
          </InputWithLeftLabelContainer>
        </InputGroupCollapse>
      </InputContainer>
    </Editor>
  );
});
ItemBerriesDataEditor.displayName = 'ItemBerriesDataEditor';
