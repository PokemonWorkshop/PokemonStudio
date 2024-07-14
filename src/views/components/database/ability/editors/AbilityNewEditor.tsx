import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Editor } from '@components/editor';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { useProjectAbilities } from '@hooks/useProjectData';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID } from '@modelEntities/ability';
import { createAbility } from '@utils/entityCreation';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { TooltipWrapper } from '@ds/Tooltip';

type Props = {
  closeDialog: () => void;
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

/**
 * Dialog shown when user wants to create a new entity
 */
export const AbilityNewEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog }, ref) => {
  const { projectDataValues: abilities, setProjectDataValues: setAbility } = useProjectAbilities();
  const { t } = useTranslation('database_abilities');
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We use a state because synchronizing dbSymbol is easier with a state
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  /**
   * Create the new ability based on all provided information and jump to that ability
   */
  const onClickNew = () => {
    if (!dbSymbolRef.current || !name || !descriptionRef.current) return;

    const dbSymbol = dbSymbolRef.current.value;
    const newAbility = createAbility(abilities, dbSymbol as DbSymbol);
    setText(ABILITY_NAME_TEXT_ID, newAbility.textId, name);
    setText(ABILITY_DESCRIPTION_TEXT_ID, newAbility.textId, descriptionRef.current.value);
    setAbility({ [dbSymbol]: newAbility }, { ability: dbSymbol });
    closeDialog();
  };

  /**
   * Handle the error validation of the dbSymbol when the dbSymbol is changed
   */
  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(abilities, value)) {
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
  const checkDisabled = () => !name || !!dbSymbolErrorType;

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={onChangeName} placeholder={t('example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_description')} />
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
            placeholder={t('example_db_symbol')}
          />
          {dbSymbolErrorType == 'value' && <TextInputError>{t('incorrect_format')}</TextInputError>}
          {dbSymbolErrorType == 'duplicate' && <TextInputError>{t('db_symbol_already_used')}</TextInputError>}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisabled() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('create_ability')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
AbilityNewEditor.displayName = 'AbilityNewEditor';
