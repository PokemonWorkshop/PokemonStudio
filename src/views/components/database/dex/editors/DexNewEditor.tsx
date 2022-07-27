import React, { useState } from 'react';
import styled from 'styled-components';
import { EditorWithCollapse, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import DexModel from '@modelEntities/dex/Dex.model';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { useProjectDex } from '@utils/useProjectData';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { checkDbSymbolExist, wrongDbSymbol } from '@utils/dbSymbolCheck';
import { TextInputError } from '@components/inputs/Input';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { SelectDex } from '@components/selects';

const DexImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

type DexNewEditorProps = {
  onClose: () => void;
};

export const DexNewEditor = ({ onClose }: DexNewEditorProps) => {
  const { projectDataValues: allDex, setProjectDataValues: setDex, bindProjectDataValue: bindDex } = useProjectDex();
  const { t } = useTranslation(['database_dex', 'database_moves']);
  const refreshUI = useRefreshUI();
  const [newDex] = useState(bindDex(DexModel.createDex(allDex)));
  const [dexName, setDexName] = useState<string>('');
  const [selectedDexImport, setSelectedDexImport] = useState<string>('__undef__');

  const onClickNew = () => {
    newDex.setName(dexName);
    if (selectedDexImport !== '__undef__') newDex.creatures = allDex[selectedDexImport].clone().creatures;
    setDex({ [newDex.dbSymbol]: newDex }, { dex: newDex.dbSymbol });
    onClose();
  };

  return (
    <EditorWithCollapse type="dex" title={t('database_dex:new')}>
      <InputContainer size="l">
        <PaddedInputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('database_dex:dex_name')}
            </Label>
            <Input
              type="text"
              name="name"
              value={dexName}
              onChange={(event) => setDexName(event.target.value)}
              placeholder={t('database_dex:example_name')}
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="first-number">{t('database_dex:first_number')}</Label>
            <Input
              type="number"
              name="first-number"
              min="0"
              max="999"
              value={isNaN(newDex.startId) ? '' : newDex.startId}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 999) return event.preventDefault();
                refreshUI((newDex.startId = newValue));
              }}
              onBlur={() => refreshUI((newDex.startId = cleanNaNValue(newDex.startId)))}
            />
          </InputWithLeftLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="db-symbol" required>
              {t('database_moves:symbol')}
            </Label>
            <Input
              type="text"
              name="db-symbol"
              value={newDex.dbSymbol}
              onChange={(event) => refreshUI((newDex.dbSymbol = event.target.value))}
              error={wrongDbSymbol(newDex.dbSymbol) || checkDbSymbolExist(allDex, newDex.dbSymbol)}
              placeholder={t('database_dex:example_db_symbol')}
            />
            {newDex.dbSymbol.length !== 0 && wrongDbSymbol(newDex.dbSymbol) && (
              <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>
            )}
            {newDex.dbSymbol.length !== 0 && checkDbSymbolExist(allDex, newDex.dbSymbol) && (
              <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>
            )}
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
        <InputGroupCollapse title={t('database_dex:other_data')} noMargin collapseByDefault>
          <PaddedInputContainer size="s">
            <DexImportInfo>{t('database_dex:import_info')}</DexImportInfo>
            <InputWithTopLabelContainer>
              <Label>{t('database_dex:import_list_dex')}</Label>
              <SelectDex dbSymbol={selectedDexImport} onChange={(selected) => setSelectedDexImport(selected.value)} noLabel noneValue />
            </InputWithTopLabelContainer>
          </PaddedInputContainer>
        </InputGroupCollapse>
        <ButtonContainer>
          <ToolTipContainer>
            {dexName.length === 0 && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={dexName.length === 0}>
              {t('database_dex:create_dex')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_dex:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
};
