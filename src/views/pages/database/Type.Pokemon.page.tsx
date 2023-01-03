import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { TypePokemonTable } from '@components/database/type/TypePokemonTable';
import { useProjectTypes } from '@utils/useProjectData';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';

type TypePokemonPageParams = {
  typeDbSymbol: string;
};

export const TypePokemonPage = () => {
  const history = useHistory();
  const [state] = useGlobalState();
  const getTypeName = useGetEntityNameTextUsingTextId();
  const { setSelectedDataIdentifier: setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectTypes();
  const { t } = useTranslation('database_types');
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    return {
      db_previous: () => {
        const previousDbSymbol = getPreviousDbSymbol('name');
        setSelectedDataIdentifier({ type: previousDbSymbol });
        history.push(`/database/types/${previousDbSymbol}/pokemon`);
      },
      db_next: () => {
        const nextDbSymbol = getNextDbSymbol('name');
        setSelectedDataIdentifier({ type: nextDbSymbol });
        history.push(`/database/types/${nextDbSymbol}/pokemon`);
      },
    };
  }, [getPreviousDbSymbol, setSelectedDataIdentifier, history, getNextDbSymbol]);
  useShortcut(shortcutMap);
  const { typeDbSymbol } = useParams<TypePokemonPageParams>();
  const currentType = state.projectData.types[typeDbSymbol];

  const onChange: SelectChangeEvent = (selected) => {
    setSelectedDataIdentifier({ type: selected.value });
    history.push(`/database/types/${selected.value}/pokemon`);
  };

  const onClickedBack = () => history.push(`/database/types/${currentType.dbSymbol}`);

  return (
    <DatabasePageStyle>
      <TypeControlBar onChange={onChange} type={currentType} onClickTypeTable={() => history.push('/database/types/table')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('pokemon_with_type', { type: getTypeName(currentType) })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('pokemon_with_type', { type: getTypeName(currentType) })} size="full">
              <TypePokemonTable type={currentType} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
