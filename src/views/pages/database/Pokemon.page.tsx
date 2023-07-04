import React, { useState } from 'react';
import { DeleteButtonWithIcon } from '@components/buttons';
import { DataBlockWrapper, DataBlockWithAction } from '@components/database/dataBlocks';
import { StatisticsDataBlock } from '@components/database/pokemon/pokemonDataBlock/StatisticsDataBlock';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { EvolutionDataBlock } from '@components/database/pokemon/pokemonDataBlock/EvolutionDataBlock';
import { ExperienceDataBlock } from '@components/database/pokemon/pokemonDataBlock/ExperienceDataBlock';
import { PokedexDataBlock } from '@components/database/pokemon/pokemonDataBlock/PokedexDataBlock';
import { ReproductionDataBlock } from '@components/database/pokemon/pokemonDataBlock/ReproductionDataBlock';
import { AbilitiesDataBlock } from '@components/database/pokemon/pokemonDataBlock/AbilitiesDataBlock';
import { PokemonFrame } from '@components/database/pokemon/PokemonFrame';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { useTranslation } from 'react-i18next';
import { EncounterDataBlock } from '@components/database/pokemon/pokemonDataBlock/EncounterDataBlock';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { useDialogsRef } from '@utils/useDialogsRef';
import { PokemonEditorAndDeletionKeys, PokemonEditorOverlay } from '@components/database/pokemon/editors/PokemonEditorOverlay';
import { useCreaturePage } from '@utils/usePage';

export const PokemonPage = () => {
  const [evolutionIndex, setEvolutionIndex] = useState(0);
  const dialogsRef = useDialogsRef<PokemonEditorAndDeletionKeys>();
  const { creature, form, cannotDelete } = useCreaturePage();
  const pokemonWithForm = { species: creature, form };
  const { t } = useTranslation('database_pokemon');

  return (
    <DatabasePageStyle>
      <PokemonControlBar dialogsRef={dialogsRef} setEvolutionIndex={setEvolutionIndex} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={0}
              tabs={[
                { label: t('pokemon'), path: '/database/pokemon' },
                { label: t('movepool'), path: '/database/pokemon/movepool' },
                { label: t('resources'), path: '/database/pokemon/resources' },
              ]}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <PokemonFrame pokemonWithForm={pokemonWithForm} dialogsRef={dialogsRef} />
            <PokedexDataBlock pokemonWithForm={pokemonWithForm} dialogsRef={dialogsRef} />
            <EvolutionDataBlock
              pokemonWithForm={pokemonWithForm}
              evolutionIndex={evolutionIndex}
              setEvolutionIndex={setEvolutionIndex}
              dialogsRef={dialogsRef}
            />
            <AbilitiesDataBlock pokemonWithForm={pokemonWithForm} dialogsRef={dialogsRef} />
            <ExperienceDataBlock pokemonWithForm={pokemonWithForm} dialogsRef={dialogsRef} />
            <ReproductionDataBlock pokemonWithForm={pokemonWithForm} dialogsRef={dialogsRef} />
            <EncounterDataBlock pokemonWithForm={pokemonWithForm} dialogsRef={dialogsRef} />
            <StatisticsDataBlock pokemonWithForm={pokemonWithForm} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              {form.form === 0 ? (
                <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                  {t('delete')}
                </DeleteButtonWithIcon>
              ) : (
                <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deleteForm', true)}>{t('delete_form')}</DeleteButtonWithIcon>
              )}
            </DataBlockWithAction>
          </DataBlockWrapper>
          <PokemonEditorOverlay ref={dialogsRef} evolutionIndex={evolutionIndex} setEvolutionIndex={setEvolutionIndex} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
