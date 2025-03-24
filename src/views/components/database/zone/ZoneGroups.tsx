import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockEditor } from '@components/editor';
import { ProjectData } from '@src/GlobalStateProvider';
import { ZoneGroupsTable } from './table';
import { StudioZone } from '@modelEntities/zone';
import { ZoneDialogsRef } from './editors/ZoneEditorOverlay';

type ZoneGroupsProps = {
  zone: StudioZone;
  groups: ProjectData['groups'];
  dialogsRef: ZoneDialogsRef;
  setCurrentGroupIndex: (index: number) => void;
};

export const ZoneGroups = ({ zone, groups, dialogsRef, setCurrentGroupIndex }: ZoneGroupsProps) => {
  const { t } = useTranslation('database_zones');
  const groupLength = useMemo(() => Object.keys(groups).length, [groups]);

  const onEdit = (index: number) => {
    setCurrentGroupIndex(index);
    dialogsRef.current?.openDialog('editGroup');
  };

  return (
    <DataBlockEditor
      size="full"
      title={t('groups_of_zone')}
      onClickDelete={() => dialogsRef.current?.openDialog('deleteGroupsZone', true)}
      importation={{ label: t('import_groups'), onClick: () => dialogsRef.current?.openDialog('importGroup') }}
      add={{ label: t('add_group'), onClick: () => dialogsRef.current?.openDialog('addGroup') }}
      disabledDeletion={zone.wildGroups.length === 0}
      disabledImport={groupLength <= 1}
      disabledAdd={groupLength <= zone.wildGroups.length}
    >
      <ZoneGroupsTable zone={zone} groups={groups} onEdit={onEdit} />
    </DataBlockEditor>
  );
};
