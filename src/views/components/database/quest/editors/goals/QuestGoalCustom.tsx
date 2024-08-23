/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useMemo } from 'react';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import log from 'electron-log';
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
  const objectiveArray = objective.objectiveMethodArgs[0];
  const setTextPtrs = (fileID?: number | undefined, textID?: number | undefined) => {
    if (fileID != undefined || textID != undefined) {
      if (objectiveArray instanceof Array) {
        objective.objectiveMethodArgs[0] = [fileID ?? (objectiveArray[0] as number), textID ?? (objectiveArray[1] as number)];
      } else {
        objective.objectiveMethodArgs[0] = [fileID ?? defaultFileId, textID];
      }
    } else log.error('QuestGoalCustom', 'FileID and TextID are both undefined');
  };
  const textPtr = useMemo((): { fileID: string; textID: string } => {
    const idArray = objectiveArray instanceof Array ? (objectiveArray as Array<number | undefined>) : [defaultFileId ?? undefined, undefined];
    return {
      fileID: idArray[0]?.toString() ?? '__undef__',
      textID: idArray[1]?.toString() ?? '__undef__',
    };
  }, [objectiveArray, defaultFileId]);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom" required>
          {t('custom_text')}
        </Label>

        <SelectText
          fileId={textPtr.fileID}
          onChange={(selected) => {
            log.debug('QuestGoalCustom', 'Selected FileID: ' + selected);
            log.debug('QuestGoalCustom', 'FileID(before): ' + textPtr.fileID);
            if (isFinite(Number(selected))) refreshUI(setTextPtrs(Number(selected)));
            log.debug('QuestGoalCustom', 'FileID(after): ' + textPtr.fileID);
          }}
          undefValueOption={t('select', { str: 'FileId' })}
          noLabel
        />

        <SelectDialog
          fileId={textPtr.fileID}
          textId={textPtr.textID}
          onChange={(selected) => {
            if (isFinite(Number(selected))) refreshUI(setTextPtrs(undefined, Number(selected)));
            if (setIsEmptyText) setIsEmptyText(selected === '__undef__');
          }}
          undefValueOption={t('select', { str: 'TextId' })}
          noLabel
          disabled={textPtr.fileID === '__undef__'}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
