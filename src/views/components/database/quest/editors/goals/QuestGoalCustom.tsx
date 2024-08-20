import React, { useState, useMemo } from 'react';
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
  const [textSelected, setTextSelected] = useState(defaultFileId?.toString() ?? '__undef__');
  const [dialogSelected, setDialogSelected] = useState('__undef__');
  const refreshUI = useRefreshUI();

  log.info('QuestGoalCustom', defaultFileId?.toString() ?? '__undef__');

  const useText = useMemo(() => {
    const idArray = objective.objectiveMethodArgs[0] as [number, number];
    if (idArray[0]) return idArray[0].toString();
    idArray[0] = Number(textSelected);
    return textSelected;
  }, [objective, textSelected]);

  const useDialog = useMemo(() => {
    const idArray = objective.objectiveMethodArgs[0] as [number, number];
    if (idArray[1]) return idArray[1].toString();
    return dialogSelected;
  }, [objective, dialogSelected]);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom" required>
          {t('custom_text')}
        </Label>
        <SelectText
          fileId={useText}
          onChange={(selected) => {
            setTextSelected(selected);
            refreshUI((objective.objectiveMethodArgs[0][0] = Number(selected)));
            log.info('QuestGoalCustom', { textSelected: selected });
          }}
          undefValueOption={t('select', { str: 'FileId' })}
          noLabel
        />
        <SelectDialog
          fileId={useText}
          textId={useDialog}
          onChange={(selected) => {
            setDialogSelected(selected);
            refreshUI((objective.objectiveMethodArgs[0][1] = Number(selected)));
            if (setIsEmptyText) setIsEmptyText(objective.objectiveMethodArgs[1] === undefined);
          }}
          undefValueOption={t('select', { str: 'TextId' })}
          noLabel
          disabled={textSelected === '__undef__'}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
