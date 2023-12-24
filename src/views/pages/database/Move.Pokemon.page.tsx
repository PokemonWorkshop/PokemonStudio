import React from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithTitleCollapse, DataBlockWrapper } from '@components/database/dataBlocks';
import { MoveControlBar } from '@components/database/move/MoveControlBar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/pages';
import { MovePokemonTable, FilterType } from '@components/database/move/moveTable/MovePokemonTable';
import { useMovePage } from '@utils/usePage';

type ParametersTitleType =
  | 'level_learnable_move'
  | 'tutor_learnable_move'
  | 'tech_learnable_move'
  | 'breed_learnable_move'
  | 'evolution_learnable_move';

export const MovePokemonPage = () => {
  const { move, moveName } = useMovePage();
  const { t } = useTranslation('database_moves');
  const navigate = useNavigate();
  const onClickedBack = () => navigate('/database/moves');
  const parameters: Array<{ title: ParametersTitleType; filter: FilterType }> = [
    { title: 'level_learnable_move', filter: 'LevelLearnableMove' },
    { title: 'tutor_learnable_move', filter: 'TutorLearnableMove' },
    { title: 'tech_learnable_move', filter: 'TechLearnableMove' },
    { title: 'breed_learnable_move', filter: 'BreedLearnableMove' },
    { title: 'evolution_learnable_move', filter: 'EvolutionLearnableMove' },
  ];

  return (
    <DatabasePageStyle>
      <MoveControlBar />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('pokemon_with_move', { move: moveName })} onClickedBack={onClickedBack} />
            {parameters.map((params, i) => (
              <DataBlockWithTitleCollapse key={i} title={t(params.title, { move: moveName })} size="full">
                <MovePokemonTable move={move} filter={params.filter} />
              </DataBlockWithTitleCollapse>
            ))}
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
