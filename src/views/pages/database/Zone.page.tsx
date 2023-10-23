import React, { useMemo, useState } from 'react';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
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

import { useTranslationEditor } from '@utils/useTranslationEditor';
import { useProjectGroups, useProjectZones } from '@utils/useProjectData';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { defineRelationCustomCondition } from '@utils/GroupUtils';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioGroup } from '@modelEntities/group';
import { cleaningZoneNaNValues } from '@utils/cleanNaNValue';
import { ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';

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
  const getZoneName = useGetEntityNameText();
  const onChange: SelectChangeEvent = (selected) => setSelectedDataIdentifier({ zone: selected.value });
  const zone = zones[zoneDbSymbol];
  const currentEditedZone = useMemo(() => cloneEntity(zone), [zone]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentEditedGroup, setCurrentEditedGroup] = useState<{ data: StudioGroup } | undefined>(undefined);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ zone: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ zone: getNextDbSymbol('id') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [currentEditor, currentDeletion, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: ZONE_NAME_TEXT_ID },
      translation_description: { fileId: ZONE_DESCRIPTION_TEXT_ID, isMultiline: true },
    },
    currentEditedZone.id,
    getZoneName(currentEditedZone)
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && getZoneName(currentEditedZone) === '') return;
    if (currentEditor === 'new') return setCurrentEditor(undefined);
    if (currentEditor === 'addGroup' || currentEditor === 'importGroup') return setCurrentEditor(undefined);
    if (currentEditor === 'editGroup' && currentEditedGroup) {
      currentEditedGroup.data.customConditions = defineRelationCustomCondition(currentEditedGroup.data.customConditions);
      setZone({ [zone.dbSymbol]: currentEditedZone });
      setGroup({ [currentEditedGroup.data.dbSymbol]: currentEditedGroup.data });
      return setCurrentEditor(undefined);
    }
    cleaningZoneNaNValues(currentEditedZone);
    setZone({ [zone.dbSymbol]: currentEditedZone });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onAddGroup = (editedGroup: StudioGroup) => {
    currentEditedZone.wildGroups.push(editedGroup.dbSymbol);
    editedGroup.customConditions = defineRelationCustomCondition(editedGroup.customConditions);
    setZone({ [zone.dbSymbol]: currentEditedZone });
    setGroup({ [editedGroup.dbSymbol]: editedGroup });
    setCurrentEditor(undefined);
  };

  const onEditGroup = (index: number) => {
    setCurrentGroupIndex(index);
    setCurrentEditedGroup({ data: cloneEntity(groups[zone.wildGroups[index]]) });
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
        message={t('deletion_message', { zone: getZoneName(zone) })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
    groups: (
      <Deletion
        title={t('deletion_of_groups')}
        message={t('deletion_groups_message', { zone: getZoneName(zone) })}
        onClickDelete={onClickDeleteGroups}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

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
