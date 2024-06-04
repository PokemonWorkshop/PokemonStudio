import React, { forwardRef, useMemo } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { MOVE_BATTLE_STAGE_MOD_LIST, StudioBattleStageMod, StudioMove } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';
import { useZodForm } from '@utils/useZodForm';
import { cloneEntity } from '@utils/cloneEntity';
import { STATISTIC_EDITOR_SCHEMA } from './MoveStatisticsEditor/StatisticEditorSchema';
import { BattleStageModEditor } from './MoveStatisticsEditor/BattleStageModEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';

const initBattleStageMods = (move: StudioMove): StudioMove => {
  const battleStagsMods: StudioBattleStageMod[] = [];
  MOVE_BATTLE_STAGE_MOD_LIST.forEach((stageMod) => {
    const modificator = move.battleStageMod.find(({ battleStage }) => battleStage === stageMod)?.modificator;
    battleStagsMods.push({ battleStage: stageMod, modificator: modificator ?? 0 });
  });
  const moveWithBattleStageMods = cloneEntity(move);
  moveWithBattleStageMods.battleStageMod = battleStagsMods;
  return moveWithBattleStageMods;
};

export const MoveStatisticsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const moveWithBattleStageMods = useMemo(() => initBattleStageMods(move), [move]);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(STATISTIC_EDITOR_SCHEMA, moveWithBattleStageMods);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      const battleStageMods = result.data.battleStageMod.filter(({ modificator }) => modificator !== 0);
      updateMove({ battleStageMod: battleStageMods });
    }
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('statistics')}>
      <InputFormContainer ref={formRef} size="xs">
        <BattleStageModEditor index={0} label={t('attack')} defaults={defaults} onTouched={onInputTouched} />
        <BattleStageModEditor index={1} label={t('defense')} defaults={defaults} onTouched={onInputTouched} />
        <BattleStageModEditor index={2} label={t('special_attack')} defaults={defaults} onTouched={onInputTouched} />
        <BattleStageModEditor index={3} label={t('special_defense')} defaults={defaults} onTouched={onInputTouched} />
        <BattleStageModEditor index={4} label={t('speed')} defaults={defaults} onTouched={onInputTouched} />
        <BattleStageModEditor index={5} label={t('evasion')} defaults={defaults} onTouched={onInputTouched} />
        <BattleStageModEditor index={6} label={t('accuracy')} defaults={defaults} onTouched={onInputTouched} />
      </InputFormContainer>
    </Editor>
  );
});
MoveStatisticsEditor.displayName = 'MoveStatisticsEditor';
