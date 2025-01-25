import { DarkButton, PrimaryButton } from '@components/buttons';
import { EditorWithCollapse } from '@components/editor/Editor';
import { InputContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { QUEST_OBJECTIVES, StudioQuestObjectiveType, updateIndexSpeakToBeatNpc, CUSTOM_GOAL_TEXT_ID } from '@modelEntities/quest';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
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
import { TooltipWrapper } from '@ds/Tooltip';
import { useUpdateQuest } from './useUpdateQuest';
import { useQuestPage } from '@src/hooks/usePage';
import { Select } from '@ds/Select';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useObjectiveQuest } from './useObjectiveQuest';
import { cloneEntity } from '@utils/cloneEntity';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { assertUnreachable } from '@utils/assertUnreachable';
import { ObjectiveEggIndex } from '@utils/QuestUtils';
import styled from 'styled-components';
import React, { forwardRef, useMemo } from 'react';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const objectiveCategoryEntries = (t: TFunction<'database_quests'>) =>
  QUEST_OBJECTIVES.map((objective) => ({ value: objective, label: t(objective) }));

type QuestNewGoalEditorProps = {
  closeDialog: () => void;
};

export const QuestNewGoalEditor = forwardRef<EditorHandlingClose, QuestNewGoalEditorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_quests');
  const { quest } = useQuestPage();
  const updateQuest = useUpdateQuest(quest);
  const objectiveOptions = useMemo(() => objectiveCategoryEntries(t), [t]);
  const { objective, refs, isValid, setObjective, updateObjective, checkIsValid } = useObjectiveQuest();
  const objectiveMethodName = objective.objectiveMethodName;
  const objectiveIndex = quest.objectives.length;

  useEditorHandlingClose(ref);

  const changeObjective = (value: StudioQuestObjectiveType) => {
    if (value === objective.objectiveMethodName) return;

    updateObjective(value);
  };

  const onClickNew = () => {
    if (!isValid) return;

    const newObjective = cloneEntity(objective);
    switch (objectiveMethodName) {
      case 'objective_beat_npc': {
        if (!refs.nameRef.current || !refs.valueRef.current) return;

        newObjective.objectiveMethodArgs[1] = refs.nameRef.current.value;
        newObjective.objectiveMethodArgs[2] = cleanNaNValue(refs.valueRef.current.valueAsNumber, 1);
        break;
      }
      case 'objective_beat_pokemon':
      case 'objective_obtain_item': {
        if (!refs.entityRef.current || !refs.valueRef.current) return;

        newObjective.objectiveMethodArgs[0] = refs.entityRef.current;
        newObjective.objectiveMethodArgs[1] = cleanNaNValue(refs.valueRef.current.valueAsNumber, 1);
        break;
      }
      case 'objective_hatch_egg':
      case 'objective_obtain_egg': {
        if (!refs.valueRef.current) return;

        newObjective.objectiveMethodArgs[ObjectiveEggIndex[objectiveMethodName]] = cleanNaNValue(refs.valueRef.current.valueAsNumber, 1);
        break;
      }
      case 'objective_catch_pokemon': {
        if (!refs.valueRef.current) return;

        newObjective.objectiveMethodArgs[1] = cleanNaNValue(refs.valueRef.current.valueAsNumber, 1);
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

    const newObjectives = [...quest.objectives, newObjective];
    updateIndexSpeakToBeatNpc(newObjectives);
    updateQuest({ objectives: newObjectives });
    closeDialog();
  };

  return (
    <EditorWithCollapse type="creation" title={t('goal')}>
      <InputContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="goal-type">{t('goal_type')}</Label>
            <Select id="goal-type" value={objective.objectiveMethodName} options={objectiveOptions} onChange={changeObjective} />
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
        {objectiveMethodName === 'objective_speak_to' && <QuestGoalSpeakTo objective={objective} refs={refs} checkIsValid={checkIsValid} />}
        {objectiveMethodName === 'objective_beat_npc' && <QuestGoalBeatNpc objective={objective} refs={refs} checkIsValid={checkIsValid} />}
        {objectiveMethodName === 'objective_obtain_item' && <QuestGoalObtainItem objective={objective} refs={refs} checkIsValid={checkIsValid} />}
        {objectiveMethodName === 'objective_see_pokemon' && <QuestGoalSeePokemon objective={objective} refs={refs} />}
        {objectiveMethodName === 'objective_beat_pokemon' && <QuestGoalBeatPokemon objective={objective} refs={refs} checkIsValid={checkIsValid} />}
        {objectiveMethodName === 'objective_catch_pokemon' && (
          <QuestGoalCatchPokemon objective={objective} refs={refs} setObjective={setObjective} checkIsValid={checkIsValid} />
        )}
        {objectiveMethodName === 'objective_obtain_egg' && <QuestGoalEgg objective={objective} refs={refs} checkIsValid={checkIsValid} />}
        {objectiveMethodName === 'objective_hatch_egg' && <QuestGoalEgg objective={objective} refs={refs} checkIsValid={checkIsValid} />}
        {objectiveMethodName === 'objective_custom' && <QuestGoalCustom objective={objective} refs={refs} checkIsValid={checkIsValid} />}
        <ButtonContainer>
          <TooltipWrapper data-tooltip={!isValid ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={!isValid}>
              {t('add_goal')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
});
QuestNewGoalEditor.displayName = 'QuestNewGoalEditor';
