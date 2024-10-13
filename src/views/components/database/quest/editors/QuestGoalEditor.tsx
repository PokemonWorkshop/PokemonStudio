import { useRefreshUI } from '@components/editor';
import { EditorWithCollapse } from '@components/editor/Editor';
import { EditorChildWithSubEditorContainer } from '@components/editor/EditorContainer';
import { InputContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { QUEST_OBJECTIVES, StudioQuest, StudioQuestObjectiveType } from '@modelEntities/quest';
import { createQuestObjective } from '@utils/entityCreation';
import { padStr } from '@utils/PadStr';
import React, { useMemo } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import {
  QuestGoalBeatNpc,
  QuestGoalBeatPokemon,
  QuestGoalCatchPokemon,
  QuestGoalCustom,
  QuestGoalEgg,
  QuestGoalObtainItem,
  QuestGoalSeePokemon,
  QuestGoalSpeakTo,
} from './goals';

const objectiveCategoryEntries = (t: TFunction<'database_quests'>) =>
  QUEST_OBJECTIVES.map((objective) => ({ value: objective, label: t(objective) }));

type QuestGoalEditorProps = {
  quest: StudioQuest;
  objectiveIndex: number;
};

export const QuestGoalEditor = ({ quest, objectiveIndex }: QuestGoalEditorProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  const objectiveOptions = useMemo(() => objectiveCategoryEntries(t), [t]);
  const objective = quest.objectives[objectiveIndex];

  const changeObjective = (value: StudioQuestObjectiveType) => {
    if (value === quest.objectives[objectiveIndex].objectiveMethodName) return;
    quest.objectives[objectiveIndex] = createQuestObjective(value);
  };

  return (
    <EditorWithCollapse type="edit" title={t('goal_title', { id: padStr(objectiveIndex + 1, 2) })}>
      <EditorChildWithSubEditorContainer>
        <InputContainer>
          <PaddedInputContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="goal-type">{t('goal_type')}</Label>
              <SelectCustomSimple
                id={'goal-type-select'}
                value={objective.objectiveMethodName}
                options={objectiveOptions}
                onChange={(value) => refreshUI(changeObjective(value as StudioQuestObjectiveType))}
                noTooltip
              />
            </InputWithTopLabelContainer>
          </PaddedInputContainer>
          {objective.objectiveMethodName === 'objective_speak_to' && <QuestGoalSpeakTo objective={objective} />}
          {objective.objectiveMethodName === 'objective_beat_npc' && <QuestGoalBeatNpc objective={objective} />}
          {objective.objectiveMethodName === 'objective_obtain_item' && <QuestGoalObtainItem objective={objective} />}
          {objective.objectiveMethodName === 'objective_see_pokemon' && <QuestGoalSeePokemon objective={objective} />}
          {objective.objectiveMethodName === 'objective_beat_pokemon' && <QuestGoalBeatPokemon objective={objective} />}
          {objective.objectiveMethodName === 'objective_catch_pokemon' && <QuestGoalCatchPokemon objective={objective} />}
          {objective.objectiveMethodName === 'objective_obtain_egg' && <QuestGoalEgg objective={objective} />}
          {objective.objectiveMethodName === 'objective_hatch_egg' && <QuestGoalEgg objective={objective} />}
          {objective.objectiveMethodName === 'objective_custom' && <QuestGoalCustom objective={objective} />}
        </InputContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithCollapse>
  );
};
