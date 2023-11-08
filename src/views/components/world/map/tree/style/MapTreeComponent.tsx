import styled from 'styled-components';

export const MapListContainer = styled.div`
  height: calc(100vh - 291px);

  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 3px;

  .map,
  .map-selected {
    :hover {
      background-color: ${({ theme }) => theme.colors.dark20};
    }
  }

  .map-selected {
    background-color: ${({ theme }) => theme.colors.dark20};
    :hover {
      background-color: ${({ theme }) => theme.colors.dark20};
    }
  }

  & .scrollable-view {
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
    .no-maps {
      ${({ theme }) => theme.fonts.normalRegular}
      color: ${({ theme }) => theme.colors.text400};
      padding: 9.5px 15px;
    }
  }
`;

export type MapTreeItemWrapperContainerProps = {
  isCurrent?: boolean;
  hasChildren: boolean;
  maxWidth: number;
  maxWidthWhenHover: number;
  disableHover?: boolean;
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
  margin: 4px 0;
  ${({ theme }) => theme.fonts.normalRegular}

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ theme }) => theme.fonts.normalRegular}
    max-width: ${({ maxWidth }) => `${maxWidth}px`};
  }

  .input-map {
    max-width: ${({ maxWidth }) => `${maxWidth}px`};
  }

  :hover {
    background-color: ${({ theme }) => theme.colors.dark18};
    cursor: auto;

    .left-title {
      .name {
        max-width: ${({ maxWidthWhenHover }) => `${maxWidthWhenHover}px`};
      }
    }
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

  .title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
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
  }

    ${({ theme, disableHover }) =>
      !disableHover &&
      `:hover {
        background-color: ${theme.colors.dark20};

        .count-children {
          display: none;
        }
      }`}
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
`;
