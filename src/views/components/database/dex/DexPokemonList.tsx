import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DexModel from '@modelEntities/dex/Dex.model';
import { DataBlockEditor } from '@components/editor';
import { DexPokemonListTable } from './table';
import { ProjectData } from '@src/GlobalStateProvider';

const checkAddUnavailable = (dex: DexModel, allPokemon: ProjectData['pokemon']): boolean => {
  const sortPokemonDbSymbol = Object.entries(allPokemon)
    .map(([dbSymbol]) => dbSymbol)
    .sort((a, b) => a.localeCompare(b));
  const sortDexCreatures = dex.clone().creatures.sort((a, b) => a.dbSymbol.localeCompare(b.dbSymbol));

  sortDexCreatures.forEach((creature) => {
    const index = sortPokemonDbSymbol.findIndex((dbSymbol) => dbSymbol === creature.dbSymbol);
    sortPokemonDbSymbol.splice(index, 1);
  });
  return sortPokemonDbSymbol.length === 0;
};

type DexPokemonListProps = {
  dex: DexModel;
  allDex: ProjectData['dex'];
  allPokemon: ProjectData['pokemon'];
  onDelete: () => void;
  onImport: () => void;
  onNew: () => void;
  onEdit: (index: number) => void;
  onAddEvolution: (index: number) => void;
};

export const DexPokemonList = ({ dex, allDex, allPokemon, onDelete, onImport, onNew, onEdit, onAddEvolution }: DexPokemonListProps) => {
  const isAddUnavailable = useMemo(() => checkAddUnavailable(dex, allPokemon), [dex, allPokemon]);
  const { t } = useTranslation('database_dex');
  return (
    <DataBlockEditor
      size="full"
      color="light"
      title={t('dex_pokemon_list_title')}
      onClickDelete={onDelete}
      importation={{ label: t('import_a_pokemon_list'), onClick: onImport }}
      add={{ label: t('add_a_pokemon'), onClick: onNew }}
      disabledDeletion={dex.creatures.length === 0}
      disabledImport={Object.entries(allDex).length <= 1}
      disabledAdd={isAddUnavailable}
    >
      <DexPokemonListTable dex={dex} onEdit={onEdit} onAddEvolution={onAddEvolution} />
    </DataBlockEditor>
  );
};
