import styled from 'styled-components';
import { Input } from '@components/inputs';
import { DataGrid } from '@components/database/dataBlocks';
import { DarkButton } from '@components/buttons';

export const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;

  & > h3 {
    ${({ theme }) => theme.fonts.titlesHeadline6}
    color: ${({ theme }) => theme.colors.text100};
    margin: 0;
    line-height: 22px;
  }

  & ${Input} {
    width: 240px;
  }
`;

export const TableEmpty = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;

export const DataTextListTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .header:first-child {
    padding: 12px 0 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark18};
    border-top: solid 1px ${({ theme }) => theme.colors.dark18};
  }
`;

export const DataTextGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 56px auto 40px;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }
`;

type DataTextListProps = {
  height: number;
};

export const DataTextList = styled.div<DataTextListProps>`
  height: ${({ height }) => height}px;
  margin-left: -8px;

  & .scrollable-view {
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      margin-bottom: 4px;
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

    & div.line {
      display: grid;
      grid-template-columns: 56px auto 40px;
      grid-gap: 8px;
      align-items: center;
      box-sizing: border-box;
      padding: 4px 4px 4px 8px;
      border-radius: 8px;
      ${({ theme }) => theme.fonts.normalMedium}
      color: ${({ theme }) => theme.colors.text400};

      ${DarkButton} {
        padding: 0;
        visibility: hidden;
      }

      &:hover {
        background-color: ${({ theme }) => theme.colors.dark18};

        ${DarkButton} {
          visibility: visible;
        }
      }
    }
  }
`;
