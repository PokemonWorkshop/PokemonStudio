import React, { useEffect, useMemo, useState } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { PokemonWithForm } from '@components/database/pokemon/PokemonDataPropsInterface';
import { useProjectPokemon } from '@utils/useProjectData';
import { useTranslation } from 'react-i18next';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { BattlersResources, CharactersResources, IconsResources, ResourceWrapper, CryResource } from '@components/database/pokemon/resources';
import { basename, CreatureFormResourcesFemalePath, CreatureFormResourcesPath } from '@utils/path';
import { cloneEntity } from '@utils/cloneEntity';

export const PokemonResourcesPage = () => {
  const { projectDataValues: pokemon, selectedDataIdentifier: pokemonIdentifier, setProjectDataValues: setPokemon } = useProjectPokemon();
  const { t } = useTranslation('database_pokemon');
  const currentPokemonWithForm: PokemonWithForm = useMemo(
    () => ({
      species: pokemon[pokemonIdentifier.specie],
      form:
        pokemon[pokemonIdentifier.specie].forms.find((form) => form.form === pokemonIdentifier.form) || pokemon[pokemonIdentifier.specie].forms[0],
    }),
    [pokemon, pokemonIdentifier.form, pokemonIdentifier.specie]
  );
  const [isShowFemale, setIsShowFemale] = useState<boolean>(currentPokemonWithForm.form.resources.hasFemale);
  const currentEditedPokemon = useMemo(() => cloneEntity(pokemon[pokemonIdentifier.specie]), [pokemonIdentifier.specie, pokemon]);
  const currentEditedPokemonWithForm: PokemonWithForm = {
    species: currentEditedPokemon,
    form: currentEditedPokemon.forms.find((form) => form.form === pokemonIdentifier.form) || currentEditedPokemon.forms[0],
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

  useEffect(() => {
    setIsShowFemale(currentPokemonWithForm.form.resources.hasFemale);
  }, [currentPokemonWithForm]);

  return (
    <DatabasePageStyle>
      <PokemonControlBar />
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
          <ResourceWrapper>
            <CryResource
              form={currentPokemonWithForm.form}
              resource="cry"
              isFemale={false}
              onResourceChoosen={onResourceChoosen}
              onResourceClean={onResourceClean}
            />
          </ResourceWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
