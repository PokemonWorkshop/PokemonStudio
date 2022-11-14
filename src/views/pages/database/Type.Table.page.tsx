import React, { useMemo, useState } from 'react';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { useHistory, useParams } from 'react-router-dom';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useTranslation } from 'react-i18next';
import { useProjectTypes } from '@utils/useProjectData';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { TypeTable } from '@components/database/type/TypeTable';
import { DataBlockWrapperWithNoBreakpoint } from '@components/database/dataBlocks/DataBlockWrapper';
import { EditorOverlay } from '@components/editor';
import { TypeNewEditor } from '@components/database/type/editors';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';

type TypePageParams = {
  typeDbSymbol?: string;
};

export const TypeTablePage = () => {
  const history = useHistory();
  const {
    projectDataValues: types,
    selectedDataIdentifier: typeSelected,
    setSelectedDataIdentifier: setSelectedDataIdentifier,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectTypes();
  const { t } = useTranslation('database_types');
  const { typeDbSymbol } = useParams<TypePageParams>();
  const currentType = types[typeDbSymbol || typeSelected] || types[typeSelected];
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ type: getPreviousDbSymbol('name') }),
      db_next: () => setSelectedDataIdentifier({ type: getNextDbSymbol('name') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [getPreviousDbSymbol, getNextDbSymbol, currentEditor]);
  useShortcut(shortcutMap);

  const onChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ type: selected.value });
    history.push(`/database/types/table`);
  };

  const onClickedBack = () => history.push(`/database/types/${currentType.dbSymbol}`);

  const editors = {
    new: <TypeNewEditor from="typeTable" onClose={() => setCurrentEditor(undefined)} />,
  };

  return (
    <DatabasePageStyle>
      <TypeControlBar onChange={onChange} type={currentType} onClickNewType={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapperWithNoBreakpoint>
            <SubPageTitle title={t('table')} onClickedBack={onClickedBack} />
            <TypeTable />
          </DataBlockWrapperWithNoBreakpoint>
          <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={() => setCurrentEditor(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
