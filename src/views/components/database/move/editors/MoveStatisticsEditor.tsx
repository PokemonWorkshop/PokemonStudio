import React, { forwardRef, useMemo } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { StudioMove } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { useZodForm } from '@hooks/useZodForm';
import { cloneEntity } from '@utils/cloneEntity';
import { STATISTIC_EDITOR_SCHEMA } from './MoveStatisticsEditor/StatisticEditorSchema';
import { BattleStageModEditor } from './MoveStatisticsEditor/BattleStageModEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { moveBattleStageToUI, uiToMoveBattleStage } from '@utils/MoveUtils';

const initBattleStageMods = (move: StudioMove): StudioMove => {
  const moveWithBattleStageMods = cloneEntity(move);
  moveWithBattleStageMods.battleStageMod = moveBattleStageToUI(move);
  return moveWithBattleStageMods;
};

export const MoveStatisticsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const moveWithBattleStageMods = useMemo(() => initBattleStageMods(move), [move]);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(STATISTIC_EDITOR_SCHEMA, moveWithBattleStageMods);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      updateMove({ battleStageMod: uiToMoveBattleStage(result.data.battleStageMod) });
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
