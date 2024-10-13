/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { SelectText, SelectDialog } from '@components/selects';
import { useRefreshUI } from '@components/editor';
import { useProjectStudio } from '@hooks/useProjectStudio';
import Logger from 'electron-log';

type QuestGoalCustomProps = {
  setIsEmptyText: React.Dispatch<React.SetStateAction<boolean>>;
} & QuestGoalProps;

export const QuestGoalCustom = ({ objective, setIsEmptyText }: QuestGoalCustomProps) => {
  const { t } = useTranslation(['select', 'text_management']);
  const { defaultFileId } = useProjectStudio().projectStudioValues;
  const refreshUI = useRefreshUI();
  const textPtrs = objective.objectiveMethodArgs[0] as Array<number | undefined>;

  if (textPtrs.includes(undefined)) {
    if (textPtrs[0] === undefined) textPtrs[0] = defaultFileId;
    if (setIsEmptyText) setIsEmptyText(textPtrs[1] === undefined || textPtrs[0] === undefined);
  }

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="file-id" required>
          {t('text_management:texts_file')}
        </Label>
        <SelectText
          name="file-id"
          fileId={textPtrs[0]?.toString() ?? '__undef__'}
          onChange={(selected) => {
            // textPtrs[1] = undefined;
            refreshUI((textPtrs[0] = selected === '__undef__' ? undefined : Number(selected)));
            refreshUI((textPtrs[1] = undefined));
          }}
          undefValueOption={t('select:none')}
        />
      </InputWithTopLabelContainer>

      <InputWithTopLabelContainer>
        <Label htmlFor="text-id">{t('text_management:texts')}</Label>

        <SelectDialog
          name="text-id"
          fileId={textPtrs[0]?.toString() ?? '__undef__'}
          textId={textPtrs[1]?.toString() ?? '__undef__'}
          onChange={(selected) => {
            refreshUI((textPtrs[1] = selected === '__undef__' ? undefined : Number(selected)));
            if (setIsEmptyText) setIsEmptyText(selected === '__undef__');
          }}
          undefValueOption={t('select:none')}
          disabled={textPtrs[0] === undefined && defaultFileId === undefined}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
