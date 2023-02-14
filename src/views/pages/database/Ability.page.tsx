import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon, DarkButton } from '@components/buttons';
import { AbilityControlBar, AbilityFrame, AbilityParametersData } from '@components/database/ability';
import { AbilityFrameEditor, AbilityNewEditor } from '@components/database/ability/editors';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';

import { useProjectAbilities } from '@utils/useProjectData';
import { useNavigate } from 'react-router-dom';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useEditorHandlingCloseRef } from '@components/editor/useHandleCloseEditor';
import { cloneEntity } from '@utils/cloneEntity';

export const AbilityPage = () => {
  const {
    projectDataValues: abilities,
    selectedDataIdentifier: abilityDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setAbilities,
    removeProjectDataValue: deleteAbility,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectAbilities();
  const { t } = useTranslation('database_abilities');
  const navigate = useNavigate();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  const onClickedPokemonList = () => navigate(`/database/abilities/pokemon`);
  const onChange: SelectChangeEvent = (selected) => setSelectedDataIdentifier({ ability: selected.value });
  const ability = abilities[abilityDbSymbol];
  const abilityName = getAbilityName(ability);
  const frameEditorRef = useEditorHandlingCloseRef();
  const currentEditedAbility = useMemo(() => cloneEntity(ability), [ability]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ ability: getPreviousDbSymbol('name') }),
      db_next: () => setSelectedDataIdentifier({ ability: getNextDbSymbol('name') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [currentEditor, currentDeletion, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);

  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 4 },
      translation_description: { fileId: 5, isMultiline: true },
    },
    currentEditedAbility.textId,
    getAbilityName(currentEditedAbility)
  );

  const onCloseEditor = () => {
    if (currentEditor === 'new') return setCurrentEditor(undefined);
    if (currentEditor === 'frame') {
      if (!frameEditorRef.current?.canClose()) return;
      frameEditorRef.current?.onClose();
    }
    setAbilities({ [ability.dbSymbol]: currentEditedAbility });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(abilities)
      .map(([value, abilityData]) => ({ value, index: getAbilityName(abilityData) }))
      .filter((d) => d.value !== abilityDbSymbol)
      .sort((a, b) => a.index.localeCompare(b.index))[0].value;
    deleteAbility(abilityDbSymbol, { ability: firstDbSymbol });
    setCurrentDeletion(undefined);
  };

  const editors = {
    frame: <AbilityFrameEditor ability={ability} openTranslationEditor={openTranslationEditor} ref={frameEditorRef} />,
    new: <AbilityNewEditor onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    deletion: (
      <Deletion
        title={t('deletion_of', { ability: abilityName })}
        message={t('deletion_message', { ability: abilityName })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  return (
    <DatabasePageStyle>
      <AbilityControlBar onChange={onChange} ability={ability} onClickNewAbility={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <AbilityFrame ability={ability} onClick={() => setCurrentEditor('frame')} />
            {/* <AbilityParametersData ability={ability} onClick={() => setCurrentEditor('params')} /> */}
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={`${t('pokemon_with_ability')} ${abilityName}`}>
              <DarkButton onClick={onClickedPokemonList}>{t('button_list_pokemon')}</DarkButton>
            </DataBlockWithAction>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('deletion')} disabled={Object.entries(abilities).length == 1}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} subEditor={translationEditor} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
