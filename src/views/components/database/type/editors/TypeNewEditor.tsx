import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import {
  Input,
  InputContainer,
  InputWithColorLabelContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
} from '@components/inputs';
import { useProjectTypes } from '@utils/useProjectData';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { TypeCategoryPreview } from '@components/categories';
import { useNavigate } from 'react-router-dom';
import { findFirstAvailableId, findFirstAvailableTextId } from '@utils/ModelUtils';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { createType } from '@utils/entityCreation';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type TypeNewEditorProps = {
  from: 'type' | 'typeTable';
  closeDialog: () => void;
};
export const TypeNewEditor = forwardRef<EditorHandlingClose, TypeNewEditorProps>(({ from, closeDialog }, ref) => {
  const { projectDataValues: types, setProjectDataValues: setType } = useProjectTypes();
  const { t } = useTranslation(['database_types', 'database_moves']);
  const setText = useSetProjectText();
  const [name, setName] = useState('');
  const [previewColor, setPreviewColor] = useState('#C3B5B2');
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  const colorRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!dbSymbolRef.current || !colorRef.current) return;

    const id = findFirstAvailableId(types, 1);
    const textId = findFirstAvailableTextId(types);
    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const type = createType(dbSymbol, id, textId, colorRef.current.value);
    setText(TYPE_NAME_TEXT_ID, textId, name);
    setType({ [dbSymbol]: type }, { type: dbSymbol });
    if (from === 'type') navigate(`/database/types/${dbSymbol}`);
    else navigate(`/database/types/table`);

    closeDialog();
  };

  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(types, value)) {
      if (dbSymbolErrorType !== 'duplicate') setDbSymbolErrorType('duplicate');
    } else if (dbSymbolErrorType) {
      setDbSymbolErrorType(undefined);
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dbSymbolRef.current) return;
    if (dbSymbolRef.current.value === '' || dbSymbolRef.current.value === generateDefaultDbSymbol(name)) {
      dbSymbolRef.current.value = generateDefaultDbSymbol(event.currentTarget.value);
      onChangeDbSymbol(dbSymbolRef.current.value);
    }
    setName(event.currentTarget.value);
  };

  const onBlurColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewColor(event.currentTarget.value);
  };

  const checkDisabled = () => {
    return !name || !colorRef.current?.value || !!dbSymbolErrorType;
  };

  return (
    <Editor type="creation" title={t('database_types:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={onChangeName} placeholder={t('database_types:example_name')} />
        </InputWithTopLabelContainer>
        <InputWithColorLabelContainer>
          <Label htmlFor="color">{t('database_types:color')}</Label>
          <Input
            type="color"
            name="color"
            defaultValue={previewColor}
            ref={colorRef}
            placeholder={t('database_types:example_name')}
            onBlur={onBlurColor}
          />
        </InputWithColorLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="preview">{t('database_types:preview')}</Label>
          <TypeCategoryPreview type={previewColor}>{name || '???'}</TypeCategoryPreview>
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('database_moves:symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            ref={dbSymbolRef}
            onChange={(e) => onChangeDbSymbol(e.currentTarget.value)}
            error={!!dbSymbolErrorType}
            placeholder={t('database_types:example_db_symbol')}
          />
          {dbSymbolErrorType == 'value' && <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>}
          {dbSymbolErrorType == 'duplicate' && <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('database_types:create_type')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={closeDialog}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
TypeNewEditor.displayName = 'TypeNewEditor';
