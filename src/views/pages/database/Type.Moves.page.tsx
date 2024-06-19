import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/pages';
import { TypeMovesTable } from '@components/database/type/TypeMovesTable';
import { useTypePage } from '@hooks/usePage';
import { useProjectTypes } from '@hooks/useProjectData';

export const TypeMovesPage = () => {
  const navigate = useNavigate();
  const { selectedDataIdentifier } = useProjectTypes();
  const { currentTypeName, currentType: type, types } = useTypePage();
  const { t } = useTranslation('database_types');
  const [currentType, setCurrentType] = useState(type);

  const onClickedBack = () => navigate(`/database/types/${currentType.dbSymbol}`);

  useEffect(() => {
    if (!currentType) return;

    if (selectedDataIdentifier !== currentType.dbSymbol) {
      setCurrentType(types[selectedDataIdentifier]);
    }
  }, [currentType, selectedDataIdentifier]);

  return (
    <DatabasePageStyle>
      <TypeControlBar onRedirect="moves" />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('move_with_type', { type: currentTypeName })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('move_with_type', { type: currentTypeName })} size="full">
              <TypeMovesTable type={currentType} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
