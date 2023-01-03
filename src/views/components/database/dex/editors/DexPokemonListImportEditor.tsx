import React, { useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';

import { useProjectDex } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { SelectDex } from '@components/selects';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioDex } from '@modelEntities/dex';

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

type DexPokemonListImportEditorProps = {
  dex: StudioDex;
  onClose: () => void;
};

export const DexPokemonListImportEditor = ({ dex, onClose }: DexPokemonListImportEditorProps) => {
  const { projectDataValues: allDex, setProjectDataValues: setDex } = useProjectDex();
  const { t } = useTranslation('database_dex');
  const firstDbSymbol = Object.entries(allDex)
    .map(([value, dexData]) => ({ value, index: dexData.id }))
    .filter((d) => d.value !== dex.dbSymbol)
    .sort((a, b) => a.index - b.index)[0].value;
  const [selectedDexImport, setSelectedDexImport] = useState<string>(firstDbSymbol);

  const onClickImport = () => {
    dex.creatures = cloneEntity(allDex[selectedDexImport].creatures);
    setDex({ [dex.dbSymbol]: dex });
    onClose();
  };

  return (
    <Editor type="importation" title={t('dex')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <DexImportInfo>{t('import_info')}</DexImportInfo>
          <InputWithTopLabelContainer>
            <Label>{t('import_list_dex')}</Label>
            <SelectDex dbSymbol={selectedDexImport} onChange={(selected) => setSelectedDexImport(selected.value)} noLabel rejected={[dex.dbSymbol]} />
          </InputWithTopLabelContainer>
        </InputContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('import_the_list')}</PrimaryButton>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
