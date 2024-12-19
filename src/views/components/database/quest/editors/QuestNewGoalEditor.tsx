import { DarkButton, PrimaryButton } from '@components/buttons';
import { EditorWithCollapse } from '@components/editor/Editor';
import { InputContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { QUEST_OBJECTIVES, StudioQuestObjectiveType, updateIndexSpeakToBeatNpc } from '@modelEntities/quest';
import { createQuestObjective } from '@utils/entityCreation';
import React, { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
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
import { TooltipWrapper } from '@ds/Tooltip';
import { useUpdateQuest } from './useUpdateQuest';
import { useQuestPage } from '@src/hooks/usePage';
import { Select } from '@ds/Select';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

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
  const [newObjective, setNewObjective] = useState(createQuestObjective('objective_speak_to'));
  const [isEmptyText, setIsEmptyText] = useState(true);
  const objectiveMethodName = newObjective.objectiveMethodName;

  useEditorHandlingClose(ref);

  const changeObjective = (value: StudioQuestObjectiveType) => {
    if (value === newObjective.objectiveMethodName) return;

    setNewObjective(createQuestObjective(value));
  };

  const onClickNew = () => {
    const newObjectives = [...quest.objectives, newObjective];
    updateIndexSpeakToBeatNpc(newObjectives);
    updateQuest({ objectives: newObjectives });
    closeDialog();
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
            <Select id="goal-type" value={newObjective.objectiveMethodName} options={objectiveOptions} onChange={changeObjective} />
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
        {objectiveMethodName === 'objective_speak_to' && (
          <QuestGoalSpeakTo objective={newObjective} setObjective={setNewObjective} setIsEmptyText={setIsEmptyText} />
        )}
        {objectiveMethodName === 'objective_beat_npc' && (
          <QuestGoalBeatNpc objective={newObjective} setObjective={setNewObjective} setIsEmptyText={setIsEmptyText} />
        )}
        {objectiveMethodName === 'objective_obtain_item' && <QuestGoalObtainItem setObjective={setNewObjective} objective={newObjective} />}
        {objectiveMethodName === 'objective_see_pokemon' && <QuestGoalSeePokemon setObjective={setNewObjective} objective={newObjective} />}
        {objectiveMethodName === 'objective_beat_pokemon' && <QuestGoalBeatPokemon setObjective={setNewObjective} objective={newObjective} />}
        {objectiveMethodName === 'objective_catch_pokemon' && <QuestGoalCatchPokemon setObjective={setNewObjective} objective={newObjective} />}
        {objectiveMethodName === 'objective_obtain_egg' && <QuestGoalEgg setObjective={setNewObjective} objective={newObjective} />}
        {objectiveMethodName === 'objective_hatch_egg' && <QuestGoalEgg setObjective={setNewObjective} objective={newObjective} />}
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkIsEmptyText() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={checkIsEmptyText()}>
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
