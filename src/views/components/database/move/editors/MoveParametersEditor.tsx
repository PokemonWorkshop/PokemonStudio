import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import MoveModel, { MoveBattleEngineMethod, MoveTarget } from '@modelEntities/move/Move.model';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { wrongDbSymbol } from '@utils/dbSymbolCheck';
import { TextInputError } from '@components/inputs/Input';
import { SelectCustomSimple } from '@components/SelectCustom/SelectCustomSimple';

const determineBeMethod = (move: MoveModel) => {
  if ((MoveBattleEngineMethod as ReadonlyArray<string>).includes(move.battleEngineMethod)) return `s_${move.dbSymbol}`;
  return move.battleEngineMethod;
};

const moveTargetEntries = (t: TFunction<'database_moves'[]>) => MoveTarget.map((target) => ({ value: target, label: t(`database_moves:${target}`) }));

const moveBattleEngineMethodEntries = (t: TFunction<'database_moves'[]>, move: MoveModel) => {
  const entries = MoveBattleEngineMethod.map((beMethod) => ({ value: beMethod, label: t(`database_moves:${beMethod}`) })) as SelectOption[];
  entries.push({ value: determineBeMethod(move), label: t('database_moves:custom') });
  return entries;
};

type MoveParametersEditorProps = {
  move: MoveModel;
};

export const MoveParametersEditor = ({ move }: MoveParametersEditorProps) => {
  const { t } = useTranslation(['database_moves']);
  const targetOptions = useMemo(() => moveTargetEntries(t), [t]);
  const categoryOptions = moveBattleEngineMethodEntries(t, move);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_moves:settings')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="target">{t('database_moves:target')}</Label>
          <SelectCustomSimple
            id="select-target"
            value={move.battleEngineAimedTarget}
            options={targetOptions}
            onChange={(value) => refreshUI((move.battleEngineAimedTarget = value))}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('database_moves:procedure')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={categoryOptions}
            onChange={(value) => refreshUI((move.battleEngineMethod = value))}
            value={move.battleEngineMethod}
          />
        </InputWithTopLabelContainer>
        {!(MoveBattleEngineMethod as ReadonlyArray<string>).includes(move.battleEngineMethod) && (
          <InputWithTopLabelContainer>
            <Label htmlFor="function" required>
              {t('database_moves:function')}
            </Label>
            <Input
              type="text"
              name="function"
              value={move.battleEngineMethod}
              onChange={(event) => refreshUI((move.battleEngineMethod = event.target.value))}
              error={wrongDbSymbol(move.battleEngineMethod)}
              placeholder={`s_${move.dbSymbol}`}
            />
            {move.battleEngineMethod.length !== 0 && wrongDbSymbol(move.battleEngineMethod) && (
              <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>
            )}
          </InputWithTopLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
};
