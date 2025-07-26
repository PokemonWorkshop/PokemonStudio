import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItemBerryFirmness, StudioItem } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useUpdateItem } from './useUpdateItem';
import { DbSymbol } from '@modelEntities/dbSymbol';

const Firmnesses = ['very_soft', 'soft', 'hard', 'very_hard', 'super_hard'] as const;

export const ItemBerriesDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem } = useItemPage();
  const { t } = useTranslation();
  const item = cloneEntity(currentItem);
  const setItems = useUpdateItem(item);

  const [firmness, setFirmness] = useState<string>(item.berryData ? item.berryData.firmness : 'very_soft');
  const sizeRef = useRef<HTMLInputElement>(null);
  const minYieldRef = useRef<HTMLInputElement>(null);
  const maxYieldRef = useRef<HTMLInputElement>(null);
  const growthRef = useRef<HTMLInputElement>(null);
  const drainRateRef = useRef<HTMLInputElement>(null);
  const naturalGiftTypeRef = useRef<HTMLInputElement>(null);
  const naturalGiftPowerRef = useRef<HTMLInputElement>(null);

  const firmnessesOptions = useMemo(() => Firmnesses.map((firmness) => ({ value: firmness, label: t(`firmness_${firmness}`) })), [t]);

  const handleClose = () => {
    const size = sizeRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.size : 5.0);
    const minYield = minYieldRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.minYield : 1);
    const maxYield = maxYieldRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.maxYield : 5);
    const growth = growthRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.growth : 8);
    const drainRate = drainRateRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.drainRate : 6);
    const naturalGiftType = naturalGiftTypeRef.current?.value ?? (item.berryData ? item.berryData.naturalGiftType : 'normal');
    const naturalGiftPower = naturalGiftPowerRef.current?.valueAsNumber ?? (item.berryData ? item.berryData.naturalGiftPower : 80);

    const updatedItem = {
      ...item,
      berryData: {
        size: cleanNaNValue(size),
        firmness: firmness as StudioItemBerryFirmness,
        minYield: cleanNaNValue(minYield),
        maxYield: cleanNaNValue(maxYield),
        growth: cleanNaNValue(growth),
        drainRate: cleanNaNValue(drainRate),
        naturalGiftType: naturalGiftType as DbSymbol,
        naturalGiftPower: cleanNaNValue(naturalGiftPower),
      },
    };

    window.api.log.error(updatedItem);

    setItems({ ...updatedItem });
  };

  const canClose = () => {
    const sizeOk = !!sizeRef.current && sizeRef.current.validity.valid;
    const minYieldOk = !!minYieldRef.current && minYieldRef.current.validity.valid;
    const maxYieldOk = !!maxYieldRef.current && maxYieldRef.current.validity.valid;
    const growthOk = !!growthRef.current && growthRef.current.validity.valid;
    const drainRateOk = !!drainRateRef.current && drainRateRef.current.validity.valid;
    const naturalGiftPowerOk = !!naturalGiftPowerRef.current && naturalGiftPowerRef.current.validity.valid;

    return sizeOk; //&& minYieldOk && maxYieldOk && growthOk && drainRateOk && naturalGiftPowerOk;
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
      </InputContainer>
    </Editor>
  );
});
ItemBerriesDataEditor.displayName = 'ItemBerriesDataEditor';
