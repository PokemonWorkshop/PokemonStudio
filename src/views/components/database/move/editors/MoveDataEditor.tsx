import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PercentInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { MOVE_CRITICAL_RATES, StudioMoveCriticalRate, TEXT_CRITICAL_RATES } from '@modelEntities/move';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

const moveCrititalRateEntries = (t: TFunction<'database_moves'>) =>
  MOVE_CRITICAL_RATES.map((critialRate) => ({ value: critialRate.toString(), label: t(TEXT_CRITICAL_RATES[critialRate]) }));

export const MoveDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const criticalRateOptions = useMemo(() => moveCrititalRateEntries(t), [t]);
  const powerRef = useRef<HTMLInputElement>(null);
  const accuracyRef = useRef<HTMLInputElement>(null);
  const ppRef = useRef<HTMLInputElement>(null);
  const effectChanceRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLInputElement>(null);
  const mapUseRef = useRef<HTMLInputElement>(null);
  const [criticalRate, setCriticalRate] = useState<StudioMoveCriticalRate>(move.movecriticalRate);

  const canClose = () => {
    if (!powerRef.current || !powerRef.current.validity.valid || isNaN(powerRef.current.valueAsNumber)) return false;
    if (!accuracyRef.current || !accuracyRef.current.validity.valid || isNaN(accuracyRef.current.valueAsNumber)) return false;
    if (!ppRef.current || !ppRef.current.validity.valid || isNaN(ppRef.current.valueAsNumber)) return false;
    if (!effectChanceRef.current || !effectChanceRef.current.validity.valid || isNaN(effectChanceRef.current.valueAsNumber)) return false;
    if (!priorityRef.current || !priorityRef.current.validity.valid || isNaN(priorityRef.current.valueAsNumber)) return false;
    if (!mapUseRef.current || !mapUseRef.current.validity.valid || isNaN(mapUseRef.current.valueAsNumber)) return false;

    return true;
  };

  const onClose = () => {
    if (
      !powerRef.current ||
      !accuracyRef.current ||
      !ppRef.current ||
      !effectChanceRef.current ||
      !priorityRef.current ||
      !mapUseRef.current ||
      !canClose()
    )
      return;

    updateMove({
      power: powerRef.current.valueAsNumber,
      accuracy: accuracyRef.current.valueAsNumber,
      pp: ppRef.current.valueAsNumber,
      effectChance: effectChanceRef.current.valueAsNumber,
      priority: priorityRef.current.valueAsNumber,
      mapUse: mapUseRef.current.valueAsNumber,
      movecriticalRate: criticalRate,
    });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('data')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="power">{t('power')}</Label>
          <Input type="number" name="power" min="0" max="999" defaultValue={move.power} ref={powerRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="accuracy">{t('accuracy')}</Label>
          <Input type="number" name="accuracy" min="0" max="100" defaultValue={move.accuracy} ref={accuracyRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="pp">{t('power_points_pp')}</Label>
          <Input type="number" name="pp" min="0" max="99" defaultValue={move.pp} ref={ppRef} />
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="critical-rate">{t('critical_rate')}</Label>
          <SelectCustomSimple
            id="select-critical-rate"
            options={criticalRateOptions}
            onChange={(value) => setCriticalRate(Number(value) as StudioMoveCriticalRate)}
            value={criticalRate.toString()}
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="battle_stat_chance">{t('effect_chance')}</Label>
          <PercentInput type="number" name="battle_stat_chance" min="0" max="100" defaultValue={move.effectChance} ref={effectChanceRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="priority">{t('priority')}</Label>
          <Input type="number" name="priority" min="-7" max="7" defaultValue={move.priority} ref={priorityRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="map-use">{t('common_event')}</Label>
          <Input type="number" name="map-use" min="0" max="999" defaultValue={move.mapUse} ref={mapUseRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
MoveDataEditor.displayName = 'MoveDataEditor';
