import React from 'react';
import { useTranslation } from 'react-i18next';
import ZoneModel from '@modelEntities/zone/Zone.model';
import { DataBlockEditor } from '@components/editor';
import { ProjectData } from '@src/GlobalStateProvider';
import { ZoneGroupsTable } from './table';

type ZoneGroupsProps = {
  zone: ZoneModel;
  groups: ProjectData['groups'];
  onDelete: () => void;
  onImport: () => void;
  onNew: () => void;
  onEdit: (index: number) => void;
};

export const ZoneGroups = ({ zone, groups, onDelete, onImport, onNew, onEdit }: ZoneGroupsProps) => {
  const { t } = useTranslation('database_zones');
  return (
    <DataBlockEditor
      size="full"
      title={t('groups_of_zone')}
      onClickDelete={onDelete}
      importation={{ label: t('import_groups'), onClick: onImport }}
      add={{ label: t('add_group'), onClick: onNew }}
      disabledDeletion={zone.wildGroups.length === 0}
      disabledImport={Object.entries(groups).length <= 1}
      disabledAdd={Object.entries(groups).length <= zone.wildGroups.length}
    >
      <ZoneGroupsTable zone={zone} groups={groups} onEdit={onEdit} />
    </DataBlockEditor>
  );
};
