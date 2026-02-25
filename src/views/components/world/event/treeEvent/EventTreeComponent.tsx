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
import { useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/inputs';
import { useContextMenu } from '@hooks/useContextMenu';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { EventTreeContextMenu } from './EventTreeContextMenu';
import { convertEventToTree } from '@utils/events/EventUtils';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapListContainer, TreeItemContainer } from '../../map/tree/style';
import { EVENT_NAME_TEXT_ID, StudioEvent, StudioEventTreeValue } from '../../../../../models/entities/event/event';
import { EventEditorAndDeletionKeys, EventTreeEditorOverlay } from '../editors/EventEditorOverlay';
import { searchIsUnderOpenFolder } from '../../../tree/Tree/Tree-utils';
import DotIcon from '@assets/icons/global/dot.svg';
import { getMapTreeCountChildren, getTreeDestinationDepth, getTreeSourceDepth, renderDropBox } from '../../../../../utils/MapTreeUtils';

type EventTreeComponentProps = {
  treeScrollbarRef: RefObject<HTMLDivElement>;
};

const convertTreeToEvents = (treeData: Record<string | number, TreeItem>) => {
  const result: Record<string, StudioEvent> = {};

  const traverse = (itemId: string | number) => {
    const item = treeData[itemId];
    if (!item) return;

    if (item.data?.klass === 'Event') {
      result[item.data.dbSymbol] = item.data;
    }

    item.children.forEach((childId) => traverse(childId));
  };

  traverse(0);

  return result;
};

export const EventTreeComponent = ({ treeScrollbarRef }: EventTreeComponentProps) => {
  const {
    selectedDataIdentifier: currentEvent,
    setSelectedDataIdentifier: setEvent,
    projectDataValues: events,
    setProjectDataValues: setAllEvents,
  } = useProjectEvents();
  const setText = useSetProjectText();
  const getEventName = useGetEntityNameText();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const { t } = useTranslation();
  const [tree, setTree] = useState<TreeData>(convertEventToTree(events));
  const [canRename, setCanRename] = useState<ItemId>();
  const [eventSelected, setEventSelected] = useState<StudioEventTreeValue>();
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  const treeRef = useRef<Tree>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const dialogsRef = useDialogsRef<EventEditorAndDeletionKeys>();

  useEffect(() => {
    if (tree.items[0] && Object.keys(events).length > tree.items[0].children.length) {
      setShouldScroll(true);
    }
    setTree(convertEventToTree(events));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

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
  };

  const onCollapse = (itemId: ItemId) => {
    const newTree = mutateTree(tree, itemId, { isExpanded: false });
    setTree(newTree);
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

    if (typeof item.data.id === 'number') {
      return getEventName({ klass: 'Event', id: item.data.id });
    }

    return item.data.id;
  };

  const renderItem = ({ item, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
    const isEvent = item.data?.klass === 'Event';
    const isFolder = item.data?.klass === 'EventFolder';

    const countChildren = isEvent ? getMapTreeCountChildren(tree, item) : undefined;
    const isDeleted = item.data.klass === 'MapInfoMap' && !events[item.data.mapDbSymbol];
    const isUnderOpenFolder = searchIsUnderOpenFolder(tree, item, 'EventFolder');

    renderDropBox(snapshot.combineWith, treeRef);

    const handleRename = () => {
      if (!renameRef.current) return setCanRename(undefined);
      const value = renameRef.current.value === '' ? renameRef.current.defaultValue : renameRef.current.value;

      if (isEvent) {
        setText(EVENT_NAME_TEXT_ID, item.data.id, value);
      }
      setCanRename(undefined);
    };

    const openMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();

      setEventSelected(item);
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
          className={currentEvent === item.data.dbSymbol ? 'map-selected' : 'map'}
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
                className={isFolder ? 'input-folder' : 'input-map'}
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
              {!isDeleted && eventSelected?.data.klass === 'EventFolder' && (
                <span
                  className="icon icon-plus"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventSelected(tree.items[item.id]);
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

    // We can only drop a event if the depth < 1
    const destinationDepth = getTreeDestinationDepth(tree, destination);
    const sourceDepth = getTreeSourceDepth(tree, currentItem);

    if (destinationDepth + sourceDepth > 2) return;

    const newTree = moveItemOnTree(tree, source, destination);

    // Update parentId in the item dropped
    if (destination.parentId !== undefined) {
      const parent = newTree.items[destination.parentId];
      // If the index doesn't exist, the item is drop at the end of the list, so it is the last children
      const index = destination.index === undefined ? parent.children.length - 1 : destination.index;
      const childId = parent.children[index];
      const treeItem = newTree.items[childId];
      if (treeItem.data?.klass === 'MapInfoMap') {
        treeItem.data.parentId = Number(destination.parentId);
      }
      parent.isExpanded = true;
    }

    setTree(newTree);
    // console.log('save order', newTree.items, events, convertTreeToEvents(newTree.items));

    // const ev = newTree.items as unknown as StudioEvent;
    // setEvent({ event: ev });
    setAllEvents(convertTreeToEvents(newTree.items));
  };

  // Check if there are no maps in the tree (only root folder exists)
  const hasNoEvent = tree.items[0] && tree.items[0].children.length === 0;

  return (
    <MapListContainer>
      {hasNoEvent ? (
        <div className="no-maps">{t('no_event_found')}</div>
      ) : (
        <Tree
          ref={treeRef}
          tree={tree}
          renderItem={renderItem}
          onExpand={onExpand}
          onCollapse={onCollapse}
          onDragEnd={onDragEnd}
          offsetPerLevel={26}
          // TODO: Drag
          isDragEnabled={false}
          isNestingEnabled
        />
      )}
      {eventSelected &&
        renderContextMenu(
          <EventTreeContextMenu
            eventValue={eventSelected}
            isDeleted={eventSelected.data.klass === 'Event' && !events[eventSelected.data.dbSymbol]}
            enableRename={() => setCanRename(eventSelected.id)}
            dialogsRef={dialogsRef}
          />,
        )}
      <EventTreeEditorOverlay eventValue={eventSelected} ref={dialogsRef} />
    </MapListContainer>
  );
};
