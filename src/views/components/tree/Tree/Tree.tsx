import React, { Component, ReactNode } from 'react';
// Allowing existing usage of non Pragmatic drag and drop solution
import {
  Draggable,
  Droppable,
  DragDropContext,
  DragStart,
  DropResult,
  DragUpdate,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
} from '@hello-pangea/dnd';
import { getBox } from 'css-box-model';
import { calculateFinalDropPositions } from './Tree-utils';
import { Props, State, DragState } from './Tree-types';
import { noop } from '../utils/handy';
import { flattenTree } from '../utils/tree';
import { mutateTree } from '../utils/mutateTree';
import { FlattenedItem, ItemId, Path, TreeData } from '../types';
import TreeItem from '../TreeItem/TreeItem';
import { getDestinationPath, getItemById, getIndexById } from '../utils/flat-tree';
import DelayedFunction from '../utils/delayed-function';

export default class Tree extends Component<Props, State> {
  static defaultProps = {
    tree: { children: [] },
    onExpand: noop,
    onCollapse: noop,
    onDragStart: noop,
    onDragEnd: noop,
    renderItem: noop,
    offsetPerLevel: 35,
    isDragEnabled: false,
    isNestingEnabled: false,
  };

  state = {
    flattenedTree: [],
    draggedItemId: undefined,
  };

  // State of dragging.
  dragState?: DragState;

  // HTMLElement for each rendered item
  itemsElement: Record<ItemId, HTMLElement | undefined> = {};

  // HTMLElement of the container element
  containerElement: HTMLElement | undefined;

  expandTimer = new DelayedFunction(500);

  static getDerivedStateFromProps(props: Props, state: State) {
    const { draggedItemId } = state;
    const { tree } = props;

    const finalTree: TreeData = Tree.closeParentIfNeeded(tree, draggedItemId);
    const flattenedTree = flattenTree(finalTree);

    return {
      ...state,
      flattenedTree,
    };
  }

  static closeParentIfNeeded(tree: TreeData, draggedItemId?: ItemId): TreeData {
    if (draggedItemId !== undefined) {
      // Closing parent internally during dragging, because visually we can only move one item not a subtree
      return mutateTree(tree, draggedItemId, {
        isExpanded: false,
      });
    }
    return tree;
  }

  onDragStart = (result: DragStart) => {
    const { onDragStart } = this.props;
    const element = this.itemsElement[result.draggableId];
    const contentX = element ? getBox(element).contentBox.left : 0;

    this.dragState = {
      source: result.source,
      destination: result.source,
      mode: result.mode,
      startContentX: contentX,
      updatedContentX: contentX,
    };

    this.setState({ draggedItemId: result.draggableId });

    if (onDragStart) onDragStart(result.draggableId);
  };

  onDragUpdate = (update: DragUpdate) => {
    const { onExpand } = this.props;
    const { flattenedTree } = this.state;
    if (!this.dragState) return;

    this.expandTimer.stop();
    if (update.combine) {
      const { draggableId } = update.combine;
      const item: FlattenedItem | undefined = getItemById(flattenedTree, draggableId);
      if (item && this.isExpandable(item)) {
        this.expandTimer.start(() => onExpand(draggableId, item.path));
      }
    }
    this.dragState = {
      ...this.dragState,
      destination: update.destination === null ? undefined : update.destination,
      combine: update.combine === null ? undefined : update.combine,
    };
  };

  onDropAnimating = () => {
    this.expandTimer.stop();
  };

  onDragEnd = (result: DropResult) => {
    const { onDragEnd, tree } = this.props;
    const { flattenedTree } = this.state;
    this.expandTimer.stop();

    const finalDragState: DragState = {
      ...this.dragState!,
      source: result.source,
      destination: result.destination === null ? undefined : result.destination,
      combine: result.combine === null ? undefined : result.combine,
    };

    this.setState({
      draggedItemId: undefined,
    });

    const { sourcePosition, destinationPosition } = calculateFinalDropPositions(tree, flattenedTree, finalDragState, this.getDroppedLevel());

    onDragEnd(sourcePosition, destinationPosition);

    this.dragState = undefined;
  };

  onPointerMove = () => {
    if (!this.dragState) return;

    const element = this.state.draggedItemId && this.itemsElement[this.state.draggedItemId];
    const contentX = element ? getBox(element).contentBox.left : this.dragState.updatedContentX;
    if (Math.abs(this.dragState.startContentX - contentX) > this.props.offsetPerLevel / 4) {
      this.dragState.updatedContentX = contentX;
    }
  };

