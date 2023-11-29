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
