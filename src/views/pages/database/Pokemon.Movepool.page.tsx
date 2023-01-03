import React, { useMemo, useState } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { PokemonWithForm } from '@components/database/pokemon/PokemonDataPropsInterface';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useProjectPokemon } from '@utils/useProjectData';
import { useTranslation } from 'react-i18next';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { MovepoolDeletion, MovepoolEditor, MovepoolImport } from '@components/database/pokemon/movepool';
import { EditorOverlay } from '@components/editor';
import { DeletionOverlay } from '@components/deletion';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { cloneEntity } from '@utils/cloneEntity';

export const PokemonMovepoolPage = () => {
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: pokemonIdentifier,
    setSelectedDataIdentifier,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectPokemon();
  const { t } = useTranslation(['database_pokemon']);
  const currentPokemonWithForm: PokemonWithForm = {
    species: pokemon[pokemonIdentifier.specie],
    form: pokemon[pokemonIdentifier.specie].forms[pokemonIdentifier.form],
  };
  const currentEditedPokemon = useMemo(() => cloneEntity(pokemon[pokemonIdentifier.specie]), [pokemonIdentifier.specie, pokemon]);
  const currentEditedPokemonWithForm: PokemonWithForm = {
    species: currentEditedPokemon,
    form: currentEditedPokemon.forms[pokemonIdentifier.form],
  };

  const onChangeSpecie: SelectChangeEvent = (selected) => {
    setSelectedDataIdentifier({ pokemon: { specie: selected.value, form: 0 } });
  };
  const onChangeForm: SelectChangeEvent = (selected) => {
    setSelectedDataIdentifier({
      pokemon: {
        specie: pokemonIdentifier.specie,
        form: pokemon[pokemonIdentifier.specie].forms.findIndex((f) => f.form === Number(selected.value)),
      },
    });
  };

  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const onCloseEditor = () => {
    setCurrentEditor(undefined);
  };

  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const onCloseDeletion = () => {
    setCurrentDeletion(undefined);
  };
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ pokemon: { specie: getPreviousDbSymbol('id'), form: 0 } }),
      db_next: () => setSelectedDataIdentifier({ pokemon: { specie: getNextDbSymbol('id'), form: 0 } }),
    };
  }, [currentEditor, currentDeletion, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);

  const editors = {
    level: <MovepoolImport type="level" pokemonWithForm={currentEditedPokemonWithForm} onClose={onCloseEditor} />,
    tutor: <MovepoolImport type="tutor" pokemonWithForm={currentEditedPokemonWithForm} onClose={onCloseEditor} />,
    tech: <MovepoolImport type="tech" pokemonWithForm={currentEditedPokemonWithForm} onClose={onCloseEditor} />,
    breed: <MovepoolImport type="breed" pokemonWithForm={currentEditedPokemonWithForm} onClose={onCloseEditor} />,
    evolution: <MovepoolImport type="evolution" pokemonWithForm={currentEditedPokemonWithForm} onClose={onCloseEditor} />,
  };

  const deletions = {
    level: <MovepoolDeletion type="level" onClose={onCloseDeletion} />,
    tutor: <MovepoolDeletion type="tutor" onClose={onCloseDeletion} />,
    tech: <MovepoolDeletion type="tech" onClose={onCloseDeletion} />,
    breed: <MovepoolDeletion type="breed" onClose={onCloseDeletion} />,
    evolution: <MovepoolDeletion type="evolution" onClose={onCloseDeletion} />,
  };

  return (
    <DatabasePageStyle>
      <PokemonControlBar onPokemonChange={onChangeSpecie} onFormChange={onChangeForm} currentPokemonWithForm={currentPokemonWithForm} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={1}
              tabs={[
                { label: t('database_pokemon:pokemon'), path: '/database/pokemon' },
                { label: t('database_pokemon:movepool'), path: '/database/pokemon/movepool' },
                { label: t('database_pokemon:resources'), path: '/database/pokemon/resources' },
              ]}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <MovepoolEditor type="level" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="tutor" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="tech" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="breed" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="evolution" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={onCloseDeletion} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
