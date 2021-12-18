import { DarkButton, PrimaryButton } from '@components/buttons';
import { useRefreshUI } from '@components/editor';
import { EditorWithCollapse } from '@components/editor/Editor';
import { InputContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import QuestModel, { ObjectiveType, ObjectiveTypes } from '@modelEntities/quest/Quest.model';
import { useProjectQuests } from '@utils/useProjectData';
import React, { useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  QuestGoalBeatNpc,
  QuestGoalBeatPokemon,
  QuestGoalCatchPokemon,
  QuestGoalEgg,
  QuestGoalObtainItem,
  QuestGoalSeePokemon,
  QuestGoalSpeakTo,
} from './goals';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const objectiveCategoryEntries = (t: TFunction<'database_quests'>) => ObjectiveTypes.map((objective) => ({ value: objective, label: t(objective) }));

type QuestNewGoalEditorProps = {
  quest: QuestModel;
  onClose: () => void;
};

export const QuestNewGoalEditor = ({ quest, onClose }: QuestNewGoalEditorProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  const objectiveOptions = useMemo(() => objectiveCategoryEntries(t), [t]);
  const [newObjective, setNewObjective] = useState(QuestModel.createObjective('objective_speak_to'));
  const [isEmptyText, setIsEmptyText] = useState(true);
  const { setProjectDataValues: setQuest } = useProjectQuests();

  const changeObjective = (value: ObjectiveType) => {
    if (value === newObjective.objectiveMethodName) return;
    setNewObjective(QuestModel.createObjective(value));
  };

  const onClickNew = () => {
    quest.objectives.push(newObjective);
    quest.updateIndexSpeakToBeatNpc();
    setQuest({ [quest.dbSymbol]: quest });
    onClose();
  };

  const checkIsEmptyText = () => {
    return (newObjective.objectiveMethodName === 'objective_speak_to' || newObjective.objectiveMethodName === 'objective_beat_npc') && isEmptyText;
  };

  return (
    <EditorWithCollapse type="creation" title={t('goal')}>
      <InputContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="goal-type">{t('goal_type')}</Label>
            <SelectCustomSimple
              id={'goal-type-select'}
              value={newObjective.objectiveMethodName}
              options={objectiveOptions}
              onChange={(value) => refreshUI(changeObjective(value as ObjectiveType))}
              noTooltip
            />
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
        {newObjective.objectiveMethodName === 'objective_speak_to' && <QuestGoalSpeakTo objective={newObjective} setIsEmptyText={setIsEmptyText} />}
        {newObjective.objectiveMethodName === 'objective_beat_npc' && <QuestGoalBeatNpc objective={newObjective} setIsEmptyText={setIsEmptyText} />}
        {newObjective.objectiveMethodName === 'objective_obtain_item' && <QuestGoalObtainItem objective={newObjective} />}
        {newObjective.objectiveMethodName === 'objective_see_pokemon' && <QuestGoalSeePokemon objective={newObjective} />}
        {newObjective.objectiveMethodName === 'objective_beat_pokemon' && <QuestGoalBeatPokemon objective={newObjective} />}
        {newObjective.objectiveMethodName === 'objective_catch_pokemon' && <QuestGoalCatchPokemon objective={newObjective} />}
        {newObjective.objectiveMethodName === 'objective_obtain_egg' && <QuestGoalEgg objective={newObjective} />}
        {newObjective.objectiveMethodName === 'objective_hatch_egg' && <QuestGoalEgg objective={newObjective} />}
        <ButtonContainer>
          <ToolTipContainer>
            {checkIsEmptyText() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkIsEmptyText()}>
              {t('add_goal')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
};
