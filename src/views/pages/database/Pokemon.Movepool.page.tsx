import React, { useMemo, useState } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PokemonControlBar } from '@components/database/pokemon/PokemonControlBar';
import { useTranslation } from 'react-i18next';
import { PageContainerStyle, PageMovepoolContainerStyle } from './PageContainerStyle';
import { MovepoolDeletion, MovepoolImport, MovepoolLevelLearnableTable } from '@components/database/pokemon/movepool';
import { EditorOverlay } from '@components/editor';
import { DeletionOverlay } from '@components/deletion';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { DataBlockMovePoolEditor } from '@components/editor/DataBlockMovePoolEditor';
import { useProjectPokemon } from '@src/hooks/useProjectData';
import { getMoveKlass, MovepoolTable } from '@components/database/pokemon/movepool/MovepoolTable';
import { TitleContainer } from '@components/editor/DataBlockEditorStyle';

export type MovepoolType = 'level' | 'tutor' | 'tech' | 'breed' | 'evolution';

const MOVEPOOL_TABS: { type: MovepoolType; labelKey: string; path: string }[] = [
  { type: 'level', labelKey: 'level', path: '/database/pokemon/movepool' },
  { type: 'tutor', labelKey: 'tutoring', path: '/database/pokemon/movepool/tutor' },
  { type: 'tech', labelKey: 'tech', path: '/database/pokemon/movepool/tech' },
  { type: 'breed', labelKey: 'breeding', path: '/database/pokemon/movepool/breed' },
  { type: 'evolution', labelKey: 'evolution', path: '/database/pokemon/movepool/evolution' },
];

export const PokemonMovepoolPage = () => {
  const { t } = useTranslation();

  const { projectDataValues: pokemon, selectedDataIdentifier: currentPokemon } = useProjectPokemon();

  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);

  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const onCloseEditor = () => {
    setCurrentEditor(undefined);
  };

  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const onCloseDeletion = () => {
    setCurrentDeletion(undefined);
  };

  const currentMovepoolType = MOVEPOOL_TABS[currentTabIndex].type;

  const editors = useMemo(
    () => ({
      level: <MovepoolImport type="level" onClose={onCloseEditor} />,
      tutor: <MovepoolImport type="tutor" onClose={onCloseEditor} />,
      tech: <MovepoolImport type="tech" onClose={onCloseEditor} />,
      breed: <MovepoolImport type="breed" onClose={onCloseEditor} />,
      evolution: <MovepoolImport type="evolution" onClose={onCloseEditor} />,
    }),
    [],
  );

  const deletions = useMemo(
    () => ({
      level: <MovepoolDeletion type="level" onClose={onCloseDeletion} />,
      tutor: <MovepoolDeletion type="tutor" onClose={onCloseDeletion} />,
      tech: <MovepoolDeletion type="tech" onClose={onCloseDeletion} />,
      breed: <MovepoolDeletion type="breed" onClose={onCloseDeletion} />,
      evolution: <MovepoolDeletion type="evolution" onClose={onCloseDeletion} />,
    }),
    [],
  );

  const isDeleteDisabled = (type: MovepoolType) => {
    const form = pokemon[currentPokemon.specie].forms.find((form) => form.form === currentPokemon.form) || pokemon[currentPokemon.specie].forms[0];

    if (type === 'level') {
      return form.moveSet.filter((m) => m.klass === 'LevelLearnableMove').length <= 1;
    }

    const klass = getMoveKlass(type);
    return form.moveSet.filter((m) => m.klass === klass).length === 0;
  };

  return (
    <DatabasePageStyle>
      <PokemonControlBar />
      <PageContainerStyle>
        <PageMovepoolContainerStyle>
          <DataBlockWrapper>
            <DatabaseTabsBar
              currentTabIndex={1}
              tabs={[
                { label: t('creature'), path: '/database/pokemon' },
                { label: t('movepool'), path: '/database/pokemon/movepool' },
                { label: t('resources'), path: '/database/pokemon/resources' },
              ]}
            />
          </DataBlockWrapper>
          <DataBlockMovePoolEditor title={t(`${currentMovepoolType}_learnable_moves`)} size="full">
            <DatabaseTabsBar
              autoWidth={true}
              currentTabIndex={currentTabIndex}
              onClick={setCurrentTabIndex}
              tabs={MOVEPOOL_TABS.map((tab) => ({
                label: t(tab.labelKey),
                path: tab.path,
              }))}
            />
            <TitleContainer style={{ paddingLeft: '4px' }}>
              <h3>{t(`${currentMovepoolType}_learnable_moves`)}</h3>
            </TitleContainer>
            {currentMovepoolType === 'level' && (
              <MovepoolLevelLearnableTable importation={{ label: t('movepool_import'), onClick: () => setCurrentEditor(currentMovepoolType) }} />
            )}
            {currentMovepoolType !== 'level' && (
              <MovepoolTable
                movepoolType={currentMovepoolType}
                onClickDelete={() => setCurrentDeletion(currentMovepoolType)}
                importation={{ label: t('movepool_import'), onClick: () => setCurrentEditor(currentMovepoolType) }}
                disabledDeletion={isDeleteDisabled(currentMovepoolType)}
              />
            )}
          </DataBlockMovePoolEditor>
          <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={onCloseDeletion} />
        </PageMovepoolContainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
