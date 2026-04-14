import React, { RefObject, useEffect, useRef, useState } from 'react';
import Tree, {
  mutateTree,
  moveItemOnTree,
  RenderItemParams,
  TreeItem,
  TreeData,
  ItemId,
  TreeSourcePosition,
  TreeDestinationPosition,
} from '@components/tree';
import FolderIcon from '@assets/icons/global/folder.svg';
import FolderOpenIcon from '@assets/icons/global/folder_open.svg';
import LeftIcon from '@assets/icons/global/left-icon.svg';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import { useProjectEvents } from '@hooks/useProjectData';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId, useSetProjectText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/inputs';
import { useContextMenu } from '@hooks/useContextMenu';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { EventTreeContextMenu } from './EventTreeContextMenu';
import { convertEventToTree, convertTreeToEventTree, eventTreeConvertItemToEventTreeValue } from '@utils/events/EventTreeUtils';
import { useEventTree } from '@components/world/event/hooks/useEventTree';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapListContainer, TreeItemContainer } from '../../map/tree/style';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { EVENT_FOLDER_NAME_TEXT_ID, StudioEventTreeValue } from '@modelEntities/event/event-tree';
import { EventEditorAndDeletionKeys, EventEditorOverlay } from '../editors/EventEditorOverlay';
import { searchIsUnderOpenFolder } from '../../../tree/Tree/Tree-utils';
import DotIcon from '@assets/icons/global/dot.svg';
import { getMapTreeCountChildren, getTreeDestinationDepth, getTreeSourceDepth, renderDropBox } from '@utils/MapTreeUtils';

type EventTreeComponentProps = {
  treeScrollbarRef: RefObject<HTMLDivElement>;
};

