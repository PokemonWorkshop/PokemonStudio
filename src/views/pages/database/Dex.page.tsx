import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWithActionTooltip, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';

import { useProjectDex, useProjectPokemon } from '@utils/useProjectData';
import { DexControlBar, DexFrame, DexResetNational, DexResetNationalPopUp } from '@components/database/dex';
import { DexFrameEditor, DexNewEditor } from '@components/database/dex/editors';
import { ProjectData } from '@src/GlobalStateProvider';
import DexModel from '@modelEntities/dex/Dex.model';
import { useTranslationEditor } from '@utils/useTranslationEditor';

const isResetAvailable = (dex: DexModel, pokemon: ProjectData['pokemon']): boolean => {
  if (dex.dbSymbol !== 'national') return false;

  const sortPokemonDbSymbol = Object.entries(pokemon)
    .map(([dbSymbol]) => dbSymbol)
    .sort((a, b) => a.localeCompare(b));
  const sortDexCreatures = dex.clone().creatures.sort((a, b) => a.dbSymbol.localeCompare(b.dbSymbol));
  if (sortPokemonDbSymbol.length !== sortDexCreatures.length) return true;

  return !sortDexCreatures.some((dexCreature, index) => dexCreature.dbSymbol === sortPokemonDbSymbol[index]);
};

export const DexPage = () => {
  const {
    projectDataValues: dexs,
    selectedDataIdentifier: dexDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setDex,
    removeProjectDataValue: deleteDex,
  } = useProjectDex();
  const { projectDataValues: pokemon } = useProjectPokemon();
  const { t } = useTranslation('database_dex');
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ dex: selected.value });
  const dex = dexs[dexDbSymbol];
  const currentEditedDex = useMemo(() => dex.clone(), [dex]);

  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: currentEditedDex.csv.csvFileId },
    },
    currentEditedDex.csv.csvTextIndex,
    currentEditedDex.name()
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && currentEditedDex.name() === '') return;
    if (currentEditor === 'new') return setCurrentEditor(undefined);

    currentEditedDex.cleaningNaNValues();
    setDex({ [dex.dbSymbol]: currentEditedDex });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(dexs)
      .map(([value, dexData]) => ({ value, index: dexData.id }))
      .filter((d) => d.value !== dexDbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    deleteDex(dexDbSymbol, { dex: firstDbSymbol });
    setCurrentDeletion(undefined);
  };

  const onClickReset = () => {
    currentEditedDex.creatures = Object.entries(pokemon)
      .map(([dbSymbol, pokemonData]) => ({ dbSymbol, index: pokemonData.id }))
      .sort((a, b) => a.index - b.index)
      .map((data) => ({ dbSymbol: data.dbSymbol, form: 0 }));
    setDex({ [dex.dbSymbol]: currentEditedDex });
    setCurrentDeletion(undefined);
  };

  const editors = {
    new: <DexNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <DexFrameEditor dex={currentEditedDex} openTranslationEditor={openTranslationEditor} />,
  };

  const deletions = {
    dex: (
      <Deletion
        title={t('dex_deletion_of', { dex: dex.name() })}
        message={t('dex_deletion_message', { dex: dex.name() })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
    reset: <DexResetNationalPopUp onClickReset={onClickReset} onClose={() => setCurrentDeletion(undefined)} />,
  };

  return (
    <DatabasePageStyle>
      <DexControlBar onChange={onChange} dex={dex} onClickNewDex={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DexFrame dex={dex} onClick={() => setCurrentEditor('frame')} />
            {isResetAvailable(dex, pokemon) && <DexResetNational onClickReset={() => setCurrentDeletion('reset')} />}
          </DataBlockWrapper>
          <DataBlockWrapper>
            {dex.dbSymbol === 'national' ? (
              <DataBlockWithActionTooltip title={t('deleting')} size="full" disabled={true} tooltipMessage={t('deletion_disabled')}>
                <DeleteButtonWithIcon onClick={() => setCurrentDeletion('deletion')} disabled={true}>
                  {t('delete')}
                </DeleteButtonWithIcon>
              </DataBlockWithActionTooltip>
            ) : (
              <DataBlockWithAction size="full" title={t('deleting')}>
                <DeleteButtonWithIcon onClick={() => setCurrentDeletion('dex')} disabled={Object.entries(dexs).length === 1}>
                  {t('delete')}
                </DeleteButtonWithIcon>
              </DataBlockWithAction>
            )}
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} subEditor={translationEditor} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
