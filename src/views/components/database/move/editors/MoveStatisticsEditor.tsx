import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useMovePage } from '@hooks/usePage';
import { useZodForm } from '@hooks/useZodForm';
import { MOVE_BATTLE_STAGE_MOD_LIST, StudioBattleStageMod, StudioMove } from '@modelEntities/move';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BattleStageModEditor } from './MoveStatisticsEditor/BattleStageModEditor';
import { MoveStatisticsFormData, STATISTIC_EDITOR_SCHEMA } from './MoveStatisticsEditor/StatisticEditorSchema';
import { useUpdateMove } from './useUpdateMove';

const moveBattleStageToUI = (move: StudioMove): MoveStatisticsFormData => ({
  battleStages: MOVE_BATTLE_STAGE_MOD_LIST.map((stage) => ({
    type: stage,
    value: move.battleStageMod.find(({ battleStage }) => battleStage === stage)?.modificator ?? 0,
  })),
});

const uiToMoveBattleStage = ({ battleStages }: MoveStatisticsFormData): StudioBattleStageMod[] =>
  battleStages
    .filter(({ value }) => value !== 0)
    .map(({ type: stage, value: modificator }) => ({
      battleStage: stage,
      modificator: modificator,
    }));

export const MoveStatisticsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const formData = useMemo(() => moveBattleStageToUI(move), [move]);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(STATISTIC_EDITOR_SCHEMA, formData);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      updateMove({ battleStageMod: uiToMoveBattleStage(result.data) });
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