export const EventTreeComponent = ({ treeScrollbarRef }: EventTreeComponentProps) => {
  const { selectedDataIdentifier: currentEvent, setSelectedDataIdentifier: setEvent, projectDataValues: events } = useProjectEvents();
  const { eventTree, setEventTree, setPartialEventTree } = useEventTree();
  const setText = useSetProjectText();
  const getEventName = useGetEntityNameText();
  const getFolderName = useGetEntityNameTextUsingTextId();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const { t } = useTranslation();
  const [tree, setTree] = useState<TreeData>(convertEventToTree(events, eventTree));

  const [canRename, setCanRename] = useState<ItemId>();
  const [eventSelected, setEventSelected] = useState<StudioEventTreeValue>();
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  const treeRef = useRef<Tree>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const dialogsRef = useDialogsRef<EventEditorAndDeletionKeys>();

  useEffect(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    if (eventTree && Object.keys(eventTree).length > Object.keys(tree.items).length) {
      setShouldScroll(true);
    }
    setTree(convertEventToTree(events, eventTree));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTree]);

  useEffect(() => {
    if (shouldScroll && treeScrollbarRef.current) {
      treeScrollbarRef.current.scrollTop = treeScrollbarRef.current.scrollHeight;
      setShouldScroll(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldScroll]);

  useEffect(() => {
    if (canRename) renameRef.current?.focus();
  }, [canRename]);

  const onExpand = (itemId: ItemId) => {
    const newTree = mutateTree(tree, itemId, { isExpanded: true });
    setTree(newTree);
    setPartialEventTree(eventTreeConvertItemToEventTreeValue(newTree.items[itemId]), itemId.toString());
  };

  const onCollapse = (itemId: ItemId) => {
    const newTree = mutateTree(tree, itemId, { isExpanded: false });
    setTree(newTree);
    setPartialEventTree(eventTreeConvertItemToEventTreeValue(newTree.items[itemId]), itemId.toString());
  };

  const getIcon = (item: TreeItem, onExpand: (itemId: string) => void, onCollapse: (itemId: string) => void) => {
    return (
      <div className="left-icons">
        {item.children && item.children.length > 0 ? (
          item.isExpanded ? (
            <span
              className="icon collapse-button"
              onClick={(e) => {
                e.stopPropagation();
                onCollapse(item.id.toString());
              }}
            >
              <LeftIcon />
            </span>
          ) : (
            <span
              className="icon collapse-button collapse-button-collapsed"
              onClick={(e) => {
                e.stopPropagation();
                onExpand(item.id.toString());
              }}
            >
              <LeftIcon />
            </span>
          )
        ) : item.data?.klass === 'Event' ? (
          <span className="icon">
            <span className="point-icon" />
          </span>
        ) : (
          <span className="icon">
            <span className="point-icon" />
          </span>
        )}
        {item.data?.klass === 'EventFolder' && <span className="icon">{item.isExpanded ? <FolderOpenIcon /> : <FolderIcon />}</span>}
      </div>
    );
  };

  const getName = (item: TreeItem) => {
    if (!item.id) return '';

    if (item.data?.klass === 'EventFolder') {
      return getFolderName({ klass: 'EventFolder', textId: item.data.id });
    }

    if (typeof item.data?.id === 'number') {
      return getEventName({ klass: 'Event', id: item.data.id });
    }

    return String(item.data?.id ?? '');
  };

  const renderItem = ({ item, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    const isEvent = item.data?.klass === 'Event';
    const isFolder = item.data?.klass === 'EventFolder';

    const countChildren = isFolder ? getMapTreeCountChildren(tree, item) : undefined;
    const isDeleted = item.data.klass === 'Event' && !events[item.data.dbSymbol];
    const isUnderOpenFolder = searchIsUnderOpenFolder(tree, item, 'EventFolder');

    renderDropBox(snapshot.combineWith, treeRef);

    const handleRename = () => {
      if (!renameRef.current) return setCanRename(undefined);
      const value = renameRef.current.value === '' ? renameRef.current.defaultValue : renameRef.current.value;

      if (isEvent) {
        setText(EVENT_NAME_TEXT_ID, item.data.id, value);
      } else if (isFolder) {
        setText(EVENT_FOLDER_NAME_TEXT_ID, item.data.id, value);
      }
      setCanRename(undefined);
    };

    const openMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();

      setEventSelected(item as unknown as StudioEventTreeValue);
      // timeout to wait that the mapinfo selected has been taken into account
      setTimeout(() => buildOnClick(event, true));
    };

    return (
      <div ref={provided.innerRef} {...provided.draggableProps} key={item.id}>
        <TreeItemContainer
          isCurrent={!isEvent && item.data?.dbSymbol === currentEvent}
          hasChildren={!!countChildren}
          disableHover={!!canRename}
          isUnderOpenFolder={isUnderOpenFolder}
          className={currentEvent === item.data.dbSymbol ? 'item-selected' : 'map'}
          onClick={() => {
            if (item.id !== canRename) {
              renameRef.current?.blur();
            }
            if (!item.data.dbSymbol || isFolder) return;
            if (isDeleted) return;

            setEvent({ event: item.data.dbSymbol });
            const targetEvent = events[item.data.dbSymbol];
            if (!targetEvent?.id && location.pathname === '/events/overview') {
              return navigate('/event');
            }
            // TODO: Replace when navigated with the event POC
            if (location.pathname !== '/world/events' && location.pathname !== '/world/overview') navigate('/world/events');
          }}
          onContextMenu={openMenu}
          {...provided.dragHandleProps}
        >
          <div className="title">
            <span>{getIcon(item, onExpand, onCollapse)}</span>
            {canRename === item.id ? (
              <Input
                ref={renameRef}
                defaultValue={getName(item)}
                placeholder={getName(item)}
                onBlur={handleRename}
                onKeyDown={(event) => event.key === 'Enter' && renameRef.current?.blur()}
                className={isFolder ? 'input-tree-folder' : 'input-tree'}
              />
            ) : (
              <span className={`name ${isDeleted ? 'error' : ''}`}>{getName(item)}</span>
            )}
          </div>
          {isFolder && !!countChildren && <span className="count-children">{countChildren}</span>}
          {!canRename && (
            <div className="actions">
              <span className="icon icon-dot" onClick={openMenu}>
                <DotIcon />
              </span>
              {!isDeleted && isFolder && (
                <span
                  className="icon icon-plus"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventSelected(tree.items[item.id] as unknown as StudioEventTreeValue);
                    dialogsRef.current?.openDialog('new');
                  }}
                >
                  <PlusIcon />
                </span>
              )}
            </div>
          )}
        </TreeItemContainer>
      </div>
    );
  };

  const onDragEnd = (source: TreeSourcePosition, destination?: TreeDestinationPosition) => {
    if (!destination) return;

    // We can only drop a folder in the root
    const currentItem = tree.items[tree.items[source.parentId].children[source.index]];
    if (currentItem.data?.klass === 'EventFolder' && destination.parentId !== 0) return;

    const destinationParent = tree.items[destination.parentId];
    if (destinationParent && destinationParent.data?.klass === 'Event') return;

    // Folders are already root-only (checked above), skip depth check for them
    if (currentItem.data?.klass !== 'EventFolder') {
      const destinationDepth = getTreeDestinationDepth(tree, destination);
      const sourceDepth = getTreeSourceDepth(tree, currentItem);
      if (destinationDepth + sourceDepth > 2) return;
    }

    const newTree = moveItemOnTree(tree, source, destination);

    if (destination.parentId !== undefined) {
      newTree.items[destination.parentId].isExpanded = true;
    }

    isDraggingRef.current = true;
    setTree(newTree);
    setEventTree(convertTreeToEventTree(newTree.items));
  };

  // Check if there are no maps in the tree (only root folder exists)
  const hasNoEvent = tree.items[0] && tree.items[0].children.length === 0;

  return (
    <MapListContainer>
      {hasNoEvent ? (
        <div className="no-item-tree">{t('no_event_found')}</div>
      ) : (
        <Tree
          ref={treeRef}
          tree={tree}
          renderItem={renderItem}
          onExpand={onExpand}
          onCollapse={onCollapse}
          onDragEnd={onDragEnd}
          offsetPerLevel={26}
          isDragEnabled={true}
          isNestingEnabled
        />
      )}
      {eventSelected &&
        renderContextMenu(
          <EventTreeContextMenu
            eventValue={eventSelected}
            isDeleted={eventSelected.data?.klass === 'Event' && !events[eventSelected.data?.dbSymbol]}
            enableRename={() => setCanRename(eventSelected.id)}
            dialogsRef={dialogsRef}
          />,
        )}
      <EventEditorOverlay eventValue={eventSelected} ref={dialogsRef} />
    </MapListContainer>
  );
};
