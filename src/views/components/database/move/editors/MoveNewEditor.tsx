import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { useProjectMoves } from '@utils/useProjectData';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { MOVE_CATEGORIES, MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID, MOVE_VALIDATOR } from '@modelEntities/move';
import { createMove } from '@utils/entityCreation';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { TooltipWrapper } from '@ds/Tooltip';
import { useZodForm } from '@utils/useZodForm';
import { useSelectOptions } from '@utils/useSelectOptions';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@utils/useInputAttrs';

const moveCategoryEntries = (t: TFunction<'database_types'>) =>
  MOVE_CATEGORIES.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type MoveNewEditorProps = {
  closeDialog: () => void;
};

const MOVE_NEW_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({ type: true, category: true });

export const MoveNewEditor = forwardRef<EditorHandlingClose, MoveNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: moves, setProjectDataValues: setMove } = useProjectMoves();
  const { t } = useTranslation('database_moves');
  const { t: tType } = useTranslation('database_types');
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We use a state because synchronizing dbSymbol is easier with a state
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  const categoryOptions = useMemo(() => moveCategoryEntries(tType), [tType]);
  const typeOptions = useSelectOptions('types');
  const move = { type: (typeOptions[0]?.value || '__undef__') as DbSymbol, category: categoryOptions[0].value };
  const { getFormData, defaults, formRef } = useZodForm(MOVE_NEW_EDITOR_SCHEMA, move);
  const { Select } = useInputAttrsWithLabel(MOVE_NEW_EDITOR_SCHEMA, defaults);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const result = getFormData();
    if (!dbSymbolRef.current || !name || !descriptionRef.current || !result.success) return;

    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const { type, category } = result.data;
    const newMove = createMove(moves, dbSymbol, type, category);
    setText(MOVE_NAME_TEXT_ID, newMove.id, name);
    setText(MOVE_DESCRIPTION_TEXT_ID, newMove.id, descriptionRef.current.value);

    setMove({ [dbSymbol]: newMove }, { move: dbSymbol });
    closeDialog();
  };

  /**
   * Handle the error validation of the dbSymbol when the dbSymbol is changed
   */
  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(moves, value)) {
      if (dbSymbolErrorType !== 'duplicate') setDbSymbolErrorType('duplicate');
    } else if (dbSymbolErrorType) {
      setDbSymbolErrorType(undefined);
    }
  };

  /**
   * Handle the change of name (also update dbSymbol if none were specified)
   */
  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dbSymbolRef.current) return;

    // Update the dbSymbol if it was equal to the default dbSymbol or not set
    if (dbSymbolRef.current.value === '' || dbSymbolRef.current.value === generateDefaultDbSymbol(name)) {
      dbSymbolRef.current.value = generateDefaultDbSymbol(event.currentTarget.value);
      onChangeDbSymbol(dbSymbolRef.current.value);
    }
    setName(event.currentTarget.value);
  };

  /**
   * Check if the entity cannot be created because of any validation error
   */
  const isDisabled = !name || !!dbSymbolErrorType;

  return (
    <Editor type="creation" title={t('new')}>
      <InputFormContainer ref={formRef}>
        <InputWithTopLabelContainer>
          <Label required>{t('name')}</Label>
          <Input value={name} onChange={onChangeName} placeholder={t('example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('description')}</Label>
          <MultiLineInput ref={descriptionRef} placeholder={t('example_description')} />
        </InputWithTopLabelContainer>
        <Select name="type" label={t('type')} options={typeOptions} />
        <Select name="category" label={t('category')} options={categoryOptions} />
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
            placeholder={t('example_db_symbol')}
          />
          {dbSymbolErrorType === 'value' && <TextInputError>{t('incorrect_format')}</TextInputError>}
          {dbSymbolErrorType === 'duplicate' && <TextInputError>{t('db_symbol_already_used')}</TextInputError>}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={isDisabled ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={isDisabled}>
              {t('create_move')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
MoveNewEditor.displayName = 'MoveNewEditor';
