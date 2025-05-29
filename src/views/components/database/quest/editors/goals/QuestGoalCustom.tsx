import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer, Toggle } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { QUEST_CUSTOM_OBJECTIVE_TEXT_ID } from '@modelEntities/quest';
import { useGetProjectText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestTranslationEditorTitle } from '../QuestTranslationOverlay';
import { QuestGoalProps } from './QuestGoalProps';

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
      <InputWithLeftLabelContainer>
        <Label htmlFor="hidden-by-default">{t('hidden_default')}</Label>
        <Toggle
          ref={refs.hiddenByDefaultRef}
          name="hidden-by-default"
          defaultChecked={objective.hiddenByDefault}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
