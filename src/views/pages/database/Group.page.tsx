import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { PokemonBattlerList } from '@components/pokemonBattler';
import { GroupControlBar, GroupFrame } from '@components/database/group';
import { useDialogsRef } from '@utils/useDialogsRef';
import { GroupEditorAndDeletionKeys, GroupEditorOverlay } from '@components/database/group/editors/GroupEditorOverlay';
import { useGroupPage } from '@utils/usePage';

export const GroupPage = () => {
  const dialogsRef = useDialogsRef<GroupEditorAndDeletionKeys>();
  const { group, cannotDelete } = useGroupPage();
  const { t } = useTranslation('database_groups');

  return (
    <DatabasePageStyle>
      <GroupControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <GroupFrame group={group} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <PokemonBattlerList title={t('pokemon_group')} encounters={group.encounters} disabledImport={cannotDelete} from="group" />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <GroupEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
