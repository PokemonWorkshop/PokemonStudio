import { MultiLineInput, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetProjectText } from '@utils/ReadingProjectText';
import { QUEST_CUSTOM_OBJECTIVE_TEXT_ID } from '@modelEntities/quest';
import { QuestTranslationEditorTitle } from '../QuestTranslationOverlay';
import React from 'react';

type QuestGoalCustomProps = QuestGoalProps & {
  handleTranslateClick: (editorTitle: QuestTranslationEditorTitle) => () => void;
};

export const QuestGoalCustom = ({ objective, refs, checkIsValid, handleTranslateClick }: QuestGoalCustomProps) => {
  const { t } = useTranslation();
  const getText = useGetProjectText();
  const defaultValue = getText(QUEST_CUSTOM_OBJECTIVE_TEXT_ID, objective.objectiveMethodArgs[1] as number);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom-objective" required>
          {t('custom_text')}
        </Label>
        <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_custom_objective')}>
          <MultiLineInput
            defaultValue={defaultValue}
            ref={refs.customObjectiveRef}
            placeholder={t('example_custom_objective')}
            onChange={() => checkIsValid && checkIsValid()}
          />
        </TranslateInputContainer>
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
