import React, { forwardRef, useRef, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import { useProjectDex } from '@hooks/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { SelectDex } from '@components/selects';
import { cloneEntity } from '@utils/cloneEntity';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useDexPage } from '@hooks/usePage';
import { useUpdateDex } from './useUpdateDex';
import type { StudioDexCreature } from '@modelEntities/dex';

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

const addNewCreaturesInList = (creatures: StudioDexCreature[], newCreatures: StudioDexCreature[]): StudioDexCreature[] => {
  return newCreatures.reduce((newCreaturesList, newCreature) => {
    if (newCreaturesList.findIndex((creature) => creature.dbSymbol === newCreature.dbSymbol) === -1) {
      return [...newCreaturesList, newCreature];
    }
    return newCreaturesList;
  }, cloneEntity(creatures));
};

type DexPokemonListImportEditorProps = {
  closeDialog: () => void;
};

export const DexPokemonListImportEditor = forwardRef<EditorHandlingClose, DexPokemonListImportEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: allDex, selectedDataIdentifier: currentDex } = useProjectDex();
  const { t } = useTranslation('database_dex');
  const { dex } = useDexPage();
  const updateDex = useUpdateDex(dex);
  const firstDbSymbol = Object.entries(allDex)
    .map(([value, dexData]) => ({ value, index: dexData.id }))
    .filter((d) => d.value !== dex.dbSymbol)
    .sort((a, b) => a.index - b.index)[0].value;
  const [selectedDexImport, setSelectedDexImport] = useState<string>(firstDbSymbol);
  const overrideRef = useRef<HTMLInputElement>(null);

  useEditorHandlingClose(ref);

  const onClickImport = () => {
    const newCreatures = cloneEntity(allDex[selectedDexImport].creatures);
    if (overrideRef.current?.checked) {
      updateDex({ creatures: newCreatures });
    } else {
      updateDex({ creatures: addNewCreaturesInList(dex.creatures, newCreatures) });
    }
    closeDialog();
  };

  return (
    <Editor type="importation" title={t('dex')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <DexImportInfo>{t('import_info')}</DexImportInfo>
          <InputWithTopLabelContainer>
            <Label>{t('import_list_dex')}</Label>
            <SelectDex
              dbSymbol={selectedDexImport}
              onChange={(selected) => setSelectedDexImport(selected)}
              filter={(dbSymbol) => dbSymbol !== currentDex}
              noLabel
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="override">{t('replace_creatures')}</Label>
            <Toggle name="override" ref={overrideRef} />
          </InputWithLeftLabelContainer>
        </InputContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('import_the_list')}</PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
DexPokemonListImportEditor.displayName = 'DexPokemonListImportEditor';
