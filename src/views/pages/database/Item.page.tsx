import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
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
import BallItemModel from '@modelEntities/item/BallItem.model';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { useShortcut } from '@utils/useShortcuts';
import { StudioShortcut } from '@src/GlobalStateProvider';

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
  const shortcut = useShortcut([StudioShortcut.DB_PREVIOUS, StudioShortcut.DB_NEXT]);
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ item: selected.value });
  const item = items[itemDbSymbol];
  const currentEditedItem = useMemo(() => item.clone(), [item]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 12 },
      translation_description: { fileId: 13, isMultiline: true },
    },
    currentEditedItem.id,
    currentEditedItem.name()
  );

  const blockCloseEditor = () => {
    if (currentEditor === 'frame') {
      return currentEditedItem.name() === '' || currentEditedItem.icon === '';
    }
    if (currentEditor === 'catch' && (currentEditedItem as BallItemModel)) {
      const ballItem = currentEditedItem as BallItemModel;
      return ballItem.spriteFilename === '';
    }
    return false;
  };

  const onCloseEditor = () => {
    if (blockCloseEditor()) return;
    setCurrentEditor(undefined);
    if (currentEditor === 'new') return;
    currentEditedItem.cleaningNaNValues();
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
    frame: <ItemFrameEditor item={currentEditedItem} setItems={setItems} openTranslationEditor={openTranslationEditor} />,
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
        title={t('deletion_of', { item: item.name() })}
        message={t('deletion_message', { item: item.name() })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  useEffect(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return;

    if (shortcut === StudioShortcut.DB_PREVIOUS) {
      setSelectedDataIdentifier({ item: getPreviousDbSymbol(items, currentEditedItem.id) });
    }
    if (shortcut === StudioShortcut.DB_NEXT) {
      setSelectedDataIdentifier({ item: getNextDbSymbol(items, currentEditedItem.id) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut]);

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
