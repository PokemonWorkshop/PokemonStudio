import { State, useGlobalState } from '@src/GlobalStateProvider';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceImage } from '@components/ResourceImage';
import { itemIconPath } from '@utils/path';
import {
  DataTechItemTable,
  DataTechItemGrid,
  RenderTechItemContainer,
  DataTechItemVirtualizedListContainer,
  DataTechItemList,
} from './TechItemsTableStyle';
import { ITEM_DESCRIPTION_TEXT_ID, ITEM_NAME_TEXT_ID, StudioTechItem } from '@modelEntities/item';
import { useCopyProjectText, useGetEntityNameText, useGetEntityNameTextUsingTextId, useGetProjectText } from '@utils/ReadingProjectText';
import { MoveCategory, TypeCategory } from '@components/categories';
import { SelectMove } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EditButtonOnlyIcon } from '@components/buttons';
import theme from '@src/AppTheme';
import { useShortcutNavigation } from '@src/hooks/useShortcutNavigation';
import { useUpdateItem } from './editors/useUpdateItem';
import { MOVE_DESCRIPTION_TEXT_ID } from '@modelEntities/move';
import { useProjectDataReadonly } from '@src/hooks/useProjectData';
import { AutoSizer } from 'react-virtualized';

type RenderTechItemProps = {
  item: StudioTechItem;
  state: State;
};

type RowRendererType = {
  key: string;
  index: number;
  style: React.CSSProperties;
};

const RenderTechItem = ({ item, state }: RenderTechItemProps) => {
  const getItemName = useGetEntityNameText();
  const getTypeName = useGetEntityNameTextUsingTextId();
  const setItems = useUpdateItem(item);
  const copyText = useCopyProjectText();
  const { projectDataValues: moves } = useProjectDataReadonly('moves', 'move');
  const [techItemMove, setTechItemMove] = useState(item.move || '__undef__');
  const move = moves[techItemMove] || ('__undef__' as DbSymbol);
  const shortcutItemNavigation = useShortcutNavigation('items', 'item', '/database/items/');
  const { t } = useTranslation();

  const handleMoveChange = (dbSymbol: DbSymbol) => {
    const move = moves[dbSymbol];
    setTechItemMove(dbSymbol);
    copyText({ fileId: MOVE_DESCRIPTION_TEXT_ID, textId: move.id + 1 }, { fileId: ITEM_DESCRIPTION_TEXT_ID, textId: item.id + 1 });
    setItems({ ...item, move: dbSymbol });
  };

  return (
    <RenderTechItemContainer gap="8px">
      <span>{getItemName(item)}</span>
      <span>
        <ResourceImage imagePathInProject={itemIconPath(item.icon)} />
      </span>
      <span className="select">
        <SelectMove
          dbSymbol={techItemMove}
          onChange={(dbSymbol) => {
            handleMoveChange(dbSymbol as DbSymbol);
          }}
          noLabel
        />
      </span>
      <span></span>
      {techItemMove !== '__undef__' ? (
        <>
          <TypeCategory type={move.type}>{getTypeName(state.projectData.types[move.type])}</TypeCategory>
          <MoveCategory category={move.category}>{t(move.category)}</MoveCategory>
          <span>{move.pp}</span>
          <span>{move.power || '---'}</span>
          <span>{move.accuracy || '---'}</span>
        </>
      ) : (
        <>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </>
      )}
      <span></span>
      <span className="edit">
        <EditButtonOnlyIcon color={theme.colors.primaryBase} onClick={() => shortcutItemNavigation(item.dbSymbol)} />
      </span>
    </RenderTechItemContainer>
  );
};

const getTechItems = (state: State, getText: (fileId: number, textId: number) => string) => {
  return Object.values(state.projectData.items)
    .filter((item) => item.klass === 'TechItem')
    .sort((a, b) => {
      const getPriority = (symbol: string): number => {
        if (symbol.startsWith('cs') || symbol.startsWith('hm')) return 0;
        if (symbol.startsWith('ct') || symbol.startsWith('tm')) return 1;
        if (symbol.startsWith('tr') || symbol.startsWith('tr')) return 2;
        return 3;
      };

      const priorityA = getPriority(a.dbSymbol);
      const priorityB = getPriority(b.dbSymbol);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const extractNumber = (name: string): number => {
        return parseInt(name.match(/\d+/)?.[0] ?? '');
      };

      const aName = getText(ITEM_NAME_TEXT_ID, a.id);
      const bName = getText(ITEM_NAME_TEXT_ID, b.id);
      const numA = extractNumber(aName);
      const numB = extractNumber(bName);

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else if (!isNaN(numA)) {
        return -1;
      } else if (!isNaN(numB)) {
        return 1;
      }

      return aName.localeCompare(bName, 'und', { sensitivity: 'case' });
    });
};

export const TechItemsTable = () => {
  const [state] = useGlobalState();
  const { t } = useTranslation();
  const getText = useGetProjectText();
  const allTechItems = getTechItems(state, getText);

  return (
    <DataTechItemTable>
      <DataTechItemGrid gap="8px" className="header">
        <span>{t('name')}</span>
        <span></span>
        <span>{t('move')}</span>
        <span></span>
        <span>{t('type')}</span>
        <span>{t('category')}</span>
        <span>{t('pp')}</span>
        <span>{t('power')}</span>
        <span>{t('accuracy')}</span>
      </DataTechItemGrid>
      <DataTechItemVirtualizedListContainer height={allTechItems.length <= 12 ? 48 * allTechItems.length : 600}>
        <AutoSizer>
          {({ width }) => (
            <DataTechItemList
              width={width}
              height={allTechItems.length <= 12 ? 48 * allTechItems.length : 600}
              rowCount={allTechItems.length}
              rowHeight={48}
              rowRenderer={({ key, index, style }: RowRendererType) => {
                const item = allTechItems[index];
                return (
                  <div key={key} style={style}>
                    <RenderTechItem item={item} state={state} />
                  </div>
                );
              }}
            />
          )}
        </AutoSizer>
      </DataTechItemVirtualizedListContainer>
    </DataTechItemTable>
  );
};
