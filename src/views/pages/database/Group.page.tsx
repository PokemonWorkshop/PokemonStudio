import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
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
import { cleanExpandPokemonSetup } from '@modelEntities/Encounter';
import { CurrentBattlerType } from '@components/pokemonBattlerList/PokemonBattlerList';

export const GroupPage = () => {
  const {
    projectDataValues: groups,
    selectedDataIdentifier: groupDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setGroup,
  } = useProjectGroups();
  const { projectDataValues: species } = useProjectPokemon();
  const { t } = useTranslation('database_groups');
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ group: selected.value });
  const group = groups[groupDbSymbol];
  const currentEditedGroup = useMemo(() => group.clone(), [group]);

  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentBattler, setCurrentBattler] = useState<CurrentBattlerType>({
    index: undefined,
    kind: undefined,
  });

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && currentEditedGroup.name() === '') return;
    if (currentEditor === 'frame') currentEditedGroup.defineRelationCustomCondition();
    if (
      currentEditor === 'editBattler' &&
      currentBattler.index !== undefined &&
      currentEditedGroup.encounters[currentBattler.index].specie === '__undef__'
    )
      return;
    if (currentEditor === 'editBattler' && currentBattler.index !== undefined)
      cleanExpandPokemonSetup(currentEditedGroup.encounters[currentBattler.index], species, true);
    if (currentEditor === 'newBattler') return setCurrentEditor(undefined);
    setGroup({ [group.dbSymbol]: currentEditedGroup });
    setCurrentEditor(undefined);
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
    frame: <GroupFrameEditor group={currentEditedGroup} />,
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
          <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
