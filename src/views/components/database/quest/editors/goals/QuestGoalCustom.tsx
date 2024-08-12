import React, { useState, useMemo } from 'react';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import log from 'electron-log';
import { SelectText, SelectDialog } from '@components/selects';
import { useRefreshUI } from '@components/editor';

type QuestGoalCustomProps = {
  setIsEmptyText?: React.Dispatch<React.SetStateAction<boolean>>;
} & QuestGoalProps;

export const QuestGoalCustom = ({ objective, setIsEmptyText }: QuestGoalCustomProps) => {
  const { t } = useTranslation('database_quests');
  const { t: n } = useTranslation('text_management');
  const [textSelected, setTextSelected] = useState('300');
  const [dialogSelected, setDialogSelected] = useState('__undef__');
  const refreshUI = useRefreshUI();

  const useText = useMemo(() => {
    if (objective.objectiveMethodArgs[0]) return objective.objectiveMethodArgs[0].toString();
    objective.objectiveMethodArgs[0] = Number(textSelected);
    return textSelected;
  }, [objective, textSelected]);

  const useDialog = useMemo(() => {
    // log.info('QuestGoalCustom', useText);
    if (objective.objectiveMethodArgs[1]) return objective.objectiveMethodArgs[1].toString();
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
            refreshUI((objective.objectiveMethodArgs[0] = Number(selected)));
            log.info('QuestGoalCustom', { textSelected: selected });
          }}
          undefValueOption={n('none')}
          noLabel
        />
        <SelectDialog
          fileId={useText}
          textId={useDialog}
          onChange={(selected) => {
            setDialogSelected(selected);
            refreshUI((objective.objectiveMethodArgs[1] = Number(selected)));
            if (setIsEmptyText) setIsEmptyText(objective.objectiveMethodArgs[1] === undefined);
            log.info('QuestGoalCustom', { dialogSelected: selected });
          }}
          undefValueOption={''}
          noLabel
          disabled={textSelected === '__undef__'}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
