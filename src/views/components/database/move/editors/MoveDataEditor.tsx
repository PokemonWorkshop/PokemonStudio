import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import MoveModel, { MoveCriticalRate } from '@modelEntities/move/Move.model';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PercentInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { cleanNaNValue } from '@utils/cleanNaNValue';

const textCriticalRate = [
  'database_moves:no_critical_hit',
  'database_moves:normal',
  'database_moves:high',
  'database_moves:very_high',
  'database_moves:guaranteed',
];

const moveCrititalRateEntries = (t: TFunction<'database_moves'[]>) =>
  MoveCriticalRate.map((critialRate) => ({ value: critialRate.toString(), label: t(textCriticalRate[critialRate] as never) }));

type MoveDataEditorProps = {
  move: MoveModel;
};

export const MoveDataEditor = ({ move }: MoveDataEditorProps) => {
  const { t } = useTranslation(['database_moves']);
  const criticalRateOptions = useMemo(() => moveCrititalRateEntries(t), [t]);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_moves:data')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="power">{t('database_moves:power')}</Label>
          <Input
            type="number"
            name="power"
            min="0"
            max="999"
            value={isNaN(move.power) ? '' : move.power}
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 0 || newValue > 999) return event.preventDefault();
              refreshUI((move.power = newValue));
            }}
            onBlur={() => refreshUI((move.power = cleanNaNValue(move.power)))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="accuracy">{t('database_moves:accuracy')}</Label>
          <Input
            type="number"
            name="accuracy"
            min="0"
            max="100"
            value={isNaN(move.accuracy) ? '' : move.accuracy}
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 0 || newValue > 100) return event.preventDefault();
              refreshUI((move.accuracy = newValue));
            }}
            onBlur={() => refreshUI((move.accuracy = cleanNaNValue(move.accuracy)))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="pp">{t('database_moves:power_points_pp')}</Label>
          <Input
            type="number"
            name="pp"
            min="0"
            max="99"
            value={isNaN(move.pp) ? '' : move.pp}
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 0 || newValue > 99) return event.preventDefault();
              refreshUI((move.pp = newValue));
            }}
            onBlur={() => refreshUI((move.pp = cleanNaNValue(move.pp)))}
          />
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="critical_rate">{t('database_moves:critical_rate')}</Label>
          <SelectCustomSimple
            id="select-critical-rate"
            options={criticalRateOptions}
            onChange={(value) => refreshUI((move.movecriticalRate = Number(value)))}
            value={move.movecriticalRate.toString()}
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="battle_stat_chance">{t('database_moves:effect_chance')}</Label>
          <PercentInput
            type="number"
            name="battle_stat_chance"
            min="0"
            max="100"
            value={isNaN(move.effectChance) ? '' : move.effectChance}
            onChange={(event) => {
              const newValue = event.target.value === '' ? Number.NaN : Number(event.target.value);
              if (newValue < 0 || newValue > 100) return event.preventDefault();
              refreshUI((move.effectChance = newValue));
            }}
            onBlur={() => refreshUI((move.effectChance = cleanNaNValue(move.effectChance)))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="priority">{t('database_moves:priority')}</Label>
          <Input
            type="number"
            name="priority"
            min="-7"
            max="7"
            value={isNaN(move.priority) ? '' : move.priority}
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < -7 || newValue > 7) return event.preventDefault();
              refreshUI((move.priority = newValue));
            }}
            onBlur={() => refreshUI((move.priority = cleanNaNValue(move.priority)))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
