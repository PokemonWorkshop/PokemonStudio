import { DataGrid } from '@components/database/dataBlocks';
import styled from 'styled-components';

export const DataQuestTable = styled.div`
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

type DataGoalGridProps = {
  dragOn: boolean;
};

export const DataGoalGrid = styled(DataGrid).attrs<DataGoalGridProps>((props) => ({
  'data-drag-off': !props.dragOn ? true : undefined,
}))<DataGoalGridProps>`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 18px 25px 192px 104px 457px auto;
  align-items: center;

  &[data-drag-off] {
    &:hover:not(.header) {
      background-color: ${({ theme }) => theme.colors.dark14};
      color: ${({ theme }) => theme.colors.text100};
      border-radius: 8px;
    }
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 18px 25px 160px 104px auto;

    & span:nth-child(4) {
      display: none;
    }
  }
`;

export const DataEarningGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 140px 88px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark14};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }
`;
