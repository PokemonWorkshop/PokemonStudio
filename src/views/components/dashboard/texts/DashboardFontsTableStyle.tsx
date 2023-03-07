import styled from 'styled-components';
import { DataGrid } from '@components/database/dataBlocks';

export const DataDashboardFontsTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 16px;
  border-bottom: solid 1px ${({ theme }) => theme.colors.dark20};

  .header:first-child {
    padding: 0 0 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark18};
  }
`;

type DataDashboardFontGridProps = {
  isAlternative: boolean;
};

export const DataDashboardFontGrid = styled(DataGrid).attrs<DataDashboardFontGridProps>((props) => ({
  'data-is-alternative': props.isAlternative ? true : undefined,
}))<DataDashboardFontGridProps>`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 58px 160px 65px 124px auto;
  align-items: center;

  &[data-is-alternative] {
    grid-template-columns: 58px 65px 124px auto;
  }

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }

  & .size,
  & .line-height {
    text-align: right;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    & .line-height {
      display: none;
    }

    &[data-is-alternative] {
      & .line-height {
        display: block;
      }
    }
  }
`;

export const TableEmpty = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;

export const DashboardFontsTableWithButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  & .table-buttons {
    display: flex;
    justify-content: space-between;
  }
`;
