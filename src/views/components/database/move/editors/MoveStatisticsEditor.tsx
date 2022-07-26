import React from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import MoveModel, { BattleStageType } from '@modelEntities/move/Move.model';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, Label, PercentInput } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type MoveStatisticsEditorProps = {
  move: MoveModel;
};

const value = (stageType: BattleStageType, move: MoveModel) => {
  return isNaN(move.getBattleStageModModificator(stageType)) ? '' : move.getBattleStageModModificator(stageType);
};

const onChange = (event: React.ChangeEvent<HTMLInputElement>, stageType: BattleStageType, move: MoveModel) => {
  const newValue = parseInt(event.target.value);
  if (newValue < -99 || newValue > 99) return event.preventDefault();
  move.setBattleStageMod(stageType, newValue);
};

const onBlur = (stageType: BattleStageType, move: MoveModel) => {
  const modificator = move.getBattleStageModModificator(stageType);
  move.setBattleStageMod(stageType, cleanNaNValue(modificator));
};

export const MoveStatisticsEditor = ({ move }: MoveStatisticsEditorProps) => {
  const { t } = useTranslation(['database_moves']);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_moves:statistics')}>
      <InputContainer size="xs">
        <InputWithLeftLabelContainer>
          <Label htmlFor="attack">{t('database_moves:attack')}</Label>
          <Input
            type="number"
            name="attack"
            min="-99"
            max="99"
            value={value('ATK_STAGE', move)}
            onChange={(event) => refreshUI(onChange(event, 'ATK_STAGE', move))}
            onBlur={() => refreshUI(onBlur('ATK_STAGE', move))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="defense">{t('database_moves:defense')}</Label>
          <Input
            type="number"
            name="defense"
            min="-99"
            max="99"
            value={value('DFE_STAGE', move)}
            onChange={(event) => refreshUI(onChange(event, 'DFE_STAGE', move))}
            onBlur={() => refreshUI(onBlur('DFE_STAGE', move))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="special_attack">{t('database_moves:special_attack')}</Label>
          <Input
            type="number"
            name="special_attack"
            min="-99"
            max="99"
            value={value('ATS_STAGE', move)}
            onChange={(event) => refreshUI(onChange(event, 'ATS_STAGE', move))}
            onBlur={() => refreshUI(onBlur('ATS_STAGE', move))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="special_defense">{t('database_moves:special_defense')}</Label>
          <Input
            type="number"
            name="special_defense"
            min="-99"
            max="99"
            value={value('DFS_STAGE', move)}
            onChange={(event) => refreshUI(onChange(event, 'DFS_STAGE', move))}
            onBlur={() => refreshUI(onBlur('DFS_STAGE', move))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="speed">{t('database_moves:speed')}</Label>
          <Input
            type="number"
            name="speed"
            min="-99"
            max="99"
            value={value('SPD_STAGE', move)}
            onChange={(event) => refreshUI(onChange(event, 'SPD_STAGE', move))}
            onBlur={() => refreshUI(onBlur('SPD_STAGE', move))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="evasion">{t('database_moves:evasion')}</Label>
          <Input
            type="number"
            name="evasion"
            min="-99"
            max="99"
            value={value('EVA_STAGE', move)}
            onChange={(event) => refreshUI(onChange(event, 'EVA_STAGE', move))}
            onBlur={() => refreshUI(onBlur('EVA_STAGE', move))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="accuracy">{t('database_moves:accuracy')}</Label>
          <Input
            type="number"
            name="accuracy"
            min="-99"
            max="99"
            value={value('ACC_STAGE', move)}
            onChange={(event) => refreshUI(onChange(event, 'ACC_STAGE', move))}
            onBlur={() => refreshUI(onBlur('ACC_STAGE', move))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
