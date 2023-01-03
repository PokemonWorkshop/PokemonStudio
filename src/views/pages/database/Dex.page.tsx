import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWithActionTooltip, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { EditorOverlay } from '@components/editor';
import { DeletionOverlay } from '@components/deletion';

import { useProjectDex, useProjectPokemon } from '@utils/useProjectData';
import { DexControlBar, DexDeletion, DexFrame, DexPokemonList, DexResetNational, DexResetNationalPopUp } from '@components/database/dex';
import {
  DexFrameEditor,
  DexNewEditor,
  DexPokemonListAddEditor,
  DexPokemonListEditEditor,
  DexPokemonListImportEditor,
} from '@components/database/dex/editors';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { isResetAvailable, searchUnderAndEvolutions, isCreaturesAlreadyInDex, isCreatureHasNotEvolution } from '@utils/dex';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { showNotification } from '@utils/showNotification';
import { useGetEntityNameText, useGetEntityNameUsingCSV } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';
import { useEditorHandlingCloseRef } from '@components/editor/useHandleCloseEditor';

export const DexPage = () => {
  const {
    projectDataValues: allDex,
    selectedDataIdentifier: dexDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setDex,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectDex();
  const { projectDataValues: allPokemon } = useProjectPokemon();
  const frameEditorRef = useEditorHandlingCloseRef();
  const getDexName = useGetEntityNameUsingCSV();
  const getCreatureName = useGetEntityNameText();
  const { t } = useTranslation('database_dex');
  const onChange: SelectChangeEvent = (selected) => setSelectedDataIdentifier({ dex: selected.value });
  const dex = allDex[dexDbSymbol];
  const currentEditedDex = useMemo(() => cloneEntity(dex), [dex]);

  const [creatureIndex, setCreatureIndex] = useState<number>(0);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ dex: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ dex: getNextDbSymbol('id') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [currentEditor, currentDeletion, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: currentEditedDex.csv.csvFileId },
    },
    currentEditedDex.csv.csvTextIndex,
    getDexName(currentEditedDex)
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame') {
      if (!frameEditorRef.current?.canClose()) return;
      frameEditorRef.current.onClose();
    }
    if (currentEditor === 'new' || currentEditor === 'addPokemon' || currentEditor === 'importPokemonList') return setCurrentEditor(undefined);

    setDex({ [dex.dbSymbol]: currentEditedDex });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onClickReset = () => {
    currentEditedDex.creatures = Object.entries(allPokemon)
      .map(([dbSymbol, pokemonData]) => ({ dbSymbol, index: pokemonData.id }))
      .sort((a, b) => a.index - b.index)
      .map((data) => ({ dbSymbol: data.dbSymbol, form: 0 }));
    setDex({ [dex.dbSymbol]: currentEditedDex });
    setCurrentDeletion(undefined);
  };

  const onEditPokemonList = (index: number) => {
    setCreatureIndex(index);
    setCurrentEditor('editPokemon');
  };

  const onAddEvolution = (index: number) => {
    const creature = currentEditedDex.creatures[index];
    const pokemonForm = allPokemon[creature.dbSymbol]?.forms.find((form) => form.form === creature.form);
    if (!pokemonForm) return;

    const creatures = searchUnderAndEvolutions(pokemonForm, creature, allPokemon);
    if (isCreatureHasNotEvolution(creatures, creature)) {
      return showNotification('info', t('dex'), t('creature_no_evolution', { name: getCreatureName(allPokemon[creature.dbSymbol]) }));
    } else if (isCreaturesAlreadyInDex(currentEditedDex.creatures, creatures)) {
      return showNotification('info', t('dex'), t('creatures_already_in_dex', { name: getCreatureName(allPokemon[creature.dbSymbol]) }));
    }

    creatures.forEach((c, i) => currentEditedDex.creatures.splice(index + i + 1, 0, c));
    if (creatures.length !== 0) currentEditedDex.creatures.splice(index, 1);
    currentEditedDex.creatures = currentEditedDex.creatures.filter((dexc, i, self) => self.findIndex((c) => c.dbSymbol === dexc.dbSymbol) === i);
    setDex({ [dex.dbSymbol]: currentEditedDex });
  };

  const editors = {
    new: <DexNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <DexFrameEditor dex={currentEditedDex} openTranslationEditor={openTranslationEditor} ref={frameEditorRef} />,
    addPokemon: <DexPokemonListAddEditor dex={currentEditedDex} onClose={() => setCurrentEditor(undefined)} />,
    editPokemon: <DexPokemonListEditEditor dex={currentEditedDex} creature={currentEditedDex.creatures[creatureIndex]} />,
    importPokemonList: <DexPokemonListImportEditor dex={currentEditedDex} onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    dex: <DexDeletion type="dex" onClose={() => setCurrentDeletion(undefined)} />,
    list: <DexDeletion type="list" onClose={() => setCurrentDeletion(undefined)} />,
    reset: <DexResetNationalPopUp onClickReset={onClickReset} onClose={() => setCurrentDeletion(undefined)} />,
  };

  return (
    <DatabasePageStyle>
      <DexControlBar onChange={onChange} dex={dex} onClickNewDex={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DexFrame dex={dex} onClick={() => setCurrentEditor('frame')} />
            {isResetAvailable(dex, allPokemon) && <DexResetNational onClickReset={() => setCurrentDeletion('reset')} />}
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DexPokemonList
              dex={dex}
              allDex={allDex}
              allPokemon={allPokemon}
              onDelete={() => setCurrentDeletion('list')}
              onImport={() => setCurrentEditor('importPokemonList')}
              onNew={() => setCurrentEditor('addPokemon')}
              onEdit={onEditPokemonList}
              onAddEvolution={onAddEvolution}
            />
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
                <DeleteButtonWithIcon onClick={() => setCurrentDeletion('dex')} disabled={Object.entries(allDex).length === 1}>
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
