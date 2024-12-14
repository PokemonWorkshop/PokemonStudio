import { InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { Select } from '@ds/Select/Select';
import { TRAINER_ADDITIONAL_DIALOGS_CONDITION, TRAINER_ADDITIONAL_DIALOGS_TEXT_ID } from '@modelEntities/trainer';
import { useGetProjectText } from '@utils/ReadingProjectText';
import { TrainerDialogAdditionalDialogs } from './useTrainerDialog';
import { TrainerTranslationEditorTitle } from '../TrainerTranslationOverlay';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import React, { Ref, useMemo } from 'react';

const dialogConditionEntries = (dialogs: TrainerDialogAdditionalDialogs[], dialogIndex: number, t: TFunction<'database_trainers'>) => {
  const currentConditions = dialogs.map(({ condition }) => condition).filter((condition) => condition !== dialogs[dialogIndex].condition);
  const conditions = TRAINER_ADDITIONAL_DIALOGS_CONDITION.filter((condition) => !currentConditions.includes(condition)).map((condition) => ({
    value: condition.toString(),
    label: t(`additional_dialog_${condition}`),
  }));
  return conditions;
};

type AdditionalDialogEditorProps = {
  dialogs: TrainerDialogAdditionalDialogs[];
  dialogIndex: number;
  sentenceRef: Ref<HTMLTextAreaElement>;
  changeCondition: (condition: string) => void;
  handleTranslateClick: (editorTitle: TrainerTranslationEditorTitle) => () => void;
};

export const AdditionalDialogEditor = ({ dialogs, dialogIndex, sentenceRef, changeCondition, handleTranslateClick }: AdditionalDialogEditorProps) => {
  const { t } = useTranslation('database_trainers');
  const getText = useGetProjectText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => dialogConditionEntries(dialogs, dialogIndex, t), [dialogs, dialogIndex]);
  const currentDialog = dialogs[dialogIndex];

  return (
    <PaddedInputContainer key={`additional-dialogs-${dialogIndex}`}>
      <InputWithTopLabelContainer>
        <Label htmlFor="condition">{t('condition_appearance')}</Label>
        <Select options={options} value={currentDialog.condition} onChange={changeCondition} />
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="sentence">{t('sentence_spoken')}</Label>
        <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_additional_dialog')}>
          <MultiLineInput id="sentence" defaultValue={getText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, currentDialog.textId)} ref={sentenceRef} />
        </TranslateInputContainer>
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
