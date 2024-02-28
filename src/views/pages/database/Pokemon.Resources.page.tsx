import React from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { useTranslation } from 'react-i18next';
import { PageDataConstrainerStyle, PageResourceContainerStyle } from './PageContainerStyle';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { BattlersResources, CharactersResources, IconsResources, CryResource } from '@components/database/pokemon/resources';
import { useCreaturePage } from '@utils/usePage';

export const PokemonResourcesPage = () => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form, canShowFemale } = useCreaturePage();

  return (
    <DatabasePageStyle>
      <PokemonControlBar />
      <PageResourceContainerStyle>
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
          <BattlersResources creature={creature} form={form} canShowFemale={canShowFemale} />
          <IconsResources creature={creature} form={form} canShowFemale={canShowFemale} />
          <CharactersResources creature={creature} form={form} canShowFemale={canShowFemale} />
          <CryResource creature={creature} form={form} />
        </PageDataConstrainerStyle>
      </PageResourceContainerStyle>
    </DatabasePageStyle>
  );
};
