import React, { useMemo, useState } from 'react';

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
import { useProjectZonesGroups } from '@utils/useProjectDoubleData';

export const ZonePage = () => {
  const {
    projectDataValues: zones,
    projectDataValues2: groups,
    selectedDataIdentifier: zoneDbSymbol,
    setSelectedDataIdentifier,
    setProjectDoubleDataValues: setZoneGroup,
    setProjectDataValues: setZone,
    removeProjectDataValue: deleteZone,
  } = useProjectZonesGroups();
  const { t } = useTranslation('database_zones');
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ zone: selected.value });
  const zone = zones[zoneDbSymbol];
  const currentEditedZone = useMemo(() => zone.clone(), [zone]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentEditedGroup, setCurrentEditedGroup] = useState<{ data: GroupModel } | undefined>(undefined);

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && currentEditedZone.name() === '') return;
    if (currentEditor === 'new') return setCurrentEditor(undefined);
    if (currentEditor === 'addGroup' || currentEditor === 'importGroup') return setCurrentEditor(undefined);
    if (currentEditor === 'editGroup' && currentEditedGroup) {
      currentEditedGroup.data.defineRelationCustomCondition();
      setZoneGroup({ [zone.dbSymbol]: currentEditedZone }, { [currentEditedGroup.data.dbSymbol]: currentEditedGroup.data });
      return setCurrentEditor(undefined);
    }
    currentEditedZone.cleaningNaNValues();
    setZone({ [zone.dbSymbol]: currentEditedZone });
    setCurrentEditor(undefined);
  };

  const onAddGroup = (editedGroup: GroupModel) => {
    currentEditedZone.wildGroups.push(editedGroup.dbSymbol);
    editedGroup.defineRelationCustomCondition();
    setZoneGroup({ [zone.dbSymbol]: currentEditedZone }, { [editedGroup.dbSymbol]: editedGroup });
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
    frame: <ZoneFrameEditor zone={currentEditedZone} />,
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
          <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
