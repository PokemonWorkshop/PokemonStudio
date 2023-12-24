import React from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { AbilityControlBar, AbilityPokemonTable } from '@components/database/ability';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/pages';
import { useAbilityPage } from '@utils/usePage';

export const AbilityPokemonPage = () => {
  const { ability, abilityName } = useAbilityPage();
  const { t } = useTranslation('database_abilities');
  const navigate = useNavigate();

  const onClickedBack = () => navigate('/database/abilities');

  return (
    <DatabasePageStyle>
      <AbilityControlBar />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('pokemon_with_ability', { ability: abilityName })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('pokemon_with_ability', { ability: abilityName })} size="full">
              <AbilityPokemonTable ability={ability} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
