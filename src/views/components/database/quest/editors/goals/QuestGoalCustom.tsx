import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { useProjectStudio } from '@hooks/useProjectStudio';
import { useSetProjectText } from '@utils/ReadingProjectText';

export const QuestGoalCustom = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');
  const { defaultFileId } = useProjectStudio().projectStudioValues;
  const inputRef = useRef<HTMLInputElement>(null);
  const setText = useSetProjectText();

  const handleChange = () => {
    if (inputRef.current) {
      const objectiveArg = typeof objective.objectiveMethodArgs[0] === 'number' ? objective.objectiveMethodArgs[0] : 0;
      setText(defaultFileId, objectiveArg, inputRef.current.value);
      if (checkIsValid) checkIsValid();
    }
  };

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom-objective" required>
          {t('objective_custom')}
        </Label>
        <Input
          ref={refs.nameRef}
          type="text"
          name="custom-objective"
          defaultValue={objective.objectiveMethodArgs[0] as string}
          onChange={handleChange}
          placeholder={t('example_custom_objective')}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
