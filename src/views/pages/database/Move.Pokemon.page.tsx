import React, { useMemo } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithTitleCollapse, DataBlockWrapper } from '@components/database/dataBlocks';
import { MoveControlBar } from '@components/database/move/MoveControlBar';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { MovePokemonLevelLearnableTable } from '@components/database/move/moveTable/MovePokemonLevelLearnableTable';
import { MovePokemonTutorLearnableTable } from '@components/database/move/moveTable/MovePokemonTutorLearnableTable';
import { MovePokemonTechLearnableTable } from '@components/database/move/moveTable/MovePokemonTechLearnableTable';
import { MovePokemonBreedLearnableTable } from '@components/database/move/moveTable/MovePokemonBreedLearnableTable';
import { MovePokemonEvolutionLearnableTable } from '@components/database/move/moveTable/MovePokemonEvolutionLearnableTable';
import { useProjectMoves } from '@utils/useProjectData';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGetEntityNameText } from '@utils/ReadingProjectText';

export const MovePokemonPage = () => {
  const navigate = useNavigate();
  const {
    projectDataValues: moves,
    selectedDataIdentifier: moveDbSymbol,
    setSelectedDataIdentifier,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectMoves();
  const getMoveName = useGetEntityNameText();
  const { t } = useTranslation(['database_moves']);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    return {
      db_previous: () => setSelectedDataIdentifier({ move: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ move: getNextDbSymbol('id') }),
    };
  }, [setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);
  const currentMove = moves[moveDbSymbol];

  const onChange: SelectChangeEvent = (selected) => {
    setSelectedDataIdentifier({ move: selected.value });
  };
  const onClickedBack = () => navigate('/database/moves');

  return (
    <DatabasePageStyle>
      <MoveControlBar onMoveChange={onChange} move={currentMove} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('database_moves:pokemon_with_move', { move: getMoveName(currentMove) })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleCollapse title={t('database_moves:level_learnable_move', { move: getMoveName(currentMove) })} size="full">
              <MovePokemonLevelLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:tutor_learnable_move', { move: getMoveName(currentMove) })} size="full">
              <MovePokemonTutorLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:tech_learnable_move', { move: getMoveName(currentMove) })} size="full">
              <MovePokemonTechLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:breed_learnable_move', { move: getMoveName(currentMove) })} size="full">
              <MovePokemonBreedLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
            <DataBlockWithTitleCollapse title={t('database_moves:evolution_learnable_move', { move: getMoveName(currentMove) })} size="full">
              <MovePokemonEvolutionLearnableTable move={currentMove} />
            </DataBlockWithTitleCollapse>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