  calculateEffectivePath = (flatItem: FlattenedItem, snapshot: DraggableStateSnapshot): Path => {
    const { flattenedTree, draggedItemId } = this.state;

    if (this.dragState && draggedItemId === flatItem.item.id && (this.dragState.destination || this.dragState.combine)) {
      const { source, destination, combine, mode } = this.dragState;
      const horizontalLevel = this.getDroppedLevel();
      // We only update the path when it's dragged by keyboard or drop is animated
      if (mode === 'SNAP' || snapshot.isDropAnimating) {
        if (destination) {
          // Between two items
          return getDestinationPath(flattenedTree, source.index, destination.index, horizontalLevel);
        }
        if (combine) {
          // Hover on other item while dragging
          return getDestinationPath(flattenedTree, source.index, getIndexById(flattenedTree, combine.draggableId), horizontalLevel);
        }
      }
    }
    return flatItem.path;
  };

  isExpandable = (item: FlattenedItem): boolean => !!item.item.hasChildren && !item.item.isExpanded;

  getDroppedLevel = (): number => {
    if (!this.dragState || !this.containerElement) return 1;

    const { offsetPerLevel } = this.props;
    const containerLeft = getBox(this.containerElement).contentBox.left;
    const relativeLeft: number = Math.max(this.dragState.updatedContentX - containerLeft, 0);
    return Math.floor((relativeLeft + offsetPerLevel / 2) / offsetPerLevel) + 1;
  };

  patchDroppableProvided = (provided: DroppableProvided): DroppableProvided => {
    return {
      ...provided,
      innerRef: (el: HTMLElement | null | undefined) => {
        if (el === null) return;

        this.containerElement = el;
        provided.innerRef(el);
      },
    };
  };

  setItemRef = (itemId: ItemId, el: HTMLElement | null) => {
    if (el !== null) {
      this.itemsElement[itemId] = el;
    }
  };

  renderItems = (): Array<ReactNode> => {
    const { flattenedTree } = this.state;
    return flattenedTree.map(this.renderItem);
  };

  renderItem = (flatItem: FlattenedItem, index: number): ReactNode => {
    const { isDragEnabled } = this.props;

    // If drag and drop is explicitly disabled for all items, render TreeItem directly with stubbed provided and snapshot
    if (isDragEnabled === false) {
      return this.renderTreeItem({
        flatItem,
        path: flatItem.path,
        provided: {
          draggableProps: {
            'data-rfd-draggable-context-id': '',
            'data-rfd-draggable-id': '',
          },
          innerRef: () => {},
          dragHandleProps: null,
        },
        snapshot: {
          isDragging: false,
          isDropAnimating: false,
          isClone: false,
          dropAnimation: null,
          combineTargetFor: null,
          combineWith: null,
          draggingOver: null,
          mode: null,
        },
      });
    }

    const isDragDisabled = typeof isDragEnabled === 'function' ? !isDragEnabled(flatItem.item) : !isDragEnabled;
    const isDragDisabledOnParentExpanded = flatItem.item.hasChildren && flatItem.item.isExpanded;

    return (
      <Draggable
        key={flatItem.item.id}
        draggableId={flatItem.item.id.toString()}
        index={index}
        isDragDisabled={isDragDisabled || isDragDisabledOnParentExpanded}
      >
        {this.renderDraggableItem(flatItem)}
      </Draggable>
    );
  };

  renderDraggableItem = (flatItem: FlattenedItem) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
    const currentPath: Path = this.calculateEffectivePath(flatItem, snapshot);
    if (snapshot.isDropAnimating) {
      this.onDropAnimating();
    }
    return this.renderTreeItem({
      flatItem,
      path: currentPath,
      provided,
      snapshot,
    });
  };

  renderTreeItem = ({
    flatItem,
    path,
    provided,
    snapshot,
  }: {
    flatItem: FlattenedItem;
    path: Path;
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
  }) => {
    const { renderItem, onExpand, onCollapse, offsetPerLevel } = this.props;
    return (
      <TreeItem
        key={flatItem.item.id}
        item={flatItem.item}
        path={path}
        onExpand={onExpand}
        onCollapse={onCollapse}
        renderItem={renderItem}
        provided={provided}
        snapshot={snapshot}
        itemRef={this.setItemRef}
        offsetPerLevel={offsetPerLevel}
      />
    );
  };

  render() {
    const { isNestingEnabled } = this.props;
    const renderedItems = this.renderItems();

    return (
      <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd} onDragUpdate={this.onDragUpdate}>
        <Droppable droppableId="tree" isCombineEnabled={isNestingEnabled} ignoreContainerClipping>
          {(provided: DroppableProvided) => {
            const finalProvided: DroppableProvided = this.patchDroppableProvided(provided);
            return (
              <div
                ref={finalProvided.innerRef}
                style={{ pointerEvents: 'auto' }}
                onTouchMove={this.onPointerMove}
                onMouseMove={this.onPointerMove}
                {...finalProvided.droppableProps}
              >
                {renderedItems}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
    );
  }
}
