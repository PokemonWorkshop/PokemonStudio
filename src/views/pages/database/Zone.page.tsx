import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { ZoneControlBar, ZoneFrame, ZoneGroups, ZoneSettings, ZoneTravel, ZonePokemon } from '@components/database/zone';
import { ZoneEditorOverlay, ZoneEditorAndDeletionKeys } from '@components/database/zone/editors/ZoneEditorOverlay';

import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useZonePage } from '@src/hooks/usePage';

export const ZonePage = () => {
  const dialogsRef = useDialogsRef<ZoneEditorAndDeletionKeys>();
  const { zone, groups, cannotDelete } = useZonePage();
  const { t } = useTranslation();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

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
            <ZoneGroups zone={zone} groups={groups} dialogsRef={dialogsRef} setCurrentGroupIndex={setCurrentGroupIndex} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <ZonePokemon zone={zone} groups={groups} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deleteZone', true)} disabled={cannotDelete}>
                {t('delete_this_zone')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <ZoneEditorOverlay ref={dialogsRef} currentGroupIndex={currentGroupIndex} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
