/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { SelectText, SelectDialog } from '@components/selects';
import { useRefreshUI } from '@components/editor';
import { useProjectStudio } from '@hooks/useProjectStudio';

type QuestGoalCustomProps = {
  setIsEmptyText?: React.Dispatch<React.SetStateAction<boolean>>;
} & QuestGoalProps;

export const QuestGoalCustom = ({ objective, setIsEmptyText }: QuestGoalCustomProps) => {
  const { t } = useTranslation('database_quests');
  const { defaultFileId } = useProjectStudio().projectStudioValues;
  const refreshUI = useRefreshUI();
  const textPtrs = objective.objectiveMethodArgs[0] as Array<number | undefined>;

  setIsEmptyText?.(textPtrs.includes(undefined));

  if (textPtrs[0] === undefined) textPtrs[0] = defaultFileId;

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom" required>
          {t('custom_text')}
        </Label>

        <SelectText
          fileId={textPtrs[0]?.toString() ?? '__undef__'}
          onChange={(selected) => {
            if (selected === '__undef__') refreshUI((textPtrs[0] = undefined));
            else refreshUI((textPtrs[0] = Number(selected)));
          }}
          undefValueOption={t('select', { str: 'FileId' })}
          noLabel
        />

        <SelectDialog
          fileId={textPtrs[0]?.toString() ?? '__undef__'}
          textId={textPtrs[1]?.toString() ?? '__undef__'}
          onChange={(selected) => {
            if (selected === '__undef__') refreshUI((textPtrs[0] = undefined));
            else refreshUI((textPtrs[1] = Number(selected)));
            if (setIsEmptyText) setIsEmptyText(selected === '__undef__');
          }}
          undefValueOption={t('select', { str: 'TextId' })}
          noLabel
          disabled={textPtrs[0] === undefined && defaultFileId === undefined}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
