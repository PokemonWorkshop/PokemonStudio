import styled, { keyframes } from 'styled-components';
import { DataGrid } from '@components/database/dataBlocks';

export const DataMoveTable = styled.div`
  display: flex;
  flex-direction: column;
  .header:first-child {
    padding: 0 0 12px 4px;
    margin-bottom: 4px;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark18};
  }
`;

export const ScrollableContent = styled.div`
  height: 100vh;
  max-height: calc(100vh - 505px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    margin: 4px 0;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.dark12};
    opacity: 0.8;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.text500};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => props.theme.colors.dark15};
    border: 1px solid ${(props) => props.theme.colors.text400};
  }
`;

export const DataMoveGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 280px 75px 75px 49px 87px 82px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;

    .delete {
      display: flex;
    }
  }

  & span:nth-child(4),
  & span:nth-child(5),
  & span:nth-child(6) {
    text-align: right;
  }

  .delete:nth-child(7) {
    display: none;
    justify-content: end;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 256px 75px auto;

    & span:nth-child(3),
    & span:nth-child(4),
    & span:nth-child(5),
    & span:nth-child(6) {
      display: none;
    }
  }
`;

export const NoMoveFound = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;

export const RenderMoveContainer = styled(DataMoveGrid)`
  box-sizing: border-box;
  height: 48px;
  padding: 0 4px 0 4px;
  margin: 0 -4px 0 0;
`;

export const AddMoveContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

export const LastAddedMovesContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-top: 8px;

  .last-added-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-left: 4px;

    color: ${({ theme }) => theme.colors.primaryBase};
    ${({ theme }) => theme.fonts.normalRegular};
  }

  .last-added-header::after {
    content: '';
    flex: 1;
    border-top: 1px solid ${({ theme }) => theme.colors.dark18};
  }
`;

const highlightAnimation = keyframes`
  0%, 50%, 100% {
    background-color: transparent;
  }
  25%, 75% {
    background-color: var(--highlight-color);
  }
`;

export const HighlightWrapper = styled.div<{ shouldHighlight: boolean }>`
  --highlight-color: ${({ theme }) => theme.colors.primaryBase};

  border-radius: 8px;
  animation: ${({ shouldHighlight }) => (shouldHighlight ? highlightAnimation : 'none')} 2s ease-in-out;
`;
