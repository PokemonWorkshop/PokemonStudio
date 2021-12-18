import React, { useMemo, useState } from 'react';
import { DataBlockWithAction, DataBlockWithActionTooltip, DataBlockWrapper } from '@components/database/dataBlocks';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { TypeFrame } from '@components/database/type/TypeFrame';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useHistory, useParams } from 'react-router-dom';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { TypeEfficiencyData } from '@components/database/type/TypeEfficiencyData';
import { TypeResistanceData } from '@components/database/type/TypeResistanceData';
import { DarkButton, DeleteButtonWithIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitleNoActive } from '@components/database/dataBlocks/DataBlockWithTitle';
import { TypeNewEditor, TypeFrameEditor } from '@components/database/type/editors';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { useProjectTypes } from '@utils/useProjectData';

type TypePageParams = {
  typeDbSymbol?: string;
};

export const TypePage = () => {
  const {
    projectDataValues: types,
    selectedDataIdentifier: typeSelected,
    setSelectedDataIdentifier,
    setProjectDataValues: setTypes,
    removeProjectDataValue: deleteType,
  } = useProjectTypes();
  const { t } = useTranslation('database_types');
  const history = useHistory();
  const { typeDbSymbol } = useParams<TypePageParams>();
  const currentType = types[typeDbSymbol || typeSelected] || types[typeSelected];
  const currentEditedType = useMemo(() => currentType.clone(), [currentType]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const allTypes = Object.values(types);

  const onChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ type: selected.value });
    history.push(`/database/types/${selected.value}`);
  };

  const onClickedMoveList = () => history.push(`/database/types/${currentType.dbSymbol}/moves`);
  const onClickedPokemonList = () => history.push(`/database/types/${currentType.dbSymbol}/pokemon`);

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && currentEditedType.name() === '') return;
    setTypes({ [currentType.dbSymbol]: currentEditedType });
    setCurrentEditor(undefined);
  };

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(types)
      .map(([value, typeData]) => ({ value, index: typeData.name() }))
      .filter((d) => d.value !== currentType.dbSymbol)
      .sort((a, b) => a.index.localeCompare(b.index))[0].value;
    deleteType(currentType.dbSymbol, { type: firstDbSymbol });
    setCurrentDeletion(undefined);
    history.push(`/database/types/${currentType.dbSymbol}`);
  };

  const editors = {
    frame: <TypeFrameEditor type={currentEditedType} />,
    new: <TypeNewEditor from="type" onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    deletion: (
      <Deletion
        title={t('deletion_of', { type: currentType.name() })}
        message={t('deletion_message', { type: currentType.name() })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  const onClickTypeTable = () => history.push(`/database/types/table`);

  return (
    <DatabasePageStyle>
      <TypeControlBar onChange={onChange} onClickNewType={() => setCurrentEditor('new')} type={currentType} onClickTypeTable={onClickTypeTable} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <TypeFrame type={currentType} onClick={() => setCurrentEditor('frame')} />
            <TypeEfficiencyData type={currentType} types={allTypes} />
            <TypeResistanceData type={currentType} types={allTypes} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithTitleNoActive size="half" title={t('list_all_pokemon', { type: currentType.name() })} data-noactive>
              <DarkButton onClick={onClickedPokemonList}>{t('show_all_pokemon')}</DarkButton>
            </DataBlockWithTitleNoActive>
            <DataBlockWithTitleNoActive size="half" title={t('list_all_moves', { type: currentType.name() })} data-noactive>
              <DarkButton onClick={onClickedMoveList}>{t('show_all_moves')}</DarkButton>
            </DataBlockWithTitleNoActive>
            {currentType.id <= 18 ? (
              <DataBlockWithActionTooltip title={t('deletion')} size="full" disabled={true} tooltipMessage={t('deletion_disabled')}>
                <DeleteButtonWithIcon onClick={() => setCurrentDeletion('deletion')} disabled={true}>
                  {t('delete_this_type')}
                </DeleteButtonWithIcon>
              </DataBlockWithActionTooltip>
            ) : (
              <DataBlockWithAction title={t('deletion')} size="full">
                <DeleteButtonWithIcon onClick={() => setCurrentDeletion('deletion')}>{t('delete_this_type')}</DeleteButtonWithIcon>
              </DataBlockWithAction>
            )}
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
