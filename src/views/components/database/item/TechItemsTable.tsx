import { State, useGlobalState } from '@src/GlobalStateProvider';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceImage } from '@components/ResourceImage';
import { itemIconPath } from '@utils/path';
import { TFunction } from 'i18next';
import { DataTechItemTable, DataTechItemGrid, RenderTechItemContainer } from './TechItemsTableStyle';
import { ITEM_DESCRIPTION_TEXT_ID, StudioTechItem } from '@modelEntities/item';
import { useCopyProjectText, useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { MoveCategory, TypeCategory } from '@components/categories';
import { SelectMove } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EditButtonOnlyIcon } from '@components/buttons';
import theme from '@src/AppTheme';
import { useShortcutNavigation } from '@src/hooks/useShortcutNavigation';
import { useUpdateItem } from './editors/useUpdateItem';
import { MOVE_DESCRIPTION_TEXT_ID } from '@modelEntities/move';
import { useProjectDataReadonly } from '@src/hooks/useProjectData';

type RenderTechItemProps = {
  item: StudioTechItem;
  state: State;
  t: TFunction<'database_items'>;
};

const RenderTechItem = ({ item, state, t }: RenderTechItemProps) => {
  const getItemName = useGetEntityNameText();
  const getTypeName = useGetEntityNameTextUsingTextId();
  const setItems = useUpdateItem(item);
  const copyText = useCopyProjectText();
  const { projectDataValues: moves } = useProjectDataReadonly('moves', 'move');
  const [techItemMove, setTechItemMove] = useState(item.move || '__undef__');
  const move = moves[techItemMove] || ('__undef__' as DbSymbol);
  const shortcutItemNavigation = useShortcutNavigation('items', 'item', '/database/items/');

  const handleMoveChange = (dbSymbol: DbSymbol) => {
    const move = moves[dbSymbol];
    setTechItemMove(dbSymbol);
    copyText({ fileId: MOVE_DESCRIPTION_TEXT_ID, textId: move.id + 1 }, { fileId: ITEM_DESCRIPTION_TEXT_ID, textId: item.id + 1 });
    setItems({ ...item, move: dbSymbol });
  };

  return (
    <RenderTechItemContainer gap="8px">
      <span>{getItemName(item)}</span>
      <span className="icon">
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
          <MoveCategory category={move.category}>{t(move.category as never)}</MoveCategory>
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

const getTechItems = (state: State) => {
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

      return a.id - b.id;
    });
};

export const TechItemsTable = () => {
  const [state] = useGlobalState();
  const { t } = useTranslation(['database_items', 'database_moves']);
  const allTechItems = getTechItems(state);

  return (
    <DataTechItemTable>
      <DataTechItemGrid gap="8px" className="header">
        <span>{t('database_items:name')}</span>
        <span></span>
        <span>{t('database_moves:move')}</span>
        <span></span>
        <span>{t('database_moves:type')}</span>
        <span>{t('database_moves:category')}</span>
        <span>{t('database_moves:pp')}</span>
        <span>{t('database_moves:power')}</span>
        <span>{t('database_moves:accuracy')}</span>
      </DataTechItemGrid>
      {allTechItems.map((item) => (
        <RenderTechItem key={`type-items-${item.dbSymbol}`} item={item} t={t} state={state} />
      ))}
    </DataTechItemTable>
  );
};
