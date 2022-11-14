import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { TypeMovesTable } from '@components/database/type/TypeMovesTable';
import { useProjectTypes } from '@utils/useProjectData';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';

type TypeMovesPageParams = {
  typeDbSymbol: string;
};

export const TypeMovesPage = () => {
  const history = useHistory();
  const [state] = useGlobalState();
  const { setSelectedDataIdentifier: setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectTypes();
  const { t } = useTranslation('database_types');
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    return {
      db_previous: () => {
        const nextDbSymbol = getPreviousDbSymbol('name');
        setSelectedDataIdentifier({ type: nextDbSymbol });
        history.push(`/database/types/${nextDbSymbol}/moves`);
      },
      db_next: () => {
        const previousDbSymbol = getNextDbSymbol('name');
        setSelectedDataIdentifier({ type: previousDbSymbol });
        history.push(`/database/types/${previousDbSymbol}/moves`);
      },
    };
  }, [getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);
  const { typeDbSymbol } = useParams<TypeMovesPageParams>();
  const currentType = state.projectData.types[typeDbSymbol];

  const onChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ type: selected.value });
    history.push(`/database/types/${selected.value}/moves`);
  };

  const onClickedBack = () => history.push(`/database/types/${currentType.dbSymbol}`);

  return (
    <DatabasePageStyle>
      <TypeControlBar onChange={onChange} type={currentType} onClickTypeTable={() => history.push('/database/types/table')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('move_with_type', { type: currentType.name() })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('move_with_type', { type: currentType.name() })} size="full">
              <TypeMovesTable type={currentType} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
