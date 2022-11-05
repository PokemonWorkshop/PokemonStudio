import React, { useMemo, useState, useEffect } from 'react';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { EditorOverlay } from '@components/editor';
import { ZoneControlBar, ZoneFrame, ZoneGroups, ZoneSettings, ZoneTravel } from '@components/database/zone';
import {
  ZoneAddGroupEditor,
  ZoneEditGroupEditor,
  ZoneFrameEditor,
  ZoneGroupImportEditor,
  ZoneNewEditor,
  ZoneSettingsEditor,
  ZoneTravelEditor,
} from '@components/database/zone/editors';

import GroupModel from '@modelEntities/group/Group.model';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { useProjectGroups, useProjectZones } from '@utils/useProjectData';
import { useShortcut } from '@utils/useShortcuts';
import { StudioShortcut } from '@src/GlobalStateProvider';

export const ZonePage = () => {
  const {
    projectDataValues: zones,
    selectedDataIdentifier: zoneDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setZone,
    removeProjectDataValue: deleteZone,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectZones();
  const { projectDataValues: groups, setProjectDataValues: setGroup } = useProjectGroups();
  const { t } = useTranslation('database_zones');
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ zone: selected.value });
  const zone = zones[zoneDbSymbol];
  const currentEditedZone = useMemo(() => zone.clone(), [zone]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentEditedGroup, setCurrentEditedGroup] = useState<{ data: GroupModel } | undefined>(undefined);
  const shortcut = useShortcut([StudioShortcut.DB_PREVIOUS, StudioShortcut.DB_NEXT]);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 10 },
      translation_description: { fileId: 64, isMultiline: true },
    },
    currentEditedZone.id,
    currentEditedZone.name()
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && currentEditedZone.name() === '') return;
    if (currentEditor === 'new') return setCurrentEditor(undefined);
    if (currentEditor === 'addGroup' || currentEditor === 'importGroup') return setCurrentEditor(undefined);
    if (currentEditor === 'editGroup' && currentEditedGroup) {
      currentEditedGroup.data.defineRelationCustomCondition();
      setZone({ [zone.dbSymbol]: currentEditedZone });
      setGroup({ [currentEditedGroup.data.dbSymbol]: currentEditedGroup.data });
      return setCurrentEditor(undefined);
    }
    currentEditedZone.cleaningNaNValues();
    setZone({ [zone.dbSymbol]: currentEditedZone });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onAddGroup = (editedGroup: GroupModel) => {
    currentEditedZone.wildGroups.push(editedGroup.dbSymbol);
    editedGroup.defineRelationCustomCondition();
    setZone({ [zone.dbSymbol]: currentEditedZone });
    setGroup({ [editedGroup.dbSymbol]: editedGroup });
    setCurrentEditor(undefined);
  };

  const onEditGroup = (index: number) => {
    setCurrentGroupIndex(index);
    setCurrentEditedGroup({ data: groups[zone.wildGroups[index]].clone() });
    setCurrentEditor('editGroup');
  };

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(zones)
      .map(([value, zoneData]) => ({ value, index: zoneData.id }))
      .filter((d) => d.value !== zoneDbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    deleteZone(zoneDbSymbol, { zone: firstDbSymbol });
    setCurrentDeletion(undefined);
  };

  const onClickDeleteGroups = () => {
    currentEditedZone.wildGroups = [];
    setZone({ [zone.dbSymbol]: currentEditedZone });
    setCurrentDeletion(undefined);
  };

  const editors = {
    new: <ZoneNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <ZoneFrameEditor zone={currentEditedZone} openTranslationEditor={openTranslationEditor} />,
    settings: <ZoneSettingsEditor zone={currentEditedZone} />,
    travel: <ZoneTravelEditor zone={currentEditedZone} />,
    addGroup: <ZoneAddGroupEditor zone={currentEditedZone} groups={groups} onAddGroup={onAddGroup} onClose={() => setCurrentEditor(undefined)} />,
    editGroup: <ZoneEditGroupEditor zone={currentEditedZone} groups={groups} group={currentEditedGroup} index={currentGroupIndex} />,
    importGroup: <ZoneGroupImportEditor zone={currentEditedZone} onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    zone: (
      <Deletion
        title={t('deletion_of_zone')}
        message={t('deletion_message', { zone: zone.name() })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
    groups: (
      <Deletion
        title={t('deletion_of_groups')}
        message={t('deletion_groups_message', { zone: zone.name() })}
        onClickDelete={onClickDeleteGroups}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  useEffect(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return;

    if (shortcut === StudioShortcut.DB_PREVIOUS) {
      setSelectedDataIdentifier({ zone: getPreviousDbSymbol('id') });
    }
    if (shortcut === StudioShortcut.DB_NEXT) {
      setSelectedDataIdentifier({ zone: getNextDbSymbol('id') });
    }
  }, [shortcut, getPreviousDbSymbol, getNextDbSymbol, currentEditor, currentDeletion]);

  return (
    <DatabasePageStyle>
      <ZoneControlBar onChange={onChange} zone={zone} onClickNewZone={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <ZoneFrame zone={zone} onClick={() => setCurrentEditor('frame')} />
            <ZoneSettings zone={zone} onClick={() => setCurrentEditor('settings')} />
            <ZoneTravel zone={zone} onClick={() => setCurrentEditor('travel')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <ZoneGroups
              zone={zone}
              groups={groups}
              onDelete={() => setCurrentDeletion('groups')}
              onImport={() => setCurrentEditor('importGroup')}
              onNew={() => setCurrentEditor('addGroup')}
              onEdit={onEditGroup}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('zone')} disabled={Object.entries(zones).length === 1}>
                {t('delete_this_zone')}
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
