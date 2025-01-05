import { EditorWithCollapse } from '@components/editor/Editor';
import { EditorChildWithSubEditorContainer } from '@components/editor/EditorContainer';
import { InputContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { QUEST_OBJECTIVES, StudioQuestObjectiveType } from '@modelEntities/quest';
import { createQuestObjective } from '@utils/entityCreation';
import { padStr } from '@utils/PadStr';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import {
  QuestGoalBeatNpc,
  QuestGoalBeatPokemon,
  QuestGoalCatchPokemon,
  QuestGoalEgg,
  QuestGoalObtainItem,
  QuestGoalSeePokemon,
  QuestGoalSpeakTo,
} from './goals';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useQuestPage } from '@src/hooks/usePage';
import { useUpdateObjectiveQuest } from './useUpdateObjectiveQuest';
import { useUpdateQuest } from './useUpdateQuest';
import { Select } from '@ds/Select';
import { cloneEntity } from '@utils/cloneEntity';
import React, { forwardRef, useMemo } from 'react';
import { cleaningQuestObjectivesNaNValues } from '@utils/cleanNaNValue';

const objectiveCategoryEntries = (t: TFunction<'database_quests'>) =>
  QUEST_OBJECTIVES.map((objective) => ({ value: objective, label: t(objective) }));

type QuestGoalEditorProps = {
  objectiveIndex: number;
};

export const QuestGoalEditor = forwardRef<EditorHandlingClose, QuestGoalEditorProps>(({ objectiveIndex }, ref) => {
  const { t } = useTranslation('database_quests');
  const { quest } = useQuestPage();
  const updateQuest = useUpdateQuest(quest);
  const objectiveOptions = useMemo(() => objectiveCategoryEntries(t), [t]);
  const { objective, setObjective, updateObjective } = useUpdateObjectiveQuest(quest.objectives[objectiveIndex]);
  const objectiveMethodName = objective.objectiveMethodName;

  const changeObjective = (value: StudioQuestObjectiveType) => {
    if (value === objective.objectiveMethodName) return;

    setObjective(createQuestObjective(value));
  };

  const canClose = () => {
    if (!['objective_speak_to', 'objective_beat_npc'].includes(objective.objectiveMethodName)) return true;

    return objective.objectiveMethodArgs[1] !== '';
  };

  const onClose = () => {
    if (!canClose()) return;

    const updatedObjectives = cloneEntity(quest.objectives);
    updatedObjectives[objectiveIndex] = cloneEntity(objective);
    cleaningQuestObjectivesNaNValues(updatedObjectives);
    updateQuest({ objectives: updatedObjectives });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <EditorWithCollapse type="edit" title={t('goal_title', { id: padStr(objectiveIndex + 1, 2) })}>
      <EditorChildWithSubEditorContainer>
        <InputContainer>
          <PaddedInputContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="goal-type">{t('goal_type')}</Label>
              <Select id="goal-type" value={objective.objectiveMethodName} options={objectiveOptions} onChange={changeObjective} />
            </InputWithTopLabelContainer>
          </PaddedInputContainer>
          {objectiveMethodName === 'objective_speak_to' && (
            <QuestGoalSpeakTo objective={objective} setObjective={setObjective} setIsEmptyText={() => {}} />
          )}
          {objectiveMethodName === 'objective_beat_npc' && (
            <QuestGoalBeatNpc objective={objective} setObjective={setObjective} setIsEmptyText={() => {}} />
          )}
          {objectiveMethodName === 'objective_obtain_item' && <QuestGoalObtainItem objective={objective} updateObjective={updateObjective} />}
          {objectiveMethodName === 'objective_see_pokemon' && <QuestGoalSeePokemon objective={objective} updateObjective={updateObjective} />}
          {objectiveMethodName === 'objective_beat_pokemon' && <QuestGoalBeatPokemon objective={objective} updateObjective={updateObjective} />}
          {objectiveMethodName === 'objective_catch_pokemon' && (
            <QuestGoalCatchPokemon objective={objective} setObjective={setObjective} updateObjective={updateObjective} />
          )}
          {objectiveMethodName === 'objective_obtain_egg' && <QuestGoalEgg objective={objective} updateObjective={updateObjective} />}
          {objectiveMethodName === 'objective_hatch_egg' && <QuestGoalEgg objective={objective} updateObjective={updateObjective} />}
        </InputContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithCollapse>
  );
});
QuestGoalEditor.displayName = 'QuestGoalEditor';
