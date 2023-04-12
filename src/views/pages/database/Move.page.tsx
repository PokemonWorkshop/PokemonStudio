import React from 'react';
import { DataBlockWithAction, DataBlockWrapper } from '../../components/database/dataBlocks';
import { MoveCharacteristics, MoveControlBar, MoveData, MoveFrame, MoveParameters, MoveStatistics, MoveStatus } from '@components/database/move';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DarkButton, DeleteButtonWithIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { useNavigate } from 'react-router-dom';
import { useDialogsRef } from '@utils/useDialogsRef';
import { MoveEditorAndDeletionKeys, MoveEditorOverlay } from '@components/database/move/editors/MoveEditorOverlay';
import { useMovePage } from '@utils/usePage';

export const MovePage = () => {
  const dialogsRef = useDialogsRef<MoveEditorAndDeletionKeys>();
  const { move, moveName, cannotDelete } = useMovePage();
  const { t } = useTranslation('database_moves');
  const navigate = useNavigate();
  const onClickedPokemonList = () => navigate(`/database/moves/pokemon`);

  return (
    <DatabasePageStyle>
      <MoveControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <MoveFrame move={move} dialogsRef={dialogsRef} />
            <MoveData move={move} dialogsRef={dialogsRef} />
            <MoveParameters move={move} dialogsRef={dialogsRef} />
            <MoveCharacteristics move={move} dialogsRef={dialogsRef} />
            <MoveStatus move={move} dialogsRef={dialogsRef} />
            <MoveStatistics move={move} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('pokemon_with_move', { move: moveName })}>
              <DarkButton onClick={onClickedPokemonList}>{t('button_list_pokemon')}</DarkButton>
            </DataBlockWithAction>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <MoveEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
