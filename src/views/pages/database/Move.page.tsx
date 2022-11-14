import React, { useMemo, useState } from 'react';
import theme from '../../../AppTheme';
import { DataBlockWithAction, DataBlockWrapper } from '../../components/database/dataBlocks';
import { BaseIcon } from '../../components/icons/BaseIcon';
import { MoveFrame } from '../../components/database/move/MoveFrame';
import { MoveControlBar } from '../../components/database/move/MoveControlBar';
import { DataDataBlock } from '../../components/database/move/moveDataBlock/DataDataBlock';
import { ParametersDataBlock } from '../../components/database/move/moveDataBlock/ParametersDataBlock';
import { CharacteristicsDataBlock } from '../../components/database/move/moveDataBlock/CharacteristicsDataBlock';
import { StatusDataBlock } from '../../components/database/move/moveDataBlock/StatusDataBlock';
import { StatisticsDataBlock } from '../../components/database/move/moveDataBlock/StatisticsDataBlock';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DeleteButton, DarkButton } from '@components/buttons';
import { SelectOption } from '../../components/SelectCustom/SelectCustomPropsInterface';
import { useTranslation } from 'react-i18next';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { useHistory } from 'react-router-dom';
import { useProjectData } from '@utils/useProjectData';
import {
  MoveCharacteristicsEditor,
  MoveDataEditor,
  MoveFrameEditor,
  MoveNewEditor,
  MoveParametersEditor,
  MoveStatisticsEditor,
  MoveStatusEditor,
} from '@components/database/move/editors';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { wrongDbSymbol } from '@utils/dbSymbolUtils';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';

export const MovePage = () => {
  const {
    projectDataValues: moves,
    selectedDataIdentifier: moveDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setMoves,
    removeProjectDataValue: deleteMove,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectData('moves', 'move');
  const { t } = useTranslation(['database_moves']);
  const history = useHistory();
  const onClickedPokemonList = () => history.push(`/database/moves/pokemon`);
  const onMoveChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ move: selected.value });
  };
  const currentMove = moves[moveDbSymbol];
  const currentEditedMove = useMemo(() => currentMove.clone(), [currentMove]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ move: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ move: getNextDbSymbol('id') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [getPreviousDbSymbol, getNextDbSymbol, currentEditor, currentDeletion]);
  useShortcut(shortcutMap);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 6 },
      translation_description: { fileId: 7, isMultiline: true },
    },
    currentEditedMove.id,
    currentEditedMove.name()
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && currentEditedMove.name() === '') return;
    if (currentEditor === 'parameters' && (currentEditedMove.battleEngineMethod === '' || wrongDbSymbol(currentEditedMove.battleEngineMethod)))
      return;
    if (currentEditor === 'new') return setCurrentEditor(undefined);
    if (currentEditor === 'status') currentEditedMove.cleanStatus();
    currentEditedMove.cleaningNaNValues();
    setMoves({ [currentMove.dbSymbol]: currentEditedMove });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(moves)
      .map(([value, moveData]) => ({ value, index: moveData.id }))
      .filter((d) => d.value !== moveDbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    deleteMove(moveDbSymbol, { move: firstDbSymbol });
    setCurrentDeletion(undefined);
  };

  const editors = {
    new: <MoveNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <MoveFrameEditor move={currentEditedMove} openTranslationEditor={openTranslationEditor} />,
    data: <MoveDataEditor move={currentEditedMove} />,
    parameters: <MoveParametersEditor move={currentEditedMove} />,
    characteristics: <MoveCharacteristicsEditor move={currentEditedMove} />,
    status: <MoveStatusEditor move={currentEditedMove} />,
    statistics: <MoveStatisticsEditor move={currentEditedMove} />,
  };

  const deletions = {
    deletion: (
      <Deletion
        title={t('database_moves:deletion_of', { move: currentMove.name() })}
        message={t('database_moves:deletion_message', { move: currentMove.name() })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  return (
    <DatabasePageStyle>
      <MoveControlBar onMoveChange={onMoveChange} move={currentMove} onClickNewMove={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <MoveFrame move={currentMove} onClick={() => setCurrentEditor('frame')} />
            <DataDataBlock move={currentMove} onClick={() => setCurrentEditor('data')} />
            <ParametersDataBlock move={currentMove} onClick={() => setCurrentEditor('parameters')} />
            <CharacteristicsDataBlock move={currentMove} onClick={() => setCurrentEditor('characteristics')} />
            <StatusDataBlock move={currentMove} onClick={() => setCurrentEditor('status')} />
            <StatisticsDataBlock move={currentMove} onClick={() => setCurrentEditor('statistics')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={`${t('database_moves:pokemon_with_move')} ${currentMove.name()}`}>
              <DarkButton onClick={onClickedPokemonList}>{t('database_moves:button_list_pokemon')}</DarkButton>
            </DataBlockWithAction>
            <DataBlockWithAction size="full" title={t('database_moves:deleting')}>
              <DeleteButton onClick={() => setCurrentDeletion('deletion')} disabled={Object.entries(moves).length === 1}>
                <BaseIcon icon="delete" size="s" color={theme.colors.dangerBase} />
                <span>{t('database_moves:delete')}</span>
              </DeleteButton>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} subEditor={translationEditor} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
