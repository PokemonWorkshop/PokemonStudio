import React, { CSSProperties, HTMLAttributes, useMemo, memo } from 'react';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { FlattenedItem, TreeItem, TreeItemComponentType } from './TreeTypes';
import { UniqueIdentifier } from '@dnd-kit/core';

export interface TreeItemProps<T> extends HTMLAttributes<HTMLLIElement> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: Record<string, unknown>;
  indicator?: boolean;
  indentationWidth: number;
  item: TreeItem<T>;
  isLast: boolean;
  parent: FlattenedItem<T> | null;
  onCollapse?(id: UniqueIdentifier): void;

  onRemove?(id: UniqueIdentifier): void;

  wrapperRef?(node: HTMLLIElement): void;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, isDragging }) => (isSorting || isDragging ? false : true);

type SortableTreeItemProps<T, TElement extends HTMLElement> = TreeItemProps<T> & {
  id: string;
  TreeItemComponent: TreeItemComponentType<T, TElement>;
  disableSorting?: boolean;
};

const SortableTreeItemNotMemoized = <T, TElement extends HTMLElement>({
  id,
  depth,
  isLast,
  TreeItemComponent,
  parent,
  disableSorting,
  ...props
}: SortableTreeItemProps<T, TElement>) => {
  const { attributes, isDragging, isSorting, listeners, setDraggableNodeRef, setDroppableNodeRef, transform, transition } = useSortable({
    id,
    animateLayoutChanges,
    disabled: disableSorting,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? undefined,
  };
  const localCollapse = useMemo(() => {
    if (!props.onCollapse) return undefined;

    return () => props.onCollapse?.(props.item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.item.id, props.onCollapse]);

  const localRemove = useMemo(() => {
    if (!props.onRemove) return undefined;

    return () => props.onRemove?.(props.item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.item.id, props.onRemove]);
  return (
    <TreeItemComponent
      {...props}
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableInteraction={isSorting}
      isLast={isLast}
      parent={parent}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      onCollapse={localCollapse}
      onRemove={localRemove}
      disableSorting={disableSorting}
    />
  );
};

export const SortableTreeItem = memo(SortableTreeItemNotMemoized) as typeof SortableTreeItemNotMemoized;
