import styled from 'styled-components';

type MapTreeItemWrapperContainerProps = {
  isCurrent: boolean;
  hasChildren: boolean;
  maxWidth: number;
  maxWidthWhenHover: number;
};

export const MapTreeItemWrapperContainer = styled.div<MapTreeItemWrapperContainerProps>`
  .wrapper {
    list-style: none;
    box-sizing: border-box;
    margin-bottom: -1px;
  }

  .tree-item {
    display: flex;
    align-items: center;
    height: 35px;
    padding: 0px 8px 0px 8px;
    box-sizing: border-box;
    justify-content: space-between;
    ${({ theme }) => theme.fonts.normalRegular}

    .title.map {
      display: flex;
      gap: 4px;

      .name {
        max-width: ${({ maxWidth }) => `${maxWidth}px`};
      }
    }

    .title.folder {
      display: flex;
      gap: 8px;
      background-color: unset;

      .name {
        max-width: ${({ hasChildren }) => (hasChildren ? '140px' : '164px')};
      }
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

    .count-children {
      display: flex;
      height: 18px;
      padding: 2px 4px;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      background-color: ${({ theme }) => theme.colors.primarySoft};
      color: ${({ theme }) => theme.colors.primaryBase};
    }

    .actions {
      display: none;

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

    .name {
      display: inline-block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .error {
      color: ${({ theme }) => theme.colors.dangerBase};
    }

    :hover {
      .actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .title.map {
        .name {
          max-width: ${({ maxWidthWhenHover }) => `${maxWidthWhenHover}px`};
        }
      }
      .title.folder {
        .name {
          max-width: ${({ hasChildren }) => (hasChildren ? '122px' : '146px')};
        }
      }
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
  }

  .folder {
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.dark18};

    .title {
      display: flex;
      gap: 8px;
    }

    :hover {
      background-color: ${({ theme }) => theme.colors.dark20};

      .count-children {
        display: none;
      }
    }
  }

  .map {
    border-radius: 8px;
    ${({ theme, isCurrent }) => isCurrent && `background-color: ${theme.colors.dark20};`}

    :hover {
      background-color: ${({ theme }) => theme.colors.dark20};
    }
  }

  .clone > .tree-item {
    height: 35px;
    background-color: ${({ theme }) => theme.colors.dark20};
  }

  .ghost {
    background-color: ${({ theme }) => theme.colors.primaryBase};
    height: 2px;
    border-radius: 2px;
  }

  .disable-selection {
    user-select: none;
    -webkit-user-select: none;
  }

  .disable-interaction {
    pointer-events: none;
  }
`;
