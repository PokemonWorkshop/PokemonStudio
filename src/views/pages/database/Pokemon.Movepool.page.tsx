import React, { useState } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { useTranslation } from 'react-i18next';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { MovepoolDeletion, MovepoolEditor, MovepoolImport } from '@components/database/pokemon/movepool';
import { EditorOverlay } from '@components/editor';
import { DeletionOverlay } from '@components/deletion';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';

export const PokemonMovepoolPage = () => {
  const { t } = useTranslation(['database_pokemon']);

  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const onCloseEditor = () => {
    setCurrentEditor(undefined);
  };

  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const onCloseDeletion = () => {
    setCurrentDeletion(undefined);
  };

  const editors = {
    level: <MovepoolImport type="level" onClose={onCloseEditor} />,
    tutor: <MovepoolImport type="tutor" onClose={onCloseEditor} />,
    tech: <MovepoolImport type="tech" onClose={onCloseEditor} />,
    breed: <MovepoolImport type="breed" onClose={onCloseEditor} />,
    evolution: <MovepoolImport type="evolution" onClose={onCloseEditor} />,
  };

  const deletions = {
    level: <MovepoolDeletion type="level" onClose={onCloseDeletion} />,
    tutor: <MovepoolDeletion type="tutor" onClose={onCloseDeletion} />,
    tech: <MovepoolDeletion type="tech" onClose={onCloseDeletion} />,
    breed: <MovepoolDeletion type="breed" onClose={onCloseDeletion} />,
    evolution: <MovepoolDeletion type="evolution" onClose={onCloseDeletion} />,
  };

  return (
    <DatabasePageStyle>
      <PokemonControlBar />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={1}
              tabs={[
                { label: t('database_pokemon:pokemon'), path: '/database/pokemon' },
                { label: t('database_pokemon:movepool'), path: '/database/pokemon/movepool' },
                { label: t('database_pokemon:resources'), path: '/database/pokemon/resources' },
              ]}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <MovepoolEditor type="level" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="tutor" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="tech" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="breed" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
            <MovepoolEditor type="evolution" setCurrentEditor={setCurrentEditor} setCurrentDeletion={setCurrentDeletion} />
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={onCloseDeletion} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
