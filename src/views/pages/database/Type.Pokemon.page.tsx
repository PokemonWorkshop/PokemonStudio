import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { TypePokemonTable } from '@components/database/type/TypePokemonTable';
import { useTypePage } from '@utils/usePage';
import { useDialogsRef } from '@utils/useDialogsRef';
import { TypeEditorAndDeletionKeys } from '@components/database/type/editors/TypeEditorOverlay';
import { useProjectTypes } from '@utils/useProjectData';

export const TypePokemonPage = () => {
  const dialogsRef = useDialogsRef<TypeEditorAndDeletionKeys>();
  const { selectedDataIdentifier } = useProjectTypes();
  const { getCurrentTypeName, currentType: type, types } = useTypePage();
  const [currentType, setCurrentType] = useState(type);
  const navigate = useNavigate();
  const { t } = useTranslation('database_types');

  useEffect(() => {
    if (!currentType) return;

    if (selectedDataIdentifier !== currentType.dbSymbol) {
      setCurrentType(types[selectedDataIdentifier]);
    }
  }, [currentType, selectedDataIdentifier]);

  const onClickedBack = () => navigate(`/database/types/${currentType.dbSymbol}`);

  return (
    <DatabasePageStyle>
      <TypeControlBar dialogsRef={dialogsRef} onRedirect="pokemon" />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('pokemon_with_type', { type: getCurrentTypeName })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('pokemon_with_type', { type: getCurrentTypeName })} size="full">
              <TypePokemonTable type={currentType} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
