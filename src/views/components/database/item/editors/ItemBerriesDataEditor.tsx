import React, { DragEventHandler, forwardRef, useMemo, useRef, useState } from 'react';
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
import { ClearButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { CharacterSprite } from '@src/custom/MapEditor/events/CharacterSprite';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useCopyFile } from '@hooks/useCopyFile';
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

/**
 * Resource-style charset control: a first-frame sprite preview on the left, the
 * Edit / Clear affordances on the right. Mirrors IconInput's layout so it reads
 * as a native Studio graphic-resource field, and accepts a dropped charset.
 */
const GraphicResourceContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  user-select: none;

  & div.preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.dark18};
    border: 1px solid ${({ theme }) => theme.colors.dark20};
    overflow: hidden;
  }

  & div.preview .empty {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.text400};
    text-align: center;
    padding: 0 4px;
  }

  & div.buttons {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }
`;

const CHARSET_EXTENSIONS = ['png', 'gif'];
/** RMXP-style charset name: basename, forward slashes, extension stripped. */
const toCharacterName = (filePath: string): string => filePath.replace(/\\/g, '/').replace(/^.*\//, '').replace(/\.(png|gif)$/i, '');

const Firmnesses = ['very_soft', 'soft', 'hard', 'very_hard', 'super_hard'] as const;

export const ItemBerriesDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem } = useItemPage();
  const [{ projectPath }] = useGlobalState();
  const { t } = useTranslation();
  const item = cloneEntity(currentItem);
  const setItems = useUpdateItem(item);

  const [naturalGiftType, setNaturalGiftType] = useState<string>(item.berryData ? item.berryData.naturalGiftType : 'normal');
  const [minMaxBerriesError, setMinMaxBerriesError] = useState<boolean>(false);
  const [firmness, setFirmness] = useState<string>(item.berryData ? item.berryData.firmness : 'very_soft');
  const firmnessesOptions = useMemo(() => Firmnesses.map((firmness) => ({ value: firmness, label: t(`firmness_${firmness}`) })), [t]);

  // Event charset for this berry's tree. '' = use PSDK's default (derived from
  // the item id at runtime). Set via the native character-graphic chooser or by
  // dropping an image, exactly like Studio's other graphic-resource fields.
  const [graphicName, setGraphicName] = useState<string>(item.berryData?.graphicName ?? '');
  const copyFile = useCopyFile();

  const pickCharacter = () => {
    if (!projectPath) return;
    window.api.chooseCharacterGraphic(
      { projectPath },
      ({ name }) => setGraphicName(name),
      () => {
        /* cancelled */
      }
    );
  };

  const onDropGraphic: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const dropped = Array.from(event.dataTransfer.files).find((file) => CHARSET_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() ?? ''));
    if (!dropped) return;
    const srcFile = window.api.getPathForFile(dropped);
    copyFile(
      { srcFile, destFolder: 'graphics/characters' },
      ({ destFile }) => setGraphicName(toCharacterName(destFile)),
      ({ errorMessage }) => window.api.log.error(errorMessage)
    );
  };

  const onDragOverGraphic: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

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
        graphicName: graphicName || undefined,
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
        <InputGroupCollapse title={t('berries_event_data')} gap="16px">
          <NaturalGiftInfoContainer>
            <NaturalGiftInfo>{t('berries_event_graphic_info')}</NaturalGiftInfo>
          </NaturalGiftInfoContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="berries-event-graphic">{t('berries_event_graphic')}</Label>
            <GraphicResourceContainer onDrop={onDropGraphic} onDragOver={onDragOverGraphic}>
              <div className="preview" title={graphicName || t('berries_event_graphic_default')}>
                {projectPath && graphicName ? (
                  <CharacterSprite projectPath={projectPath} characterName={graphicName} direction={2} pattern={0} fitW={64} fitH={64} maxScale={2} />
                ) : (
                  <span className="empty">{t('berries_event_graphic_default')}</span>
                )}
              </div>
              <div className="buttons">
                <EditButtonOnlyIcon disabled={!projectPath} onClick={projectPath ? pickCharacter : undefined} />
                <ClearButtonOnlyIcon disabled={!graphicName} onClick={graphicName ? () => setGraphicName('') : undefined} />
              </div>
            </GraphicResourceContainer>
          </InputWithTopLabelContainer>
        </InputGroupCollapse>
      </InputContainer>
    </Editor>
  );
});
ItemBerriesDataEditor.displayName = 'ItemBerriesDataEditor';
