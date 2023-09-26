import React from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { TrainerControlBar } from '@components/database/trainer/TrainerControlBar';

import { useTranslation } from 'react-i18next';
import { PageResourceContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { MusicResources } from '@components/database/trainer/resources/MusicResources';
import { BattlersResources, CharacterResource } from '@components/database/trainer/resources';

export const TrainerResourcesPage = () => {
  const { t } = useTranslation('database_trainers');

  return (
    <DatabasePageStyle>
      <TrainerControlBar />
      <PageResourceContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={1}
              tabs={[
                { label: t('trainer'), path: '/database/trainers' },
                { label: t('resources'), path: '/database/trainers/resources' },
              ]}
            />
          </DataBlockWrapper>
          <BattlersResources />
          <CharacterResource />
          <MusicResources />
        </PageDataConstrainerStyle>
      </PageResourceContainerStyle>
    </DatabasePageStyle>
  );
};
