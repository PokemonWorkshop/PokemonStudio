import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { EditorWithCollapse } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useProjectDex } from '@utils/useProjectData';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { TextInputError } from '@components/inputs/Input';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { SelectDex } from '@components/selects';
import { createDex } from '@utils/entityCreation';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { cloneEntity } from '@utils/cloneEntity';
import { useSetProjectText } from '@utils/ReadingProjectText';

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
  const { projectDataValues: allDex, setProjectDataValues: setDex } = useProjectDex();
  const { t } = useTranslation(['database_dex', 'database_moves']);
  const setText = useSetProjectText();
  const [dexName, setDexName] = useState<string>('');
  const startIdRef = useRef<HTMLInputElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  const [startIdErrorType, setStartIdErrorType] = useState<'value' | undefined>(undefined);
  const [selectedDexImport, setSelectedDexImport] = useState<string>('__undef__');

  const onClickNew = () => {
    if (!dbSymbolRef.current || !startIdRef.current) return;

    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const creatures = selectedDexImport !== '__undef__' ? cloneEntity(allDex[selectedDexImport].creatures) : [];
    const newDex = createDex(allDex, dbSymbol, startIdRef.current.valueAsNumber, creatures);
    setText(newDex.csv.csvFileId, newDex.csv.csvTextIndex, dexName);
    setDex({ [dbSymbol]: newDex }, { dex: dbSymbol });
    onClose();
  };

  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(allDex, value)) {
      if (dbSymbolErrorType !== 'duplicate') setDbSymbolErrorType('duplicate');
    } else if (dbSymbolErrorType) {
      setDbSymbolErrorType(undefined);
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dbSymbolRef.current) return;
    if (dbSymbolRef.current.value === '' || dbSymbolRef.current.value === generateDefaultDbSymbol(dexName)) {
      dbSymbolRef.current.value = generateDefaultDbSymbol(event.currentTarget.value);
      onChangeDbSymbol(dbSymbolRef.current.value);
    }
    setDexName(event.currentTarget.value);
  };

  const onChangeStartId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const startId = event.currentTarget.valueAsNumber;
    if (startId < 0 || startId > 999) {
      if (startIdErrorType !== 'value') setStartIdErrorType('value');
    } else if (startIdErrorType) {
      setStartIdErrorType(undefined);
    }
  };

  const checkDisabled = () =>
    !dexName ||
    !!dbSymbolErrorType ||
    !!startIdErrorType ||
    !startIdRef.current ||
    !startIdRef.current.value ||
    !dbSymbolRef.current ||
    !!dbSymbolErrorType;

  return (
    <EditorWithCollapse type="creation" title={t('database_dex:new')}>
      <InputContainer size="l">
        <PaddedInputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('database_dex:dex_name')}
            </Label>
            <Input type="text" name="name" value={dexName} onChange={onChangeName} placeholder={t('database_dex:example_name')} />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="first-number">{t('database_dex:first_number')}</Label>
            <Input
              type="number"
              name="first-number"
              min="0"
              max="999"
              defaultValue="1"
              ref={startIdRef}
              error={!!startIdErrorType}
              onChange={onChangeStartId}
            />
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
              placeholder={t('database_dex:example_db_symbol')}
            />
            {dbSymbolErrorType == 'value' && <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>}
            {dbSymbolErrorType == 'duplicate' && <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>}
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
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('database_dex:create_dex')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_dex:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
};
