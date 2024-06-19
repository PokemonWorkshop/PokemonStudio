import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';

import { TextFrame, TextList } from '@components/textmanagement';
import { TextDialogsRef } from '@components/textmanagement/editors/TextEditorOverlay';
import { useTextPage } from '@hooks/usePage';

export const TextsPage = () => {
  const dialogsRef: TextDialogsRef = useOutletContext();
  const { textInfo, cannotDelete, disabledTranslation } = useTextPage();
  const { t } = useTranslation('text_management');

  return (
    <DataBlockWrapper>
      <TextFrame textInfo={textInfo} dialogsRef={dialogsRef} />
      <TextList dialogsRef={dialogsRef} disabledTranslation={disabledTranslation} />
      <DataBlockWithAction size="full" title={t('deleting')}>
        <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
          {t('delete')}
        </DeleteButtonWithIcon>
      </DataBlockWithAction>
    </DataBlockWrapper>
  );
};
