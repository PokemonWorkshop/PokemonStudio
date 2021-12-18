import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import MoveModel, { MoveStatusList } from '@modelEntities/move/Move.model';
import { TFunction, useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PercentInput } from '@components/inputs';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { cleanNaNValue } from '@utils/cleanNaNValue';

const moveStatusEntries = (t: TFunction<'database_moves'[]>) => {
  const entries = MoveStatusList.map((status) => ({
    value: status,
    label: t(`database_moves:${status}`),
  })).sort((a, b) => a.label.localeCompare(b.label)) as SelectOption[];
  entries.unshift({ value: '', label: t('database_moves:none') });
  return entries;
};

const createDefaultStatus = (move: MoveModel) => {
  if (move.moveStatus.length === 0) move.moveStatus.push({ status: null, luckRate: 0 });
};

type MoveStatusEditorProps = {
  move: MoveModel;
};

const InputContainerStatus = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MoveStatusEditor = ({ move }: MoveStatusEditorProps) => {
  const { t } = useTranslation(['database_moves']);
  const statusOptions = useMemo(() => moveStatusEntries(t), [t]);
  useMemo(() => createDefaultStatus(move), [move]);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_moves:statuses')}>
      <InputContainer>
        <InputContainerStatus>
          <InputWithTopLabelContainer>
            <Label htmlFor="status_1">{t('database_moves:status_1')}</Label>
            <SelectCustomSimple
              id="select-status-1"
              options={statusOptions}
              onChange={(value) => refreshUI(move.setMoveStatus(0, value))}
              value={move.moveStatus[0].status || ''}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="chance_1">{t('database_moves:chance')}</Label>
            <PercentInput
              type="number"
              name="chance_1"
              min="0"
              max="100"
              value={isNaN(move.moveStatus[0].luckRate) ? '' : move.moveStatus[0].luckRate}
              onChange={(event) => {
                const newValue = event.target.value === '' ? Number.NaN : Number(event.target.value);
                if (newValue < 0 || newValue > 100) return event.preventDefault();
                refreshUI(move.setMoveStatusLuckRate(0, newValue));
              }}
              onBlur={() => refreshUI(move.setMoveStatusLuckRate(0, cleanNaNValue(move.moveStatus[0].luckRate)))}
            />
          </InputWithLeftLabelContainer>
        </InputContainerStatus>
        {(move.moveStatus[0].status || (!isNaN(move.moveStatus[0].luckRate) && move.moveStatus[0].luckRate != 0)) && (
          <InputContainerStatus>
            <InputWithTopLabelContainer>
              <Label htmlFor="status_2">{t('database_moves:status_2')}</Label>
              <SelectCustomSimple
                id="select-status-2"
                options={statusOptions}
                onChange={(value) => refreshUI(move.setMoveStatus(1, value))}
                value={move.moveStatus.length >= 2 ? move.moveStatus[1].status || '' : ''}
                noTooltip
              />
            </InputWithTopLabelContainer>
            <InputWithLeftLabelContainer>
              <Label htmlFor="chance_2">{t('database_moves:chance')}</Label>
              <PercentInput
                type="number"
                name="chance_2"
                min="0"
                max="100"
                value={move.moveStatus.length >= 2 ? (isNaN(move.moveStatus[1].luckRate) ? '' : move.moveStatus[1].luckRate) : 0}
                onChange={(event) => {
                  const newValue = event.target.value === '' ? Number.NaN : Number(event.target.value);
                  if (newValue < 0 || newValue > 100) return event.preventDefault();
                  refreshUI(move.setMoveStatusLuckRate(1, newValue));
                }}
                onBlur={() => {
                  if (!move.moveStatus[1]) return;
                  const luckRate = move.moveStatus[1].luckRate;
                  refreshUI(move.setMoveStatusLuckRate(1, cleanNaNValue(luckRate)));
                }}
              />
            </InputWithLeftLabelContainer>
          </InputContainerStatus>
        )}
        {move.moveStatus.length >= 2 && (move.moveStatus[1].status || (!isNaN(move.moveStatus[1].luckRate) && move.moveStatus[1].luckRate != 0)) && (
          <InputContainerStatus>
            <InputWithTopLabelContainer>
              <Label htmlFor="status_3">{t('database_moves:status_3')}</Label>
              <SelectCustomSimple
                id="select-status-3"
                options={statusOptions}
                onChange={(value) => refreshUI(move.setMoveStatus(2, value))}
                value={move.moveStatus.length == 3 ? move.moveStatus[2].status || '' : ''}
                noTooltip
              />
            </InputWithTopLabelContainer>
            <InputWithLeftLabelContainer>
              <Label htmlFor="chance_3">{t('database_moves:chance')}</Label>
              <PercentInput
                type="number"
                name="chance_3"
                min="0"
                max="100"
                value={move.moveStatus.length == 3 ? (isNaN(move.moveStatus[2].luckRate) ? '' : move.moveStatus[2].luckRate) : 0}
                onChange={(event) => {
                  const newValue = event.target.value === '' ? Number.NaN : Number(event.target.value);
                  if (newValue < 0 || newValue > 100) return event.preventDefault();
                  refreshUI(move.setMoveStatusLuckRate(2, newValue));
                }}
                onBlur={() => {
                  if (!move.moveStatus[2]) return;
                  const luckRate = move.moveStatus[2].luckRate;
                  refreshUI(move.setMoveStatusLuckRate(2, cleanNaNValue(luckRate)));
                }}
              />
            </InputWithLeftLabelContainer>
          </InputContainerStatus>
        )}
      </InputContainer>
    </Editor>
  );
};
