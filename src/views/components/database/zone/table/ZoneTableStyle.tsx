import { DataGrid } from '@components/database/dataBlocks';
import styled from 'styled-components';

export const DataZoneGroupsTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .header:first-child {
    padding: 0 0 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark14};
  }
`;

export const TableEmpty = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;

type DataGroupGridProps = {
  dragOn: boolean;
};

export const DataGroupGrid = styled(DataGrid).attrs<DataGroupGridProps>((props) => ({
  'data-drag-off': !props.dragOn ? true : undefined,
}))<DataGroupGridProps>`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 18px 192px 144px 450px auto;
  align-items: center;

  &[data-drag-off] {
    &:hover:not(.header) {
      background-color: ${({ theme }) => theme.colors.dark14};
      color: ${({ theme }) => theme.colors.text100};
      border-radius: 8px;
    }
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 18px 160px 144px 100px auto;

    & .environment {
      display: none;
    }
  }
`;
