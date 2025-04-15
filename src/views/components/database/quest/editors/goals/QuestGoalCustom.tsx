import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer, Toggle } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { QUEST_CUSTOM_OBJECTIVE_TEXT_ID } from '@modelEntities/quest';
import { useGetProjectText } from '@utils/ReadingProjectText';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestTranslationEditorTitle } from '../QuestTranslationOverlay';
import { QuestGoalProps } from './QuestGoalProps';

type QuestGoalCustomProps = QuestGoalProps & {
  handleTranslateClick: (editorTitle: QuestTranslationEditorTitle) => () => void;
};

export const QuestGoalCustom = ({ objective, refs, checkIsValid, handleTranslateClick }: QuestGoalCustomProps) => {
  const { t } = useTranslation('database_quests');
  const getText = useGetProjectText();
  const defaultValue = getText(QUEST_CUSTOM_OBJECTIVE_TEXT_ID, objective.objectiveMethodArgs[1] as number);
  const [hiddenByDefault, setHiddenByDefault] = useState(objective.hiddenByDefault);

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
          ref={refs.valueRef}
          name="hidden-by-default"
          checked={hiddenByDefault}
          onChange={(event) => {
            objective.hiddenByDefault = event.target.checked;
            setHiddenByDefault(event.target.checked);
            checkIsValid?.();
          }}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
