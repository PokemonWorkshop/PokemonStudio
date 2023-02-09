import React, { useMemo, useState } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { PokemonWithForm } from '@components/database/pokemon/PokemonDataPropsInterface';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useProjectPokemon } from '@utils/useProjectData';
import { useTranslation } from 'react-i18next';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { BattlersResources, CharactersResources, IconsResources, ResourceWrapper } from '@components/database/pokemon/resources';
import { basename, CreatureFormResourcesFemalePath, CreatureFormResourcesPath } from '@utils/path';
import { cloneEntity } from '@utils/cloneEntity';

export const PokemonResourcesPage = () => {
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: pokemonIdentifier,
    setSelectedDataIdentifier,
    setProjectDataValues: setPokemon,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectPokemon();
  const { t } = useTranslation('database_pokemon');
  const currentPokemonWithForm: PokemonWithForm = {
    species: pokemon[pokemonIdentifier.specie],
    form: pokemon[pokemonIdentifier.specie].forms[pokemonIdentifier.form],
  };
  const [isShowFemale, setIsShowFemale] = useState<boolean>(currentPokemonWithForm.form.resources.hasFemale);
  const currentEditedPokemon = useMemo(() => cloneEntity(pokemon[pokemonIdentifier.specie]), [pokemonIdentifier.specie, pokemon]);
  const currentEditedPokemonWithForm: PokemonWithForm = {
    species: currentEditedPokemon,
    form: currentEditedPokemon.forms[pokemonIdentifier.form],
  };

  const onChangeSpecie: SelectChangeEvent = (selected) => {
    setIsShowFemale(pokemon[selected.value].forms[0].resources.hasFemale);
    setSelectedDataIdentifier({ pokemon: { specie: selected.value, form: 0 } });
  };
  const onChangeForm: SelectChangeEvent = (selected) => {
    const indexForm = pokemon[pokemonIdentifier.specie].forms.findIndex((f) => f.form === Number(selected.value));
    setIsShowFemale(pokemon[pokemonIdentifier.specie].forms[indexForm].resources.hasFemale);
    setSelectedDataIdentifier({
      pokemon: {
        specie: pokemonIdentifier.specie,
        form: indexForm,
      },
    });
  };

  const onResourceChoosen = (filePath: string, resource: CreatureFormResourcesPath) => {
    currentEditedPokemonWithForm.form.resources[resource] = basename(filePath, '.png').replace(/\.gif$/, '');
    setPokemon({ [currentEditedPokemon.dbSymbol]: currentEditedPokemon });
  };

  const onResourceClean = (resource: CreatureFormResourcesPath, isFemale: boolean) => {
    if (isFemale) currentEditedPokemonWithForm.form.resources[resource as CreatureFormResourcesFemalePath] = undefined;
    else currentEditedPokemonWithForm.form.resources[resource] = '';
    setPokemon({ [currentEditedPokemon.dbSymbol]: currentEditedPokemon });
  };

  const onShowFemale = (female: boolean) => {
    setIsShowFemale(female);
    currentEditedPokemonWithForm.form.resources.hasFemale = female;
    setPokemon({ [currentEditedPokemon.dbSymbol]: currentEditedPokemon });
  };

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    return {
      db_previous: () => {
        const dbSymbol = getPreviousDbSymbol('id');
        setIsShowFemale(pokemon[dbSymbol].forms[0].resources.hasFemale);
        setSelectedDataIdentifier({ pokemon: { specie: dbSymbol, form: 0 } });
      },
      db_next: () => {
        const dbSymbol = getNextDbSymbol('id');
        setIsShowFemale(pokemon[dbSymbol].forms[0].resources.hasFemale);
        setSelectedDataIdentifier({ pokemon: { specie: dbSymbol, form: 0 } });
      },
    };
  }, [getPreviousDbSymbol, pokemon, setSelectedDataIdentifier, getNextDbSymbol]);
  useShortcut(shortcutMap);

  return (
    <DatabasePageStyle>
      <PokemonControlBar onPokemonChange={onChangeSpecie} onFormChange={onChangeForm} currentPokemonWithForm={currentPokemonWithForm} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={2}
              tabs={[
                { label: t('pokemon'), path: '/database/pokemon' },
                { label: t('movepool'), path: '/database/pokemon/movepool' },
                { label: t('resources'), path: '/database/pokemon/resources' },
              ]}
            />
          </DataBlockWrapper>
          <ResourceWrapper>
            <BattlersResources
              form={currentPokemonWithForm.form}
              isShowFemale={isShowFemale}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
              onShowFemale={onShowFemale}
            />
          </ResourceWrapper>
          <ResourceWrapper>
            <IconsResources
              form={currentPokemonWithForm.form}
              isShowFemale={isShowFemale}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </ResourceWrapper>
          <ResourceWrapper>
            <CharactersResources
              form={currentPokemonWithForm.form}
              isShowFemale={isShowFemale}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </ResourceWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
