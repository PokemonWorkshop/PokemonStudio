import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Announcements,
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  // MeasuringStrategy,
  // KeyboardSensor,
  Modifier,
  PointerSensor,
  PointerSensorOptions,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { buildTree, findItemDeep, flattenTree, getChildCount, getProjection, removeChildrenOf, removeItem, setProperty } from './TreeUtils';
import type { FlattenedItem, ItemChangedReason, SensorContext, SortableTreeLimitationType, TreeItemComponentType, TreeItems } from './TreeTypes';
// import { sortableTreeKeyboardCoordinates } from './keyboardCoordinates';
import { SortableTreeItem } from './SortableTreeItem';

export type SortableTreeProps<TData extends Record<string, unknown>, TElement extends HTMLElement> = {
  items: TreeItems<TData>;
  onItemsChanged(items: TreeItems<TData>, reason: ItemChangedReason<TData>): void;
  TreeItemComponent: TreeItemComponentType<TData, TElement>;
  indentationWidth?: number;
  indicator?: boolean;
  pointerSensorOptions?: PointerSensorOptions;
  disableSorting?: boolean;
  dropAnimation?: DropAnimation | null;
  sortableTreeLimitation?: SortableTreeLimitationType<TData>;
};
const defaultPointerSensorOptions: PointerSensorOptions = {
  activationConstraint: {
    distance: 3,
  },
};

// const measuring = {
//   droppable: {
//     strategy: MeasuringStrategy.Always,
//   },
// };
const dropAnimationDefaultConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

export const SortableTree = <TreeItemData extends Record<string, unknown>, TElement extends HTMLElement = HTMLDivElement>({
  items,
  indicator,
  indentationWidth = 22,
  onItemsChanged,
  TreeItemComponent,
  pointerSensorOptions,
  disableSorting,
  dropAnimation,
  sortableTreeLimitation,
  ...rest
}: SortableTreeProps<TreeItemData, TElement>) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
      (acc, { children, collapsed, id }) => (collapsed && children?.length ? [...acc, id] : acc),
      []
    );

    const result = removeChildrenOf(flattenedTree, activeId ? [activeId, ...collapsedItems] : collapsedItems);
    return result;
  }, [activeId, items]);
  const projected = getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth);
  const sensorContext: SensorContext<TreeItemData> = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  // const [coordinateGetter] = useState(() =>
  //   sortableTreeKeyboardCoordinates(sensorContext, indentationWidth)
  // );
  const sensors = useSensors(
    useSensor(PointerSensor, pointerSensorOptions ?? defaultPointerSensorOptions)
    // useSensor(KeyboardSensor, {
    //   coordinateGetter,
    // })
  );

  const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);
  const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const handleRemove = useCallback(
    (id: string) => {
      const item = findItemDeep(itemsRef.current, id)!;
      onItemsChanged(removeItem(itemsRef.current, id), {
        type: 'removed',
        item,
      });
    },
    [onItemsChanged]
  );

  const handleDragCancel = () => {
    resetState();
  };

  const resetState = () => {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty('cursor', '');
  };

  const getMovementAnnouncement = (eventName: string, activeId: UniqueIdentifier, overId?: UniqueIdentifier) => {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (currentPosition && projected.parentId === currentPosition.parentId && overId === currentPosition.overId) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem<TreeItemData>[] = flattenTree(items);
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem<TreeItemData> | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: UniqueIdentifier | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  };

  const handleCollapse = useCallback(
    (id: string) => {
      const item = findItemDeep(itemsRef.current, id)!;
      onItemsChanged(
        setProperty(itemsRef.current, id, 'collapsed', ((value: boolean) => {
          return !value;
        }) as never),
        {
          type: item.collapsed ? 'collapsed' : 'expanded',
          item: item,
        }
      );
    },
    [onItemsChanged]
  );

  const announcements: Announcements = useMemo(
    () => ({
      onDragStart({ active }) {
        return `Picked up ${active.id}.`;
      },
      onDragMove({ active, over }) {
        return getMovementAnnouncement('onDragMove', active.id, over?.id);
      },
      onDragOver({ active, over }) {
        return getMovementAnnouncement('onDragOver', active.id, over?.id);
      },
      onDragEnd({ active, over }) {
        return getMovementAnnouncement('onDragEnd', active.id, over?.id);
      },
      onDragCancel({ active }) {
        return `Moving was cancelled. ${active.id} was dropped in its original position.`;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDragStart = ({ active: { id: activeId } }: DragStartEvent) => {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  };

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    resetState();

    if (sortableTreeLimitation?.(activeItem, projected)) return;

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem<TreeItemData>[] = flattenTree(items);
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };
      const draggedFromParent = activeTreeItem.parent;
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);
      const newActiveItem = sortedItems.find((x) => x.id === active.id)!;
      const currentParent = newActiveItem.parentId ? sortedItems.find((x) => x.id === newActiveItem.parentId)! : null;
      // removing setTimeout leads to an unwanted scrolling
      // Use case:
      //   There are a lot of items in a tree (so that the scroll exists).
      //   You take the node from the bottom and move it to the top
      //   Without `setTimeout` when you drop the node the list gets scrolled to the bottom.
      setTimeout(() =>
        onItemsChanged(newItems, {
          type: 'dropped',
          draggedItem: newActiveItem,
          draggedFromParent: draggedFromParent,
          droppedToParent: currentParent,
        })
      );
    }
  };

  return (
    <DndContext
      accessibility={{ announcements }}
      sensors={disableSorting ? undefined : sensors}
      modifiers={indicator ? modifiersArray : undefined}
      collisionDetection={closestCenter}
      // measuring={measuring}
      onDragStart={disableSorting ? undefined : handleDragStart}
      onDragMove={disableSorting ? undefined : handleDragMove}
      onDragOver={disableSorting ? undefined : handleDragOver}
      onDragEnd={disableSorting ? undefined : handleDragEnd}
      onDragCancel={disableSorting ? undefined : handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={disableSorting ? undefined : verticalListSortingStrategy}>
        {flattenedItems.map((item) => {
          return (
            <SortableTreeItem
              {...rest}
              key={item.id}
              id={item.id as never}
              item={item}
              childCount={item.children?.length}
              depth={item.id === activeId && projected ? projected.depth : item.depth}
              indentationWidth={indentationWidth}
              indicator={indicator}
              collapsed={Boolean(item.collapsed && item.children?.length)}
              onCollapse={item.children?.length ? handleCollapse : undefined}
              onRemove={handleRemove}
              isLast={item.id === activeId && projected ? projected.isLast : item.isLast}
              parent={item.id === activeId && projected ? projected.parent : item.parent}
              TreeItemComponent={TreeItemComponent}
              disableSorting={disableSorting}
            />
          );
        })}
        {createPortal(
          <DragOverlay dropAnimation={dropAnimation === undefined ? dropAnimationDefaultConfig : dropAnimation}>
            {activeId && activeItem ? (
              <TreeItemComponent
                {...rest}
                item={activeItem}
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                indentationWidth={indentationWidth}
                isLast={false}
                parent={activeItem.parent}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );
};

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
const modifiersArray = [adjustTranslate];
