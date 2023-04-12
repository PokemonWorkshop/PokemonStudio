import React, { forwardRef, useRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { getBattleStageModModificator, StudioBattleStageMod, StudioMoveBattleStage } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';

/**
 * Set the battle stage modificator
 * @param battleStageMods The array containing the modificators of the battle stage
 * @param stageType The type of the battle stage
 * @param modificator The modificator of the battle stage
 */
const setBattleStageMod = (battleStageMods: StudioBattleStageMod[], stageType: StudioMoveBattleStage, modificator: number) => {
  const currentStageMod = battleStageMods.find((stat) => stat.battleStage === stageType);
  if (!currentStageMod) {
    if (modificator !== 0) battleStageMods.push({ battleStage: stageType, modificator: modificator });
    return;
  }
  if (modificator !== 0) {
    currentStageMod.modificator = modificator;
    return;
  }
  battleStageMods.splice(battleStageMods.indexOf(currentStageMod), 1);
};

export const MoveStatisticsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const attackRef = useRef<HTMLInputElement>(null);
  const defenseRef = useRef<HTMLInputElement>(null);
  const specialAttackRef = useRef<HTMLInputElement>(null);
  const specialDefenseRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef<HTMLInputElement>(null);
  const evasionRef = useRef<HTMLInputElement>(null);
  const accuracyRef = useRef<HTMLInputElement>(null);

  const canClose = () => {
    if (!attackRef.current || !attackRef.current.validity.valid || isNaN(attackRef.current.valueAsNumber)) return false;
    if (!defenseRef.current || !defenseRef.current.validity.valid || isNaN(defenseRef.current.valueAsNumber)) return false;
    if (!specialAttackRef.current || !specialAttackRef.current.validity.valid || isNaN(specialAttackRef.current.valueAsNumber)) return false;
    if (!specialDefenseRef.current || !specialDefenseRef.current.validity.valid || isNaN(specialDefenseRef.current.valueAsNumber)) return false;
    if (!speedRef.current || !speedRef.current.validity.valid || isNaN(speedRef.current.valueAsNumber)) return false;
    if (!evasionRef.current || !evasionRef.current.validity.valid || isNaN(evasionRef.current.valueAsNumber)) return false;
    if (!accuracyRef.current || !accuracyRef.current.validity.valid || isNaN(accuracyRef.current.valueAsNumber)) return false;

    return true;
  };

  const onClose = () => {
    if (
      !attackRef.current ||
      !defenseRef.current ||
      !specialAttackRef.current ||
      !specialDefenseRef.current ||
      !speedRef.current ||
      !evasionRef.current ||
      !accuracyRef.current ||
      !canClose()
    )
      return;

    const battleStageMods: StudioBattleStageMod[] = Object.assign([], move.battleStageMod);
    setBattleStageMod(battleStageMods, 'ATK_STAGE', attackRef.current.valueAsNumber);
    setBattleStageMod(battleStageMods, 'DFE_STAGE', defenseRef.current.valueAsNumber);
    setBattleStageMod(battleStageMods, 'ATS_STAGE', specialAttackRef.current.valueAsNumber);
    setBattleStageMod(battleStageMods, 'DFS_STAGE', specialDefenseRef.current.valueAsNumber);
    setBattleStageMod(battleStageMods, 'SPD_STAGE', speedRef.current.valueAsNumber);
    setBattleStageMod(battleStageMods, 'EVA_STAGE', evasionRef.current.valueAsNumber);
    setBattleStageMod(battleStageMods, 'ACC_STAGE', accuracyRef.current.valueAsNumber);
    updateMove({ battleStageMod: battleStageMods });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('statistics')}>
      <InputContainer size="xs">
        <InputWithLeftLabelContainer>
          <Label htmlFor="attack">{t('attack')}</Label>
          <Input type="number" name="attack" min="-99" max="99" defaultValue={getBattleStageModModificator(move, 'ATK_STAGE')} ref={attackRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="defense">{t('defense')}</Label>
          <Input type="number" name="defense" min="-99" max="99" defaultValue={getBattleStageModModificator(move, 'DFE_STAGE')} ref={defenseRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="special-attack">{t('special_attack')}</Label>
          <Input
            type="number"
            name="special_attack"
            min="-99"
            max="99"
            defaultValue={getBattleStageModModificator(move, 'ATS_STAGE')}
            ref={specialAttackRef}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="special-defense">{t('special_defense')}</Label>
          <Input
            type="number"
            name="special-defense"
            min="-99"
            max="99"
            defaultValue={getBattleStageModModificator(move, 'DFS_STAGE')}
            ref={specialDefenseRef}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="speed">{t('speed')}</Label>
          <Input type="number" name="speed" min="-99" max="99" defaultValue={getBattleStageModModificator(move, 'SPD_STAGE')} ref={speedRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="evasion">{t('evasion')}</Label>
          <Input type="number" name="evasion" min="-99" max="99" defaultValue={getBattleStageModModificator(move, 'EVA_STAGE')} ref={evasionRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="accuracy">{t('accuracy')}</Label>
          <Input type="number" name="accuracy" min="-99" max="99" defaultValue={getBattleStageModModificator(move, 'ACC_STAGE')} ref={accuracyRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
MoveStatisticsEditor.displayName = 'MoveStatisticsEditor';
