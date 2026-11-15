import { Editor } from '@components/editor';
import { useZodForm } from '@hooks/useZodForm';
import React, { forwardRef, useRef, useState } from 'react';

import { DarkButton, PrimaryButton } from '@components/buttons';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TextInputError } from '@components/inputs/Input';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { TooltipWrapper } from '@ds/Tooltip';
import { useProjectTrainerClasses } from '@hooks/useProjectData';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { TRAINER_CLASS_DESCRIPTION_TEXT_ID, TRAINER_CLASS_NAME_TEXT_ID, TRAINER_CLASS_VALIDATOR } from '@modelEntities/trainerClass';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { createTrainerClass } from '@utils/entityCreation';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type TrainerClassNewEditorProps = {
  closeDialog: () => void;
};

const TRAINER_CLASS_NEW_EDITOR_SCHEMA = TRAINER_CLASS_VALIDATOR.pick({ dbSymbol: true });

export const TrainerClassNewEditor = forwardRef<EditorHandlingClose, TrainerClassNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: trainerClasses, setProjectDataValues: setTrainerClass } = useProjectTrainerClasses();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  const initialClass = { dbSymbol: '' as DbSymbol };
  const { getFormData, formRef } = useZodForm(TRAINER_CLASS_NEW_EDITOR_SCHEMA, initialClass);
  const setText = useSetProjectText();

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const result = getFormData();
    if (!dbSymbolRef.current || !name || !descriptionRef.current || !result.success) return;

    const newTrainerClass = createTrainerClass(trainerClasses, dbSymbolRef.current.value as DbSymbol);

    setText(TRAINER_CLASS_NAME_TEXT_ID, newTrainerClass.id, name);
    setText(TRAINER_CLASS_DESCRIPTION_TEXT_ID, newTrainerClass.id, descriptionRef.current.value);

    setTrainerClass({ [newTrainerClass.dbSymbol]: newTrainerClass }, { trainerClass: newTrainerClass.dbSymbol });
    closeDialog();
  };

  const checkDisabled = () => !name;

  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(trainerClasses, value)) {
      if (dbSymbolErrorType !== 'duplicate') setDbSymbolErrorType('duplicate');
    } else if (dbSymbolErrorType) {
      setDbSymbolErrorType(undefined);
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dbSymbolRef.current) return;

    // Update the dbSymbol if it was equal to the default dbSymbol or not set
    if (dbSymbolRef.current.value === '' || dbSymbolRef.current.value === generateDefaultDbSymbol(name)) {
      dbSymbolRef.current.value = generateDefaultDbSymbol(event.currentTarget.value);
      onChangeDbSymbol(dbSymbolRef.current.value);
    }
    setName(event.currentTarget.value);
  };

  return (
    <Editor type="creation" title={t('new_trainer_class')}>
      <InputFormContainer ref={formRef}>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('trainer_class_name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={onChangeName} placeholder={t('example_trainer_class')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_description_trainer_class')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            ref={dbSymbolRef}
            onChange={(e) => onChangeDbSymbol(e.currentTarget.value)}
            error={!!dbSymbolErrorType}
            placeholder={t('example_db_symbol_trainer_class')}
          />
          {dbSymbolErrorType === 'value' && <TextInputError>{t('incorrect_format')}</TextInputError>}
          {dbSymbolErrorType === 'duplicate' && <TextInputError>{t('db_symbol_already_used')}</TextInputError>}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisabled() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('create_trainer_class')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
TrainerClassNewEditor.displayName = 'TrainerClassNewEditor';
