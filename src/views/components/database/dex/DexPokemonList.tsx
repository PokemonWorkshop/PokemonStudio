import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockEditor } from '@components/editor';
import { DexPokemonListTable } from './table';
import { ProjectData } from '@src/GlobalStateProvider';
import { StudioDex } from '@modelEntities/dex';
import { DexDialogsRef } from './editors/DexEditorOverlay';

const checkAddUnavailable = (dex: StudioDex, allPokemon: ProjectData['pokemon']): boolean => {
  const sortPokemonDbSymbol = Object.entries(allPokemon)
    .map(([dbSymbol]) => dbSymbol)
    .sort((a, b) => a.localeCompare(b));
  const sortDexCreatures = dex.creatures.slice().sort((a, b) => a.dbSymbol.localeCompare(b.dbSymbol));

  sortDexCreatures.forEach((creature) => {
    const index = sortPokemonDbSymbol.findIndex((dbSymbol) => dbSymbol === creature.dbSymbol);
    sortPokemonDbSymbol.splice(index, 1);
  });
  return sortPokemonDbSymbol.length === 0;
};

type DexPokemonListProps = {
  dex: StudioDex;
  cannotImport: boolean;
  allPokemon: ProjectData['pokemon'];
  dialogsRef: DexDialogsRef;
  setCreatureIndex: (index: number) => void;
};

export const DexPokemonList = ({ dex, cannotImport, allPokemon, dialogsRef, setCreatureIndex }: DexPokemonListProps) => {
  const isAddUnavailable = useMemo(() => checkAddUnavailable(dex, allPokemon), [dex, allPokemon]);
  const { t } = useTranslation('database_dex');
  return (
    <DataBlockEditor
      size="full"
      color="light"
      title={t('dex_pokemon_list_title')}
      onClickDelete={() => dialogsRef?.current?.openDialog('deletion_list', true)}
      importation={{ label: t('import_a_pokemon_list'), onClick: () => dialogsRef?.current?.openDialog('import') }}
      add={{ label: t('add_a_pokemon'), onClick: () => dialogsRef?.current?.openDialog('add_pokemon') }}
      disabledDeletion={dex.creatures.length === 0}
      disabledImport={cannotImport}
      disabledAdd={isAddUnavailable}
    >
      <DexPokemonListTable dex={dex} dialogsRef={dialogsRef} setCreatureIndex={setCreatureIndex} />
    </DataBlockEditor>
  );
};
