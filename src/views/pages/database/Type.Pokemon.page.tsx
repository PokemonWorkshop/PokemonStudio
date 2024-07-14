import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/pages';
import { TypePokemonTable } from '@components/database/type/TypePokemonTable';
import { useTypePage } from '@hooks/usePage';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { TypeEditorAndDeletionKeys } from '@components/database/type/editors/TypeEditorOverlay';
import { useProjectTypes } from '@hooks/useProjectData';

export const TypePokemonPage = () => {
  const dialogsRef = useDialogsRef<TypeEditorAndDeletionKeys>();
  const { selectedDataIdentifier } = useProjectTypes();
  const { currentTypeName, currentType: type, types } = useTypePage();
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
            <SubPageTitle title={t('pokemon_with_type', { type: currentTypeName })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('pokemon_with_type', { type: currentTypeName })} size="full">
              <TypePokemonTable type={currentType} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
