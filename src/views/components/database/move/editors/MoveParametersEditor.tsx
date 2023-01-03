import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { wrongDbSymbol } from '@utils/dbSymbolUtils';
import { TextInputError } from '@components/inputs/Input';
import { SelectCustomSimple } from '@components/SelectCustom/SelectCustomSimple';
import { MOVE_BATTLE_ENGINE_METHODS, MOVE_TARGETS, StudioMove, StudioMoveBattleEngineAimedTarget } from '@modelEntities/move';

const determineBeMethod = (move: StudioMove) => {
  if ((MOVE_BATTLE_ENGINE_METHODS as ReadonlyArray<string>).includes(move.battleEngineMethod)) return `s_${move.dbSymbol}`;
  return move.battleEngineMethod;
};

const moveTargetEntries = (t: TFunction<'database_moves'[]>) =>
  MOVE_TARGETS.map((target) => ({ value: target, label: t(`database_moves:${target}`) }));

const moveBattleEngineMethodEntries = (t: TFunction<'database_moves'[]>, move: StudioMove) => [
  ...MOVE_BATTLE_ENGINE_METHODS.map((beMethod) => ({ value: beMethod, label: t(`database_moves:${beMethod}`) })),
  { value: determineBeMethod(move), label: t('database_moves:custom') },
];

type MoveParametersEditorProps = {
  move: StudioMove;
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
            onChange={(value) => refreshUI((move.battleEngineAimedTarget = value as StudioMoveBattleEngineAimedTarget))}
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
        {!(MOVE_BATTLE_ENGINE_METHODS as ReadonlyArray<string>).includes(move.battleEngineMethod) && (
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
