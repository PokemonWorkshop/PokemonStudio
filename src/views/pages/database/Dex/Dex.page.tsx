import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from '../PageContainerStyle';

import { DexControlBar, DexFrame, DexPokemonList, DexResetNational } from '@components/database/dex';
import { DexEditorOverlay } from '@components/database/dex/editors';
import { isResetAvailable } from '@utils/dex';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { DexEditorAndDeletionKeys } from '@components/database/dex/editors/DexEditorOverlay';
import { useDexPage } from '@hooks/usePage';
import { TooltipWrapper } from '@ds/Tooltip';

export const DexPage = () => {
  const [creatureIndex, setCreatureIndex] = useState(0);
  const { dex, allPokemon, cannotDelete, cannotImport } = useDexPage();
  const { t } = useTranslation('database_dex');
  const dialogsRef = useDialogsRef<DexEditorAndDeletionKeys>();

  return (
    <DatabasePageStyle>
      <DexControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DexFrame dex={dex} dialogsRef={dialogsRef} />
            {isResetAvailable(dex, allPokemon) && <DexResetNational dialogsRef={dialogsRef} />}
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DexPokemonList
              dex={dex}
              cannotImport={cannotImport}
              allPokemon={allPokemon}
              dialogsRef={dialogsRef}
              setCreatureIndex={setCreatureIndex}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            {dex.dbSymbol === 'national' ? (
              <DataBlockWithAction title={t('deleting')} size="full" disabled={true}>
                <TooltipWrapper data-tooltip={t('deletion_disabled')}>
                  <DeleteButtonWithIcon disabled={true}>{t('delete')}</DeleteButtonWithIcon>
                </TooltipWrapper>
              </DataBlockWithAction>
            ) : (
              <DataBlockWithAction size="full" title={t('deleting')}>
                <DeleteButtonWithIcon onClick={() => dialogsRef?.current?.openDialog('deletion_dex', true)} disabled={cannotDelete}>
                  {t('delete')}
                </DeleteButtonWithIcon>
              </DataBlockWithAction>
            )}
          </DataBlockWrapper>
          <DexEditorOverlay ref={dialogsRef} creatureIndex={creatureIndex} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
