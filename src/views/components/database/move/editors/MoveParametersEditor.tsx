import React, { forwardRef, useMemo, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { wrongDbSymbol } from '@utils/dbSymbolUtils';
import { TextInputError } from '@components/inputs/Input';
import { SelectCustomSimple } from '@components/SelectCustom/SelectCustomSimple';
import { MOVE_BATTLE_ENGINE_METHODS, MOVE_TARGETS, StudioMove, StudioMoveBattleEngineAimedTarget } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';

const determineBeMethod = (move: StudioMove, battleEngineMethod: string) => {
  if ((MOVE_BATTLE_ENGINE_METHODS as ReadonlyArray<string>).includes(battleEngineMethod)) return `s_${move.dbSymbol}`;
  return battleEngineMethod;
};

const targetEntries = (t: TFunction<'database_moves'>) => MOVE_TARGETS.map((target) => ({ value: target, label: t(`${target}`) }));

const battleEngineMethodEntries = (move: StudioMove, battleEngineMethod: string, t: TFunction<'database_moves'>) => [
  ...MOVE_BATTLE_ENGINE_METHODS.map((beMethod) => ({ value: beMethod, label: t(`${beMethod}`) })),
  { value: determineBeMethod(move, battleEngineMethod), label: t('custom') },
];

export const MoveParametersEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const [target, setTarget] = useState<StudioMoveBattleEngineAimedTarget>(move.battleEngineAimedTarget);
  const [battleEngineMethod, setBattleEngineMethod] = useState<string>(move.battleEngineMethod);
  const targetOptions = useMemo(() => targetEntries(t), [t]);
  const categoryOptions = useMemo(() => battleEngineMethodEntries(move, battleEngineMethod, t), [move, battleEngineMethod, t]);

  const canClose = () => {
    if (battleEngineMethod.length === 0 || wrongDbSymbol(battleEngineMethod)) return false;

    return true;
  };

  const onClose = () => {
    if (!canClose()) return;

    updateMove({ battleEngineAimedTarget: target, battleEngineMethod });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('settings')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="target">{t('target')}</Label>
          <SelectCustomSimple
            id="select-target"
            value={target}
            options={targetOptions}
            onChange={(value) => setTarget(value as StudioMoveBattleEngineAimedTarget)}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="procedure">{t('procedure')}</Label>
          <SelectCustomSimple
            id="select-procedure"
            options={categoryOptions}
            onChange={(value) => setBattleEngineMethod(value)}
            value={battleEngineMethod}
          />
        </InputWithTopLabelContainer>
        {!(MOVE_BATTLE_ENGINE_METHODS as ReadonlyArray<string>).includes(battleEngineMethod) && (
          <InputWithTopLabelContainer>
            <Label htmlFor="function" required>
              {t('function')}
            </Label>
            <Input
              type="text"
              name="function"
              value={battleEngineMethod}
              onChange={(event) => setBattleEngineMethod(event.target.value)}
              error={battleEngineMethod.length !== 0 && wrongDbSymbol(battleEngineMethod)}
              placeholder={`s_${move.dbSymbol}`}
            />
            {battleEngineMethod.length !== 0 && wrongDbSymbol(battleEngineMethod) && <TextInputError>{t('incorrect_format')}</TextInputError>}
          </InputWithTopLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
});
MoveParametersEditor.displayName = 'MoveParametersEditor';
