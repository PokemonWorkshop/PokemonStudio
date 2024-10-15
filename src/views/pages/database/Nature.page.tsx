import React from 'react';
import { DataBlockWithAction, DataBlockWrapper } from '../../components/database/dataBlocks';
import { NatureChangingStats, NatureControlBar, NatureFlavors, NatureFrame } from '@components/database/nature';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DeleteButtonWithIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { NatureEditorAndDeletionKeys, NatureEditorOverlay } from '@components/database/nature/editors/NatureEditorOverlay';
import { useNaturePage } from '@hooks/usePage';

export const NaturePage = () => {
  const dialogsRef = useDialogsRef<NatureEditorAndDeletionKeys>();
  const { nature, natureName, cannotDelete } = useNaturePage();
  const { t } = useTranslation('database_natures');

  return (
    <DatabasePageStyle>
      <NatureControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <NatureFrame nature={nature} natureName={natureName} dialogsRef={dialogsRef} />
            <NatureChangingStats nature={nature} dialogsRef={dialogsRef} />
            <NatureFlavors nature={nature} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <NatureEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
