import React from 'react';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { useNavigate } from 'react-router-dom';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useTranslation } from 'react-i18next';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { TypeTable } from '@components/database/type/TypeTable';
import { DataBlockWrapperWithNoBreakpoint } from '@components/database/dataBlocks/DataBlockWrapper';
import { TypeEditorAndDeletionKeys, TypeEditorOverlay } from '@components/database/type/editors/TypeEditorOverlay';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useTypePage } from '@utils/usePage';

export const TypeTablePage = () => {
  const { types, typeDbSymbol } = useTypePage();
  const dialogsRef = useDialogsRef<TypeEditorAndDeletionKeys>();
  const navigate = useNavigate();
  const { t } = useTranslation('database_types');
  const currentType = types[typeDbSymbol] || types[typeDbSymbol];

  const onClickedBack = () => navigate(`/database/types/${currentType.dbSymbol}`);

  return (
    <DatabasePageStyle>
      <TypeControlBar dialogsRef={dialogsRef} onRedirect="table" />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapperWithNoBreakpoint>
            <SubPageTitle title={t('table')} onClickedBack={onClickedBack} />
            <TypeTable />
          </DataBlockWrapperWithNoBreakpoint>
          <TypeEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
