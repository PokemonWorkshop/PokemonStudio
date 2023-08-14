import React, { forwardRef, useState } from 'react';
import type { TreeItem, TreeItemComponentProps } from '@components/sortabletree/TreeTypes';
import { clsx } from 'clsx';
import { MapTreeItemWrapperContainer } from './MapTreeItemWrapperContainer';
import { useProjectMaps } from '@utils/useProjectData';
import { useNavigate } from 'react-router-dom';
import { StudioMapInfo } from '@modelEntities/mapInfo';
import { ReactComponent as FolderIcon } from '@assets/icons/global/folder.svg';
import { ReactComponent as FolderOpenIcon } from '@assets/icons/global/folder_open.svg';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon.svg';
import { ReactComponent as DotIcon } from '@assets/icons/global/dot.svg';
import { ReactComponent as CircleIcon } from '@assets/icons/global/circle.svg';
import { ReactComponent as LeftIcon } from '@assets/icons/global/left-icon.svg';
import { MapTreeContextMenu } from './MapTreeContextMenu';
import { useContextMenu } from '@utils/useContextMenu';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from '../editors/MapEditorOverlay';
import { useDialogsRef } from '@utils/useDialogsRef';
import { mapIsInFolder } from '@utils/MapTreeUtils';

type Props<T> = TreeItemComponentProps<T> & { isDeleted: boolean; countChildren?: number };
export type TreeItemStudioMapInfo = TreeItem<StudioMapInfo>;

const computeMaxWidth = (depth: number, indentationWidth: number) => {
  return 170 - indentationWidth * (depth - 1);
};

const computeMaxWidthHover = (depth: number, indentationWidth: number) => {
  if (depth <= 2) return 154 - indentationWidth * depth;
  return 110;
};

const MapTreeItemWrapperComponent = forwardRef<HTMLDivElement, React.PropsWithChildren<Props<TreeItemStudioMapInfo>>>((props, ref) => {
  const {
    parent,
    clone,
    depth,
    disableSelection,
    disableInteraction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disableSorting,
    ghost,
    handleProps,
    indentationWidth,
    collapsed,
    onCollapse,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRemove,
    wrapperRef,
    style,
    hideCollapseButton,
    childCount,
    manualDrag,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLast,
    className,
    contentClassName,
    isDeleted,
    countChildren,
    ...rest
  } = props;
  const { selectedDataIdentifier, setSelectedDataIdentifier } = useProjectMaps();
  const navigate = useNavigate();
  const { buildOnClick, renderContextMenu } = useContextMenu();
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const item = props.item;
  const isFolder = item.klass === 'MapInfoFolder';
  const [isDisabledNavigation, setIsDisabledNavigation] = useState<boolean>(false);

  const handleClick = () => {
    if (isFolder || isDeleted || isDisabledNavigation) return;

    setSelectedDataIdentifier({ map: item.mapDbSymbol });
    navigate('/world/map');
  };

  const computeIndentationWidth = () => {
    if (clone) return 0;

    return indentationWidth * depth;
  };

  return (
    <MapTreeItemWrapperContainer
      isCurrent={!isFolder && item.mapDbSymbol === selectedDataIdentifier}
      maxWidth={computeMaxWidth(depth, indentationWidth)}
      maxWidthWhenHover={computeMaxWidthHover(depth, indentationWidth)}
      hasChildren={!!childCount}
    >
      <li
        ref={wrapperRef}
        {...rest}
        className={clsx(
          'wrapper',
          clone && clsx('clone'),
          ghost && 'ghost',
          disableSelection && 'disable-selection',
          disableInteraction && 'disable-interaction',
          className
        )}
        style={{
          ...style,
          marginLeft: computeIndentationWidth(),
        }}
      >
        {ghost ? (
          <div />
        ) : (
          <div className={clsx('tree-item', contentClassName)} ref={ref} {...(manualDrag ? undefined : handleProps)} onClick={handleClick}>
            <div className={clsx('title', contentClassName)}>
              {!manualDrag && !hideCollapseButton && !!onCollapse && !!childCount && (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    onCollapse?.();
                  }}
                  className={clsx('icon', 'collapse-button', collapsed && 'collapse-button-collapsed')}
                  onMouseEnter={() => setIsDisabledNavigation(true)}
                  onMouseLeave={() => setIsDisabledNavigation(false)}
                >
                  <LeftIcon />
                </span>
              )}
              {clone && childCount && childCount > 1 && (
                <span className={clsx('icon', 'collapse-button', 'collapse-button-collapsed')}>
                  <LeftIcon />
                </span>
              )}
              {isFolder && <span className="icon">{!collapsed && childCount && childCount > 0 ? <FolderOpenIcon /> : <FolderIcon />}</span>}
              {!isFolder && (childCount === 0 || (clone && childCount === 1)) && (
                <span className="icon">
                  <CircleIcon />
                </span>
              )}
              {props.children}
            </div>
            {isFolder && countChildren !== undefined && <span className="count-children">{countChildren}</span>}
            {!clone && (
              <div className="actions">
                <span className="icon icon-dot" onClick={buildOnClick}>
                  <DotIcon />
                </span>
                {depth < (mapIsInFolder({ klass: item.klass, parent }) ? 3 : 2) && !isDeleted && (
                  <span
                    className="icon icon-plus"
                    onClick={() => dialogsRef.current?.openDialog('new')}
                    onMouseEnter={() => setIsDisabledNavigation(true)}
                    onMouseLeave={() => setIsDisabledNavigation(false)}
                  >
                    <PlusIcon />
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </li>
      {renderContextMenu(<MapTreeContextMenu mapInfo={item} isDeleted={isDeleted} dialogsRef={dialogsRef} />)}
      <MapEditorOverlay mapInfo={item} ref={dialogsRef} />
    </MapTreeItemWrapperContainer>
  );
});

MapTreeItemWrapperComponent.displayName = 'MapTreeItemWrapperComponent';

export const MapTreeItemWrapper = MapTreeItemWrapperComponent as <T>(
  p: React.PropsWithChildren<TreeItemComponentProps<T> & React.RefAttributes<HTMLDivElement> & { isDeleted: boolean; countChildren?: number }>
) => React.ReactElement;
