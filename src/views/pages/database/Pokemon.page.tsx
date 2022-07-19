import React, { useMemo, useState } from 'react';
import { SecondaryButton, DeleteButtonWithIcon } from '@components/buttons';
import { DataBlockWrapper, DataBlockWithAction } from '@components/database/dataBlocks';
import { StatisticsDataBlock } from '@components/database/pokemon/pokemonDataBlock/StatisticsDataBlock';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { EvolutionDataBlock } from '@components/database/pokemon/pokemonDataBlock/EvolutionDataBlock';
import { ExperienceDataBlock } from '@components/database/pokemon/pokemonDataBlock/ExperienceDataBlock';
import { PokedexDataBlock } from '@components/database/pokemon/pokemonDataBlock/PokedexDataBlock';
import { ReproductionDataBlock } from '@components/database/pokemon/pokemonDataBlock/ReproductionDataBlock';
import { TalentsDataBlock } from '@components/database/pokemon/pokemonDataBlock/TalentsDataBlock';
import { PokemonFrame } from '@components/database/pokemon/PokemonFrame';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { PokemonWithForm } from '@components/database/pokemon/PokemonDataPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { useProjectPokemonDex } from '@utils/useProjectDoubleData';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BreedingEditor,
  EncounterEditor,
  ExperienceEditor,
  InformationsEditor,
  PokedexEditor,
  StatsEditor,
  TalentsEditor,
  PokemonNewEditor,
  PokemonFormNewEditor,
} from '@components/database/pokemon/editors';
import { EditorOverlay } from '@components/editor';
import { EncounterDataBlock } from '@components/database/pokemon/pokemonDataBlock/EncounterDataBlock';
import { EvolutionEditor } from '@components/database/pokemon/editors/EvolutionEditor';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { wrongDbSymbol } from '@utils/dbSymbolCheck';

