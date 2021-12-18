import React from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithTitleCollapse, DataBlockWrapper } from '@components/database/dataBlocks';
import { MoveControlBar } from '@components/database/move/MoveControlBar';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { MovePokemonLevelLearnableTable } from '@components/database/move/moveTable/MovePokemonLevelLearnableTable';
import { MovePokemonTutorLearnableTable } from '@components/database/move/moveTable/MovePokemonTutorLearnableTable';
import { MovePokemonTechLearnableTable } from '@components/database/move/moveTable/MovePokemonTechLearnableTable';
import { MovePokemonBreedLearnableTable } from '@components/database/move/moveTable/MovePokemonBreedLearnableTable';
import { MovePokemonEvolutionLearnableTable } from '@components/database/move/moveTable/MovePokemonEvolutionLearnableTable';
import { useProjectData } from '@utils/useProjectData';

export const MovePokemonPage = () => {
  const history = useHistory();
  const { projectDataValues: moves, selectedDataIdentifier: moveDbSymbol, setSelectedDataIdentifier } = useProjectData('moves', 'move');
  const { t } = useTranslation(['database_moves']);
  const currentMove = moves[moveDbSymbol];

  const onChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ move: selected.value });
  };
  const onClickedBack = () => history.push('/database/moves');

  return (
    <DatabasePageStyle>
      <MoveControlBar onMoveChange={onChange} move={currentMove} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('database_moves:pokemon_with_move', { move: currentMove.name() })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleCollapse title={t('database_moves:level_learnable_move', { move: currentMove.name() })} size="full">
              <MovePokemonLevelLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:tutor_learnable_move', { move: currentMove.name() })} size="full">
              <MovePokemonTutorLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:tech_learnable_move', { move: currentMove.name() })} size="full">
              <MovePokemonTechLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:breed_learnable_move', { move: currentMove.name() })} size="full">
              <MovePokemonBreedLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:evolution_learnable_move', { move: currentMove.name() })} size="full">
              <MovePokemonEvolutionLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
