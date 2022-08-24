import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
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
import TypeModel from '@modelEntities/type/Type.model';
import { TypeCategoryPreview } from '@components/categories';
import { useHistory } from 'react-router-dom';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type TypeNewEditorProps = {
  from: 'type' | 'typeTable';
  onClose: () => void;
};

export const TypeNewEditor = ({ from, onClose }: TypeNewEditorProps) => {
  const { projectDataValues: types, setProjectDataValues: setType, bindProjectDataValue: bindType } = useProjectTypes();
  const { t } = useTranslation(['database_types', 'database_moves']);
  const refreshUI = useRefreshUI();
  const [newType] = useState(bindType(TypeModel.createType(types)));
  const [typeText, setTypeText] = useState('');
  const history = useHistory();

  const onClickNew = () => {
    newType.setName(typeText);
    setType({ [newType.dbSymbol]: newType }, { type: newType.dbSymbol });
    if (from === 'type') history.push(`/database/types/${newType.dbSymbol}`);
    else history.push(`/database/types/table`);
    onClose();
  };

  const onChangeName = (name: string) => {
    if (newType.dbSymbol === '' || newType.dbSymbol === generateDefaultDbSymbol(typeText)) {
      newType.dbSymbol = generateDefaultDbSymbol(name);
    }
    setTypeText(name);
  };

  const checkDisabled = () => {
    return typeText.length === 0 || newType.dbSymbol.length === 0 || wrongDbSymbol(newType.dbSymbol) || checkDbSymbolExist(types, newType.dbSymbol);
  };

  return (
    <Editor type="creation" title={t('database_types:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={typeText}
            onChange={(event) => refreshUI(onChangeName(event.target.value))}
            placeholder={t('database_types:example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithColorLabelContainer>
          <Label htmlFor="color">{t('database_types:color')}</Label>
          <Input
            type="color"
            name="color"
            value={newType.color === undefined ? '#C3B5B2' : newType.color}
            onChange={(event) => refreshUI((newType.color = event.target.value))}
            placeholder={t('database_types:example_name')}
          />
        </InputWithColorLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="preview">{t('database_types:preview')}</Label>
          <TypeCategoryPreview type={newType.color === undefined ? '#C3B5B2' : newType.color}>
            {typeText === '' ? '???' : typeText}
          </TypeCategoryPreview>
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('database_moves:symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            value={newType.dbSymbol}
            onChange={(event) => refreshUI((newType.dbSymbol = event.target.value))}
            error={wrongDbSymbol(newType.dbSymbol) || checkDbSymbolExist(types, newType.dbSymbol)}
            placeholder={t('database_types:example_db_symbol')}
          />
          {newType.dbSymbol.length !== 0 && wrongDbSymbol(newType.dbSymbol) && (
            <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>
          )}
          {newType.dbSymbol.length !== 0 && checkDbSymbolExist(types, newType.dbSymbol) && (
            <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>
          )}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('database_types:create_type')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
