import styled from 'styled-components';

type TreeContainerProps = {
  hideMapTree: boolean;
  isTiledMode: boolean;
};

export const TreeContainer = styled.div<TreeContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .tree-scrollbar {
    overflow-y: scroll;
    margin-right: -9px;
    height: calc(100vh - ${({ isTiledMode }) => (isTiledMode ? '253px' : '313px')});
    display: ${({ hideMapTree }) => (hideMapTree ? 'none' : 'block')};

    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.dark12};
      opacity: 0.8;
      box-sizing: border-box;
      border: 1px solid ${({ theme }) => theme.colors.text500};
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: ${({ theme }) => theme.colors.dark15};
      border-color: ${({ theme }) => theme.colors.text400};
    }
  }

  .tree {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .research-input {
    height: 35px;
  }
`;

type MapTreeItemWrapperContainerProps = {
  isCurrent?: boolean;
  hasChildren: boolean;
  disableHover?: boolean;
  isUnderOpenFolder: boolean;
};

export const TreeItemContainer = styled.div<MapTreeItemWrapperContainerProps>`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  height: 35px;
  padding: 0px 8px;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text100};
  box-sizing: border-box;
  margin: ${({ isUnderOpenFolder }) => (isUnderOpenFolder ? '12px 0 4px 0' : '4px 0')};
  cursor: default !important;
  ${({ theme }) => theme.fonts.normalRegular}
  width: 100%;
  max-width: 100%;

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ theme }) => theme.fonts.normalRegular}
    flex: 1;
    min-width: 0;
  }

  .error {
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  .input-tree {
    flex: 1;
    min-width: 0;
    height: 31px;
  }

  .input-tree-folder {
    flex: 1;
    min-width: 0;
    height: 31px;
  }

  :hover {
    background-color: ${({ theme }) => theme.colors.dark18};
    cursor: auto;
  }

  .left-icons {
    display: flex;
    gap: 8px;
  }

  .icon {
    display: flex;
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.text400};
    align-items: center;
    justify-content: center;
    border-radius: 2px;
  }

  .point-icon {
    width: 2px;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.text400};
    border-radius: 100%;
  }

  .title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .collapse-button {
    transform: rotate(-90deg);
    transition: transform 250ms ease;
    cursor: pointer;

    :hover {
      background-color: ${({ theme }) => theme.colors.dark22};
    }
  }

  .collapse-button-collapsed {
    transform: rotate(-180deg);
  }

  .count-children {
    display: flex;
    height: 18px;
    padding: 2px 4px;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryBase};
    flex-shrink: 0;
  }

  ${({ theme, disableHover }) =>
    !disableHover &&
    `:hover {
        background-color: ${theme.colors.dark20};

        .count-children {
          display: none;
        }
      }`}

  .actions {
    display: none;
    flex-shrink: 0;

    .icon-plus {
      :hover {
        background-color: ${({ theme }) => theme.colors.primarySoft};
        color: ${({ theme }) => theme.colors.primaryBase};
        cursor: pointer;
      }
    }

    .icon-dot {
      :hover {
        background-color: ${({ theme }) => theme.colors.dark22};
        cursor: pointer;
      }
    }
  }

  :hover {
    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;
