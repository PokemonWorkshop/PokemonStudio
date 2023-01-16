import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { EditorOverlay } from '@components/editor';
import { DeletionOverlay } from '@components/deletion';

import { useProjectGroups, useProjectPokemon } from '@utils/useProjectData';
import { PokemonBattlerList } from '@components/pokemonBattlerList';
import { GroupControlBar, GroupFrame } from '@components/database/group';
import { GroupFrameEditor, GroupNewEditor } from '@components/database/group/editors';
import { GroupDeletion } from '@components/database/group/GroupDeletion';
import { GroupBattlerImportEditor } from '@components/database/group/editors/GroupBattlerImportEditor';
import { PokemonBattlerListEditor } from '@components/pokemonBattlerList/editors';
import { CurrentBattlerType } from '@components/pokemonBattlerList/PokemonBattlerList';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { defineRelationCustomCondition } from '@utils/GroupUtils';
import { cleanExpandPokemonSetup, cleanNaNValue } from '@utils/cleanNaNValue';
import { cloneEntity } from '@utils/cloneEntity';

export const GroupPage = () => {
  const {
    projectDataValues: groups,
    selectedDataIdentifier: groupDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setGroup,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectGroups();
  const { projectDataValues: species } = useProjectPokemon();
  const { t } = useTranslation('database_groups');
  const getGroupName = useGetEntityNameText();
  const [state] = useGlobalState();
  const onChange: SelectChangeEvent = (selected) => setSelectedDataIdentifier({ group: selected.value });
  const group = groups[groupDbSymbol];
  const currentEditedGroup = useMemo(() => cloneEntity(group), [group]);

  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ group: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ group: getNextDbSymbol('id') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [currentEditor, currentDeletion, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);
  const [currentBattler, setCurrentBattler] = useState<CurrentBattlerType>({
    index: undefined,
    kind: undefined,
  });
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 61 },
    },
    currentEditedGroup.id,
    getGroupName(currentEditedGroup)
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && getGroupName(currentEditedGroup) === '') return;
    if (currentEditor === 'frame') defineRelationCustomCondition(currentEditedGroup);
    if (
      currentEditor === 'editBattler' &&
      currentBattler.index !== undefined &&
      currentEditedGroup.encounters[currentBattler.index].specie === '__undef__'
    )
      return;
    if (currentEditor === 'editBattler' && currentBattler.index !== undefined)
      cleanExpandPokemonSetup(currentEditedGroup.encounters[currentBattler.index], species, true, state);
    if (currentEditor === 'newBattler' || currentEditor === 'new') return setCurrentEditor(undefined);

    currentEditedGroup.customConditions
      .filter((condition) => condition.type === 'enabledSwitch')
      .forEach((condition) => (condition.value = cleanNaNValue(condition.value)));
    setGroup({ [group.dbSymbol]: cloneEntity(currentEditedGroup) });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onCloseDeletion = () => {
    setCurrentDeletion(undefined);
  };

  const onDeleteBattler = (index: number) => {
    setCurrentBattler({ ...currentBattler, index: index });
    setCurrentDeletion('battler');
  };

  const editors = {
    new: <GroupNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <GroupFrameEditor group={currentEditedGroup} openTranslationEditor={openTranslationEditor} />,
    importBattler: <GroupBattlerImportEditor group={currentEditedGroup} onClose={() => setCurrentEditor(undefined)} />,
    editBattler: <PokemonBattlerListEditor type="edit" model={currentEditedGroup} currentBattler={currentBattler} />,
    newBattler: <PokemonBattlerListEditor type="creation" model={currentEditedGroup} onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    group: <GroupDeletion type="group" onClose={onCloseDeletion} />,
    battler: <GroupDeletion type="battler" battlerIndex={currentBattler.index} onClose={onCloseDeletion} />,
  };

  return (
    <DatabasePageStyle>
      <GroupControlBar onChange={onChange} group={group} onClickNewGroup={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <GroupFrame group={group} onClick={() => setCurrentEditor('frame')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <PokemonBattlerList
              title={t('pokemon_group')}
              onClickAdd={() => setCurrentEditor('newBattler')}
              onClickImport={() => setCurrentEditor('importBattler')}
              onClickDelete={onDeleteBattler}
              onEditPokemonProperty={(index, kind) => {
                setCurrentBattler({ index: index, kind: kind });
                setCurrentEditor('editBattler');
              }}
              pokemonBattlers={group.encounters}
              disabledImport={Object.keys(groups).length <= 1}
              isWild={true}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('group')} disabled={Object.entries(groups).length === 1}>
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
