import React, { useEffect, useMemo, useState } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { PokemonWithForm } from '@components/database/pokemon/PokemonDataPropsInterface';
import { SubPageTitleWithIcon } from '@components/database/SubPageTitleWithIcon';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useProjectPokemon } from '@utils/useProjectData';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { StudioShortcut, useGlobalState } from '@src/GlobalStateProvider';
import { MovepoolDeletion, MovepoolEditor, MovepoolImport } from '@components/database/pokemon/movepool';
import { EditorOverlay } from '@components/editor';
import { DeletionOverlay } from '@components/deletion';
import { useShortcut } from '@utils/useShortcuts';

export const PokemonMovepoolPage = () => {
  const [state] = useGlobalState();
  const history = useHistory();
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
  const currentEditedPokemon = useMemo(() => pokemon[pokemonIdentifier.specie].clone(), [pokemonIdentifier.specie, pokemon]);
  const currentEditedPokemonWithForm: PokemonWithForm = {
    species: currentEditedPokemon,
    form: currentEditedPokemon.forms[pokemonIdentifier.form],
  };
  const shortcut = useShortcut([StudioShortcut.DB_PREVIOUS, StudioShortcut.DB_NEXT]);
  const onClickedBack = () => history.push('/database/pokemon');

  const onChangeSpecie = (selected: SelectOption) => {
    setSelectedDataIdentifier({ pokemon: { specie: selected.value, form: 0 } });
  };
  const onChangeForm = (selected: SelectOption) => {
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

  useEffect(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return;

    if (shortcut === StudioShortcut.DB_PREVIOUS) {
      const previousDbSymbol = getPreviousDbSymbol(pokemon, currentEditedPokemon.id);
      setSelectedDataIdentifier({ pokemon: { specie: previousDbSymbol, form: 0 } });
    }
    if (shortcut === StudioShortcut.DB_NEXT) {
      const nextDbSymbol = getNextDbSymbol(pokemon, currentEditedPokemon.id);
      setSelectedDataIdentifier({ pokemon: { specie: nextDbSymbol, form: 0 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut]);

  return (
    <DatabasePageStyle>
      <PokemonControlBar onPokemonChange={onChangeSpecie} onFormChange={onChangeForm} currentPokemonWithForm={currentPokemonWithForm} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitleWithIcon
              title={t('database_pokemon:movepool_title', { pokemon: currentPokemonWithForm.species.name() })}
              onClickedBack={onClickedBack}
              icon={
                state.projectPath
                  ? currentPokemonWithForm.species.icon(state, currentPokemonWithForm.form)
                  : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'
              }
            />
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
