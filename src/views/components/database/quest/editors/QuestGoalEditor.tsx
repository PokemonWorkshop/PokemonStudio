import { EditorWithCollapse } from '@components/editor/Editor';
import { EditorChildWithSubEditorContainer } from '@components/editor/EditorContainer';
import { InputContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { QUEST_OBJECTIVES, StudioQuestObjectiveType, updateIndexSpeakToBeatNpc, CUSTOM_GOAL_TEXT_ID } from '@modelEntities/quest';
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
  QuestGoalCustom,
} from './goals';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useQuestPage } from '@src/hooks/usePage';
import { useObjectiveQuest } from './useObjectiveQuest';
import { useUpdateQuest } from './useUpdateQuest';
import { Select } from '@ds/Select';
import { cloneEntity } from '@utils/cloneEntity';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { assertUnreachable } from '@utils/assertUnreachable';
import { ObjectiveEggIndex } from '@utils/QuestUtils';
import React, { forwardRef, useMemo } from 'react';

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
  const { objective, refs, setObjective, updateObjective, checkIsValid } = useObjectiveQuest(quest.objectives[objectiveIndex]);
  const objectiveMethodName = objective.objectiveMethodName;

  const changeObjective = (value: StudioQuestObjectiveType) => {
    if (value === objective.objectiveMethodName) return;

    updateObjective(value);
  };

  const canClose = () => checkIsValid();

  const onClose = () => {
    if (!canClose()) return;

    const newObjective = cloneEntity(objective);
    const oldObjective = quest.objectives[objectiveIndex];
    const isSameMethodName = newObjective.objectiveMethodName === oldObjective.objectiveMethodName;
    switch (objectiveMethodName) {
      case 'objective_beat_npc': {
        if (!refs.nameRef.current || !refs.valueRef.current) return;

        const backupValue = isSameMethodName ? (oldObjective.objectiveMethodArgs[2] as number) : 1;
        newObjective.objectiveMethodArgs[1] = refs.nameRef.current.value;
        newObjective.objectiveMethodArgs[2] = cleanNaNValue(refs.valueRef.current.valueAsNumber, backupValue);
        break;
      }
      case 'objective_beat_pokemon':
      case 'objective_obtain_item': {
        if (!refs.entityRef.current || !refs.valueRef.current) return;

        const backupValue = isSameMethodName ? (oldObjective.objectiveMethodArgs[1] as number) : 1;
        newObjective.objectiveMethodArgs[0] = refs.entityRef.current;
        newObjective.objectiveMethodArgs[1] = cleanNaNValue(refs.valueRef.current.valueAsNumber, backupValue);
        break;
      }
      case 'objective_hatch_egg':
      case 'objective_obtain_egg': {
        if (!refs.valueRef.current) return;

        const index = ObjectiveEggIndex[objectiveMethodName];
        const backupValue = isSameMethodName ? (oldObjective.objectiveMethodArgs[index] as number) : 1;
        newObjective.objectiveMethodArgs[index] = cleanNaNValue(refs.valueRef.current.valueAsNumber, backupValue);
        break;
      }
      case 'objective_catch_pokemon': {
        if (!refs.valueRef.current) return;

        const backupValue = isSameMethodName ? (oldObjective.objectiveMethodArgs[1] as number) : 1;
        newObjective.objectiveMethodArgs[1] = cleanNaNValue(refs.valueRef.current.valueAsNumber, backupValue);
        // The conditions are managed by the QuestGoalConditions component
        break;
      }
      case 'objective_see_pokemon': {
        if (!refs.entityRef.current) return;

        newObjective.objectiveMethodArgs[0] = refs.entityRef.current;
        break;
      }
      case 'objective_speak_to': {
        if (!refs.nameRef.current) return;

        newObjective.objectiveMethodArgs[1] = refs.nameRef.current.value;
        break;
      }
      case 'objective_custom': {
        if (!refs.valueRef.current) return;

        if (Array.isArray(newObjective.objectiveMethodArgs[0])) {
          newObjective.objectiveMethodArgs[0][0] = CUSTOM_GOAL_TEXT_ID;
          newObjective.objectiveMethodArgs[0][1] = cleanNaNValue(refs.valueRef.current.valueAsNumber, 1);
        }
        newObjective.objectiveMethodArgs[1] = objectiveIndex;
        break;
      }
      default:
        assertUnreachable(objectiveMethodName);
    }

    const updatedObjectives = cloneEntity(quest.objectives);
    updatedObjectives[objectiveIndex] = cloneEntity(newObjective);
    updateIndexSpeakToBeatNpc(updatedObjectives);
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
          {objectiveMethodName === 'objective_speak_to' && <QuestGoalSpeakTo objective={objective} refs={refs} />}
          {objectiveMethodName === 'objective_beat_npc' && <QuestGoalBeatNpc objective={objective} refs={refs} />}
          {objectiveMethodName === 'objective_obtain_item' && <QuestGoalObtainItem objective={objective} refs={refs} />}
          {objectiveMethodName === 'objective_see_pokemon' && <QuestGoalSeePokemon objective={objective} refs={refs} />}
          {objectiveMethodName === 'objective_beat_pokemon' && <QuestGoalBeatPokemon objective={objective} refs={refs} />}
          {objectiveMethodName === 'objective_catch_pokemon' && (
            <QuestGoalCatchPokemon objective={objective} refs={refs} setObjective={setObjective} />
          )}
          {objectiveMethodName === 'objective_obtain_egg' && <QuestGoalEgg objective={objective} refs={refs} />}
          {objectiveMethodName === 'objective_hatch_egg' && <QuestGoalEgg objective={objective} refs={refs} />}
          {objectiveMethodName === 'objective_custom' && <QuestGoalCustom objective={objective} refs={refs} />}
        </InputContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithCollapse>
  );
});
QuestGoalEditor.displayName = 'QuestGoalEditor';
