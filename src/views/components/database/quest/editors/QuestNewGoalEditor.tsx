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
import { useUpdateObjectiveQuest } from './useUpdateObjectiveQuest';

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
  const { objective, setObjective, updateObjective } = useUpdateObjectiveQuest(createQuestObjective('objective_speak_to'));
  const [isEmptyText, setIsEmptyText] = useState(true);
  const objectiveMethodName = objective.objectiveMethodName;

  useEditorHandlingClose(ref);

  const changeObjective = (value: StudioQuestObjectiveType) => {
    if (value === objective.objectiveMethodName) return;

    setObjective(createQuestObjective(value));
  };

  const onClickNew = () => {
    const newObjectives = [...quest.objectives, objective];
    updateIndexSpeakToBeatNpc(newObjectives);
    updateQuest({ objectives: newObjectives });
    closeDialog();
  };

  const checkIsEmptyText = () => {
    return (objective.objectiveMethodName === 'objective_speak_to' || objective.objectiveMethodName === 'objective_beat_npc') && isEmptyText;
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
        {objectiveMethodName === 'objective_speak_to' && (
          <QuestGoalSpeakTo objective={objective} setObjective={setObjective} setIsEmptyText={setIsEmptyText} />
        )}
        {objectiveMethodName === 'objective_beat_npc' && (
          <QuestGoalBeatNpc objective={objective} setObjective={setObjective} setIsEmptyText={setIsEmptyText} />
        )}
        {objectiveMethodName === 'objective_obtain_item' && <QuestGoalObtainItem objective={objective} updateObjective={updateObjective} />}
        {objectiveMethodName === 'objective_see_pokemon' && <QuestGoalSeePokemon objective={objective} updateObjective={updateObjective} />}
        {objectiveMethodName === 'objective_beat_pokemon' && <QuestGoalBeatPokemon objective={objective} updateObjective={updateObjective} />}
        {objectiveMethodName === 'objective_catch_pokemon' && (
          <QuestGoalCatchPokemon objective={objective} setObjective={setObjective} updateObjective={updateObjective} />
        )}
        {objectiveMethodName === 'objective_obtain_egg' && <QuestGoalEgg objective={objective} updateObjective={updateObjective} />}
        {objectiveMethodName === 'objective_hatch_egg' && <QuestGoalEgg objective={objective} updateObjective={updateObjective} />}
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
