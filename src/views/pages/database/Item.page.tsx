import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DeleteButtonWithIcon } from '@components/buttons';
import {
  ItemControlBar,
  ItemFrame,
  ItemGenericData,
  ItemParametersData,
  ItemTechData,
  ItemExplorationData,
  ItemBattleData,
  ItemProgressData,
  ItemHealData,
  ItemCatchData,
} from '@components/database/item';
import { useProjectItems } from '@utils/useProjectData';
import {
  ItemBattleDataEditor,
  ItemCatchDataEditor,
  ItemExplorationDataEditor,
  ItemFrameEditor,
  ItemGenericDataEditor,
  ItemHealDataEditor,
  ItemNewEditor,
  ItemParametersDataEditor,
  ItemProgressDataEditor,
  ItemTechDataEditor,
} from '@components/database/item/editors';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useEditorHandlingCloseRef } from '@components/editor/useHandleCloseEditor';
import { cleaningItemNaNValues } from '@utils/cleanNaNValue';
import { cloneEntity } from '@utils/cloneEntity';

export const ItemPage = () => {
  const {
    projectDataValues: items,
    selectedDataIdentifier: itemDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setItems,
    removeProjectDataValue: deleteItem,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectItems();
  const { t } = useTranslation('database_items');
  const getItemName = useGetEntityNameText();
  const onChange: SelectChangeEvent = (selected) => setSelectedDataIdentifier({ item: selected.value });
  const item = items[itemDbSymbol];
  const currentEditedItem = useMemo(() => cloneEntity(item), [item]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const frameEditorRef = useEditorHandlingCloseRef();
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ item: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ item: getNextDbSymbol('id') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [currentEditor, currentDeletion, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 12 },
      translation_description: { fileId: 13, isMultiline: true },
    },
    currentEditedItem.id,
    getItemName(currentEditedItem)
  );

  const blockCloseEditor = () => {
    if (currentEditor === 'frame') {
      return !frameEditorRef.current || !frameEditorRef.current.canClose();
    }
    if (currentEditor === 'catch' && currentEditedItem.klass === 'BallItem') {
      return currentEditedItem.spriteFilename === '';
    }
    return false;
  };

  const onCloseEditor = () => {
    if (blockCloseEditor()) return;
    setCurrentEditor(undefined);
    if (currentEditor === 'new') return;
    if (currentEditor === 'frame') {
      frameEditorRef.current?.onClose();
      return closeTranslationEditor();
    }
    cleaningItemNaNValues(currentEditedItem);
    setItems({ [item.dbSymbol]: currentEditedItem });
    closeTranslationEditor();
  };

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(items)
      .map(([value, itemData]) => ({ value, index: itemData.id }))
      .filter((d) => d.value !== itemDbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    deleteItem(itemDbSymbol, { item: firstDbSymbol });
    setCurrentDeletion(undefined);
  };

  const editors = {
    new: <ItemNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <ItemFrameEditor item={currentEditedItem} setItems={setItems} openTranslationEditor={openTranslationEditor} ref={frameEditorRef} />,
    generic: <ItemGenericDataEditor item={currentEditedItem} />,
    parameters: <ItemParametersDataEditor item={currentEditedItem} />,
    tech: <ItemTechDataEditor item={currentEditedItem} />,
    exploration: <ItemExplorationDataEditor item={currentEditedItem} />,
    battle: <ItemBattleDataEditor item={currentEditedItem} />,
    catch: <ItemCatchDataEditor item={currentEditedItem} />,
    progress: <ItemProgressDataEditor item={currentEditedItem} setItems={setItems} />,
    heal: <ItemHealDataEditor item={currentEditedItem} setItems={setItems} />,
  };

  const deletions = {
    deletion: (
      <Deletion
        title={t('deletion_of', { item: getItemName(item) })}
        message={t('deletion_message', { item: getItemName(item) })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  return (
    <DatabasePageStyle>
      <ItemControlBar onChange={onChange} item={item} onClickNewItem={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <ItemFrame item={item} onClick={() => setCurrentEditor('frame')} />
            <ItemGenericData item={item} onClick={() => setCurrentEditor('generic')} />
            <ItemParametersData item={item} onClick={() => setCurrentEditor('parameters')} />
            <ItemTechData item={item} onClick={() => setCurrentEditor('tech')} />
            <ItemExplorationData item={item} onClick={() => setCurrentEditor('exploration')} />
            <ItemBattleData item={item} onClick={() => setCurrentEditor('battle')} />
            <ItemProgressData item={item} onClick={() => setCurrentEditor('progress')} />
            <ItemHealData item={item} onClick={() => setCurrentEditor('heal')} />
            <ItemCatchData item={item} onClick={() => setCurrentEditor('catch')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('deletion')} disabled={Object.entries(items).length === 1}>
                {t('delete_this_item')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} subEditor={translationEditor} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