export const PokemonPage = () => {
  const [evolutionIndex, setEvolutionIndex] = useState(0);
  const { t } = useTranslation(['database_pokemon']);
  const history = useHistory();
  const onClickedMovepool = () => history.push(`/database/pokemon/movepool`);
  const {
    projectDataValues: pokemons,
    projectDataValues2: dex,
    selectedDataIdentifier: currentPokemon,
    setSelectedDataIdentifier,
    setProjectDoubleDataValues: setPokemonDex,
    setProjectDataValues: setPokemon,
    removeProjectDataValue: deletePokemon,
  } = useProjectPokemonDex();
  const onPokemonChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ pokemon: { specie: selected.value, form: 0 } });
    setEvolutionIndex(0);
  };
  const onFormChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({
      pokemon: {
        specie: currentPokemon.specie,
        form: pokemons[currentPokemon.specie].forms.findIndex((f) => f.form === Number(selected.value)),
      },
    });
    setEvolutionIndex(0);
  };

  const currentPokemonModel = pokemons[currentPokemon.specie];
  const currentEditedPokemon = useMemo(() => currentPokemonModel.clone(), [currentPokemonModel]);
  const currentEditedDex = useMemo(() => dex.regional.clone(), [dex]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);

  const onCloseEditor = () => {
    if (
      currentEditor === 'informationsEditor' &&
      (currentEditedPokemon.name() === '' || currentEditedPokemon.dbSymbol === '' || wrongDbSymbol(currentEditedPokemon.dbSymbol))
    )
      return;
    if (currentEditor === 'newPokemonEditor' || currentEditor === 'newPokemonFormEditor') return setCurrentEditor(undefined);
    currentEditedPokemon.forms[currentPokemon.form].changeDefaultValueItemHeld('none');
    currentEditedPokemon.forms[currentPokemon.form].cleaningNaNValues();
    setPokemonDex({ [currentPokemonModel.dbSymbol]: currentEditedPokemon }, { [currentEditedDex.dbSymbol]: currentEditedDex });
    setCurrentEditor(undefined);
  };

  const onAddEvolution = () => {
    const currentForm = currentEditedPokemon.forms[currentPokemon.form];
    if (currentForm.evolutions[evolutionIndex]) {
      currentForm.evolutions = currentForm.evolutions.concat({ ...currentForm.evolutions[evolutionIndex] });
    } else {
      currentForm.evolutions = currentForm.evolutions.concat({ form: 0, dbSymbol: currentEditedPokemon.dbSymbol, conditions: [] });
    }
    setPokemon({ [currentPokemonModel.dbSymbol]: currentEditedPokemon });
    setEvolutionIndex(currentForm.evolutions.length - 1);
  };

  const onClickDeletePokemon = () => {
    const firstDbSymbol = Object.entries(pokemons)
      .map(([value, pokemonData]) => ({ value, index: pokemonData.id }))
      .filter((d) => d.value !== currentPokemon.specie)
      .sort((a, b) => a.index - b.index)[0].value;
    deletePokemon(currentPokemon.specie, { pokemon: { specie: firstDbSymbol, form: 0 } });
    setCurrentDeletion(undefined);
  };

  const onClickDeleteForm = () => {
    currentEditedPokemon.forms.splice(currentPokemon.form, 1);
    setPokemon({ [currentPokemonModel.dbSymbol]: currentEditedPokemon }, { pokemon: { specie: currentPokemon.specie, form: 0 } });
    setCurrentDeletion(undefined);
  };

  const editors = {
    informationsEditor: <InformationsEditor currentPokemon={currentEditedPokemon} currentFormIndex={currentPokemon.form} dex={currentEditedDex} />,
    pokedexEditor: <PokedexEditor currentPokemon={currentEditedPokemon} currentFormIndex={currentPokemon.form} />,
    experienceEditor: <ExperienceEditor currentPokemon={currentEditedPokemon} currentFormIndex={currentPokemon.form} />,
    talentsEditor: <TalentsEditor currentPokemon={currentEditedPokemon} currentFormIndex={currentPokemon.form} />,
    breedingEditor: <BreedingEditor currentPokemon={currentEditedPokemon} currentFormIndex={currentPokemon.form} />,
    statsEditor: <StatsEditor currentPokemon={currentEditedPokemon} currentFormIndex={currentPokemon.form} />,
    encounterEditor: <EncounterEditor currentPokemon={currentEditedPokemon} currentFormIndex={currentPokemon.form} />,
    evolutionEditor: (
      <EvolutionEditor
        currentPokemon={currentEditedPokemon}
        currentFormIndex={currentPokemon.form}
        evolutionIndex={evolutionIndex}
        setEvolutionIndex={setEvolutionIndex}
        onAddEvolution={onAddEvolution}
      />
    ),
    newPokemonEditor: <PokemonNewEditor onClose={() => setCurrentEditor(undefined)} />,
    newPokemonFormEditor: <PokemonFormNewEditor currentPokemon={currentEditedPokemon} onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    pokemonDeletion: (
      <Deletion
        title={t('database_pokemon:deletion_of_pokemon', { pokemon: currentPokemonModel.name() })}
        message={t('database_pokemon:deletion_message_pokemon', { pokemon: currentPokemonModel.name() })}
        onClickDelete={onClickDeletePokemon}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
    formDeletion: (
      <Deletion
        title={t('database_pokemon:deletion_of_form', { form: currentPokemonModel.forms[currentPokemon.form].form })}
        message={t('database_pokemon:deletion_message_form', { form: currentPokemonModel.forms[currentPokemon.form].form })}
        onClickDelete={onClickDeleteForm}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  const pokemonWithForm: PokemonWithForm = {
    species: pokemons[currentPokemon.specie],
    form: pokemons[currentPokemon.specie].forms[currentPokemon.form],
  };

  return (
    <DatabasePageStyle>
      <PokemonControlBar
        currentPokemonWithForm={pokemonWithForm}
        onPokemonChange={onPokemonChange}
        onFormChange={onFormChange}
        onClickNewPokemon={() => setCurrentEditor('newPokemonEditor')}
        onClickNewForm={() => setCurrentEditor('newPokemonFormEditor')}
      />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <PokemonFrame pokemonWithForm={pokemonWithForm} onClick={() => setCurrentEditor('informationsEditor')} />
            <PokedexDataBlock pokemonWithForm={pokemonWithForm} onClick={() => setCurrentEditor('pokedexEditor')} />
            <EvolutionDataBlock
              pokemonWithForm={pokemonWithForm}
              evolutionIndex={evolutionIndex}
              setEvolutionIndex={setEvolutionIndex}
              onClick={() => setCurrentEditor('evolutionEditor')}
            />
            <TalentsDataBlock pokemonWithForm={pokemonWithForm} onClick={() => setCurrentEditor('talentsEditor')} />
            <ExperienceDataBlock pokemonWithForm={pokemonWithForm} onClick={() => setCurrentEditor('experienceEditor')} />
            <ReproductionDataBlock pokemonWithForm={pokemonWithForm} onClick={() => setCurrentEditor('breedingEditor')} />
            <EncounterDataBlock pokemonWithForm={pokemonWithForm} onClick={() => setCurrentEditor('encounterEditor')} />
            <StatisticsDataBlock pokemonWithForm={pokemonWithForm} onClick={() => setCurrentEditor('statsEditor')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('database_pokemon:movepool')}>
              <SecondaryButton onClick={onClickedMovepool}>{t('database_pokemon:movepool_button')}</SecondaryButton>
            </DataBlockWithAction>
            <DataBlockWithAction size="full" title={t('database_pokemon:deleting')}>
              {currentPokemonModel.forms[currentPokemon.form].form === 0 && (
                <DeleteButtonWithIcon onClick={() => setCurrentDeletion('pokemonDeletion')}>{t('database_pokemon:delete')}</DeleteButtonWithIcon>
              )}
              {currentPokemonModel.forms[currentPokemon.form].form !== 0 && (
                <DeleteButtonWithIcon onClick={() => setCurrentDeletion('formDeletion')}>{t('database_pokemon:delete_form')}</DeleteButtonWithIcon>
              )}
            </DataBlockWithAction>
          </DataBlockWrapper>
          <EditorOverlay editors={editors} currentEditor={currentEditor} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
