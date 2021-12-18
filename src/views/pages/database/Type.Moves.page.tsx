import React from 'react';
import { useGlobalSelectedDataIdentifier, useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { TypeMovesTable } from '@components/database/type/TypeMovesTable';

type TypeMovesPageParams = {
  typeDbSymbol: string;
};

export const TypeMovesPage = () => {
  const history = useHistory();
  const [state] = useGlobalState();
  const [, setSelectedDataIdentifier] = useGlobalSelectedDataIdentifier();
  const { t } = useTranslation('database_types');
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
