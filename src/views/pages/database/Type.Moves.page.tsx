import React, { useEffect } from 'react';
import { StudioShortcut, useGlobalState } from '@src/GlobalStateProvider';
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
import { useShortcut } from '@utils/useShortcuts';

type TypeMovesPageParams = {
  typeDbSymbol: string;
};

export const TypeMovesPage = () => {
  const history = useHistory();
  const [state] = useGlobalState();
  const { projectDataValues: types, setSelectedDataIdentifier: setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol } = useProjectTypes();
  const { t } = useTranslation('database_types');
  const shortcut = useShortcut([StudioShortcut.DB_PREVIOUS, StudioShortcut.DB_NEXT]);
  const { typeDbSymbol } = useParams<TypeMovesPageParams>();
  const currentType = state.projectData.types[typeDbSymbol];

  const onChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ type: selected.value });
    history.push(`/database/types/${selected.value}/moves`);
  };

  const onClickedBack = () => history.push(`/database/types/${currentType.dbSymbol}`);

  useEffect(() => {
    if (shortcut === StudioShortcut.DB_PREVIOUS) {
      const previousDbSymbol = getPreviousDbSymbol(types, currentType.id);
      setSelectedDataIdentifier({ type: previousDbSymbol });
      history.push(`/database/types/${previousDbSymbol}/moves`);
    }
    if (shortcut === StudioShortcut.DB_NEXT) {
      const nextDbSymbol = getNextDbSymbol(types, currentType.id);
      setSelectedDataIdentifier({ type: nextDbSymbol });
      history.push(`/database/types/${nextDbSymbol}/moves`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut]);

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
