import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWithActionTooltip, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
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
import { ProjectData } from '@src/GlobalStateProvider';
import DexModel, { DexCreature } from '@modelEntities/dex/Dex.model';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import PokemonForm from '@modelEntities/pokemon/PokemonForm';

const isResetAvailable = (dex: DexModel, pokemon: ProjectData['pokemon']): boolean => {
  if (dex.dbSymbol !== 'national') return false;

  const sortPokemonDbSymbol = Object.entries(pokemon)
    .map(([dbSymbol]) => dbSymbol)
    .sort((a, b) => a.localeCompare(b));
  const sortDexCreatures = dex.clone().creatures.sort((a, b) => a.dbSymbol.localeCompare(b.dbSymbol));
  if (sortPokemonDbSymbol.length !== sortDexCreatures.length) return true;

  return !sortDexCreatures.some((dexCreature, index) => dexCreature.dbSymbol === sortPokemonDbSymbol[index]);
};

const searchEvolutionPokemon = (creature: DexCreature, allPokemon: ProjectData['pokemon'], currentCreatures: DexCreature[]): DexCreature[] => {
  const pokemonForm = allPokemon[creature.dbSymbol]?.forms.find((form) => form.form === creature.form);
  if (!pokemonForm || pokemonForm.evolutions.length === 0) return [];

  const creatures = pokemonForm.evolutions
    .filter(
      (evolution) => evolution.dbSymbol && currentCreatures.find((currentCreature) => currentCreature.dbSymbol === evolution.dbSymbol) === undefined
    )
    .map((evolution) => ({ dbSymbol: evolution.dbSymbol as string, form: evolution.form }));
  currentCreatures.push(...creatures);
  creatures.forEach((c) => creatures.push(...searchEvolutionPokemon(c, allPokemon, currentCreatures)));
  return creatures;
};

const searchUnderAndEvolutions = (pokemonForm: PokemonForm, creature: DexCreature, allPokemon: ProjectData['pokemon']): DexCreature[] => {
  const babyCreature = { dbSymbol: pokemonForm.babyDbSymbol, form: pokemonForm.babyForm };
  const evolutionCreatures = searchEvolutionPokemon(creature, allPokemon, [creature]);
  const creatures =
    babyCreature.dbSymbol === '__undef__' || babyCreature.dbSymbol === creature.dbSymbol
      ? []
      : searchEvolutionPokemon(babyCreature, allPokemon, Object.assign([], evolutionCreatures));
  creatures.push(...evolutionCreatures);
  if (!creatures.find((c) => c.dbSymbol === creature.dbSymbol)) creatures.push(creature);
  creatures.unshift(babyCreature.dbSymbol === '__undef__' ? creature : babyCreature);
  return creatures;
};

export const DexPage = () => {
  const { projectDataValues: allDex, selectedDataIdentifier: dexDbSymbol, setSelectedDataIdentifier, setProjectDataValues: setDex } = useProjectDex();
  const { projectDataValues: allPokemon } = useProjectPokemon();
  const { t } = useTranslation('database_dex');
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ dex: selected.value });
  const dex = allDex[dexDbSymbol];
  const currentEditedDex = useMemo(() => dex.clone(), [dex]);

  const [creatureIndex, setCreatureIndex] = useState<number>(0);
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
    if (currentEditor === 'new' || currentEditor === 'addPokemon' || currentEditor === 'importPokemonList') return setCurrentEditor(undefined);

    currentEditedDex.cleaningNaNValues();
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
    creatures.forEach((c, i) => currentEditedDex.creatures.splice(index + i + 1, 0, c));
    if (creatures.length !== 0) currentEditedDex.creatures.splice(index, 1);
    currentEditedDex.creatures = currentEditedDex.creatures.filter((dexc, i, self) => self.findIndex((c) => c.dbSymbol === dexc.dbSymbol) === i);
    setDex({ [dex.dbSymbol]: currentEditedDex });
  };

  const editors = {
    new: <DexNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <DexFrameEditor dex={currentEditedDex} openTranslationEditor={openTranslationEditor} />,
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
