import React from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithTitleCollapse, DataBlockWrapper } from '@components/database/dataBlocks';
import { MoveControlBar } from '@components/database/move/MoveControlBar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { MovePokemonLevelLearnableTable } from '@components/database/move/moveTable/MovePokemonLevelLearnableTable';
import { MovePokemonTutorLearnableTable } from '@components/database/move/moveTable/MovePokemonTutorLearnableTable';
import { MovePokemonTechLearnableTable } from '@components/database/move/moveTable/MovePokemonTechLearnableTable';
import { MovePokemonBreedLearnableTable } from '@components/database/move/moveTable/MovePokemonBreedLearnableTable';
import { MovePokemonEvolutionLearnableTable } from '@components/database/move/moveTable/MovePokemonEvolutionLearnableTable';
import { useMovePage } from '@utils/usePage';

export const MovePokemonPage = () => {
  const { move, moveName } = useMovePage();
  const { t } = useTranslation('database_moves');
  const navigate = useNavigate();
  const onClickedBack = () => navigate('/database/moves');

  return (
    <DatabasePageStyle>
      <MoveControlBar />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('pokemon_with_move', { move: moveName })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleCollapse title={t('level_learnable_move', { move: moveName })} size="full">
              <MovePokemonLevelLearnableTable move={move} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('tutor_learnable_move', { move: moveName })} size="full">
              <MovePokemonTutorLearnableTable move={move} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('tech_learnable_move', { move: moveName })} size="full">
              <MovePokemonTechLearnableTable move={move} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('breed_learnable_move', { move: moveName })} size="full">
              <MovePokemonBreedLearnableTable move={move} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('evolution_learnable_move', { move: moveName })} size="full">
              <MovePokemonEvolutionLearnableTable move={move} />
            </DataBlockWithTitleCollapse>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
