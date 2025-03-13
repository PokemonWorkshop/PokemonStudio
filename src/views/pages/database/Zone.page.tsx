import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { ZoneControlBar, ZoneFrame, ZoneGroups, ZoneSettings, ZoneTravel, ZonePokemon } from '@components/database/zone';
import { ZoneEditorOverlay, ZoneEditorAndDeletionKeys } from '@components/database/zone/editors/ZoneEditorOverlay';

import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useProjectGroups, useProjectZones } from '@hooks/useProjectData';

import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';
import { useZonePage } from '@src/hooks/usePage';

export const ZonePage = () => {
  const dialogsRef = useDialogsRef<ZoneEditorAndDeletionKeys>();
  const { zone, groups, cannotDelete } = useZonePage();

  const {
    projectDataValues: zones,
    selectedDataIdentifier: zoneDbSymbol,
    setProjectDataValues: setZone,
    removeProjectDataValue: deleteZone,
  } = useProjectZones();

  const { t } = useTranslation('database_zones');
  const getZoneName = useGetEntityNameText();

  const currentEditedZone = useMemo(() => cloneEntity(zone), [zone]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

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
      <ZoneControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <ZoneFrame zone={zone} dialogsRef={dialogsRef} />
            <ZoneSettings zone={zone} dialogsRef={dialogsRef} />
            <ZoneTravel zone={zone} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <ZoneGroups
              zone={zone}
              groups={groups}
              dialogsRef={dialogsRef}
              setCurrentGroupIndex={setCurrentGroupIndex}
              onDelete={() => setCurrentDeletion('groups')}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <ZonePokemon zone={zone} groups={groups} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('zone')} disabled={cannotDelete}>
                {t('delete_this_zone')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <ZoneEditorOverlay ref={dialogsRef} currentGroupIndex={currentGroupIndex} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
